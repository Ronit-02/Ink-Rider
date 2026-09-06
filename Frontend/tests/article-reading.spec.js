import { test, expect } from '@playwright/test'

const postId = '507f1f77bcf86cd799439012'
const postData = {
  _id: postId,
  title: 'A calmer way to test reading interfaces',
  body: JSON.stringify([{ id: 'block-1', type: 'text', content: 'A short article body for deterministic browser coverage.' }]),
  coverImage: null,
  tags: ['testing'],
  likesCount: 0,
  commentsCount: 0,
  isLiked: false,
  isBookmarked: false,
  createdAt: '2026-08-24T08:00:00.000Z',
  readTime: '1 min read',
  author: {
    _id: '507f1f77bcf86cd799439011',
    username: 'Maya Sen',
    handle: 'maya-sen',
    picture: null,
    bio: 'Essays on cities, memory, and public life.',
  },
  seriesContext: {
    id: 'series-1',
    title: 'A calmer way to read',
    position: 1,
    total: 3,
    previous: { id: '507f1f77bcf86cd799439010' },
    next: { id: '507f1f77bcf86cd799439013' },
  },
  depthContext: {
    deeper: { id: '507f1f77bcf86cd799439014', title: 'The longer version' },
  },
}

test('article progress and sharing preserve keyboard reading access', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === `/api/post/${postId}` && request.method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ postData }) })
    }
    if (url.pathname === `/api/post/${postId}/comments`) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { nextCursor: null } }) })
    }
    if (url.pathname === '/api/v1/events') {
      return route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ data: null }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`/post/${postId}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: postData.title, level: 1 })).toBeVisible()
  await expect(page.getByRole('article', { name: 'Article body' })).toBeVisible()
  await expect(page.locator('[data-reading-body="long-form"] p').first()).toHaveCSS('font-size', '17px')

  const previous = page.getByRole('link', { name: '← Previous' })
  const next = page.getByRole('link', { name: 'Next →' })
  await expect(previous).toBeVisible()
  await expect(next).toBeVisible()
  expect((await previous.boundingBox())?.height).toBeGreaterThanOrEqual(40)
  expect((await next.boundingBox())?.height).toBeGreaterThanOrEqual(40)

  const progress = page.locator('[data-reading-progress="true"]')
  await expect(progress).toBeVisible()
  await expect(progress).toHaveAttribute('aria-hidden', 'true')
  await expect(page.getByRole('progressbar')).toHaveCount(0)

  const shareTrigger = page.getByRole('button', { name: 'Share this article' })
  await shareTrigger.click()
  const shareMenu = page.getByRole('menu', { name: 'Share article' })
  const copyLink = shareMenu.getByRole('menuitem', { name: 'Copy Link' })
  const shareOnX = shareMenu.getByRole('menuitem', { name: 'Share on X' })
  await expect(shareMenu).toBeVisible()
  await expect(copyLink).toBeFocused()

  await copyLink.press('ArrowDown')
  await expect(shareOnX).toBeFocused()
  await shareOnX.press('Escape')
  await expect(shareMenu).toBeHidden()
  await expect(shareTrigger).toHaveAttribute('aria-expanded', 'false')
  await expect(shareTrigger).toBeFocused()

  const hasHorizontalOverflow = await page.evaluate(() => (
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  ))
  expect(hasHorizontalOverflow).toBe(false)
})

test('published articles expose crawlable canonical, social, and structured metadata', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === `/api/post/${postId}` && request.method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ postData }) })
    }
    if (url.pathname === `/api/post/${postId}/comments`) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { nextCursor: null } }) })
    }
    if (url.pathname === '/api/v1/events') {
      return route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ data: null }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.goto(`/post/${postId}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: postData.title, level: 1 })).toBeVisible()

  const expectedDescription = 'A short article body for deterministic browser coverage.'
  const origin = new URL(page.url()).origin
  await expect(page).toHaveTitle(`${postData.title} · Ink-Rider`)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', expectedDescription)
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', postData.title)
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', expectedDescription)
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article')
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${origin}/post/${postId}`)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${origin}/post/${postId}`)

  const structured = await page.locator('script[type="application/ld+json"]').evaluate(node => JSON.parse(node.textContent))
  expect(structured).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: postData.title,
    description: expectedDescription,
    author: { '@type': 'Person', name: postData.author.username, url: `${origin}/author/maya-sen` },
    mainEntityOfPage: `${origin}/post/${postId}`,
  })
})

test('signed-in comment composer exposes field guidance and form semantics', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'article-test-token',
          user: 'Priya Mehta',
          email: 'member@inkrider.local',
          role: 'regular',
        }),
      })
    }
    if (url.pathname === '/api/v1/notifications') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { unreadCount: 0 } }) })
    }
    if (url.pathname === `/api/post/${postId}` && request.method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ postData }) })
    }
    if (url.pathname === `/api/post/${postId}/comments`) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { nextCursor: null } }) })
    }
    if (url.pathname === '/api/v1/events') {
      return route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ data: null }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`/post/${postId}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: postData.title, level: 1 })).toBeVisible()

  const comment = 'A keyboard-ready comment.'
  const commentInput = page.getByLabel('Add a comment')
  await expect(commentInput).toBeVisible()
  await expect(commentInput).toHaveAttribute('required', '')
  await expect(commentInput).toHaveAttribute('aria-describedby', /-comment-count$/)
  await commentInput.fill(comment)
  await expect(page.getByText(`${comment.length}/1000`, { exact: true })).toBeVisible()
  await expect.poll(() => commentInput.evaluate(element => getComputedStyle(element).outlineColor)).toBe('rgb(25, 25, 25)')
  await expect.poll(() => commentInput.evaluate(element => getComputedStyle(element).outlineStyle)).toBe('none')
  await expect.poll(() => commentInput.evaluate(element => getComputedStyle(element).boxShadow)).toBe('none')

  const submitButton = page.getByRole('button', { name: 'Comment', exact: true })
  await expect(submitButton).toHaveAttribute('type', 'submit')
  await expect(submitButton).toBeEnabled()

  const hasHorizontalOverflow = await page.evaluate(() => (
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  ))
  expect(hasHorizontalOverflow).toBe(false)
})

test('rich blocks render hostile text as inert content and reject unsafe image URLs', async ({ page }) => {
  const hostilePost = {
    ...postData,
    title: 'Safe rich-block rendering',
    body: JSON.stringify([
      { id: 'text-xss', type: 'text', content: '<img src=x onerror="window.__inkRiderXss=1">' },
      { id: 'heading-xss', type: 'h2', content: '<script>window.__inkRiderXss=2</script>' },
      { id: 'image-xss', type: 'image', content: 'javascript:alert(1)', alt: 'Unsafe image fallback' },
    ]),
  }

  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === `/api/post/${postId}` && request.method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ postData: hostilePost }) })
    }
    if (url.pathname === `/api/post/${postId}/comments`) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { nextCursor: null } }) })
    }
    if (url.pathname === '/api/v1/events') {
      return route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ data: null }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.goto(`/post/${postId}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: hostilePost.title, level: 1 })).toBeVisible()
  await expect(page.getByText('<img src=x onerror="window.__inkRiderXss=1">', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: '<script>window.__inkRiderXss=2</script>', level: 2 })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Unsafe image fallback' })).toBeVisible()
  await expect(page.getByRole('main').locator('script')).toHaveCount(0)
  await expect(page.getByRole('main').locator('img[src^="javascript:"]')).toHaveCount(0)
  expect(await page.evaluate(() => window.__inkRiderXss)).toBeUndefined()
})

test('failed cover images keep the article media slot readable', async ({ page }) => {
  const imagePost = {
    ...postData,
    coverImage: '/fixtures/missing-cover.jpg',
  }

  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === `/api/post/${postId}` && request.method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ postData: imagePost }) })
    }
    if (url.pathname === `/api/post/${postId}/comments`) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { nextCursor: null } }) })
    }
    if (url.pathname === '/api/v1/events') {
      return route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ data: null }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.route('**/fixtures/missing-cover.jpg', route => route.fulfill({ status: 404, body: '' }))
  await page.goto(`/post/${postId}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: imagePost.title, level: 1 })).toBeVisible()
  await expect(page.getByText('Text-only story', { exact: true })).toBeVisible()
  await expect(page.locator('img[src="/fixtures/missing-cover.jpg"]')).toHaveCount(0)
})
