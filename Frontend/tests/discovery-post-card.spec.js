import { test, expect } from '@playwright/test'

const post = {
  id: '507f1f77bcf86cd799439021', title: 'The Case for Slower Digital Mornings',
  abstract: 'A practical guide to making room for curiosity and thoughtful reading.',
  excerpt: 'A practical guide to making room for curiosity and thoughtful reading.',
  image: '/logo/logo-dark-profile.png', tags: ['science', 'travel', 'everyday curiosity'],
  author: { username: 'Leila Noor', handle: 'leila-noor' },
  createdAt: '2026-09-08T00:00:00Z', readTime: '1 min read',
  likesCount: 30, commentsCount: 0, isLiked: false,
}

async function mockApi(page, { signedIn = true, failLike = false, article = post } = {}) {
  await page.route(url => url.pathname.startsWith('/api/'), route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/auth/refresh-token') return route.fulfill({ status: signedIn ? 200 : 401, json: signedIn ? { accessToken: 'card-test-token', user: 'Reader', email: 'reader@example.test', role: 'regular' } : { message: 'Signed out' } })
    if (path === '/api/search') return route.fulfill({ json: { data: { posts: [article], writers: [], shorts: [] } } })
    if (path === '/api/post/shorts' || path === '/api/post/feed') return route.fulfill({ json: { data: [article], meta: { nextCursor: null } } })
    if (path.endsWith('/like')) {
      const isLiked = route.request().method() === 'PUT'
      return route.fulfill({ status: failLike ? 500 : 200, json: failLike ? { message: 'Try again' } : { isLiked, likesCount: isLiked ? 31 : 30 } })
    }
    if (path.endsWith('/comments')) return route.fulfill({ json: route.request().method() === 'POST' ? { data: { id: 'comment-1', content: route.request().postDataJSON().text, author: { name: 'Reader' }, createdAt: '2026-10-06T00:00:00Z' } } : { data: [], meta: { nextCursor: null } } })
    return route.fulfill({ json: { data: [], meta: { nextCursor: null } } })
  })
}

for (const width of [320, 390, 1280]) {
  for (const image of [post.image, null]) {
    test(`post card click destinations remain independent at ${width}px (${image ? 'cover' : 'text only'})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await mockApi(page, { article: { ...post, image } })
      const origin = '/search?q=mornings'
      const card = page.getByRole('article').first()
      const clickArea = async locator => {
        await locator.scrollIntoViewIfNeeded()
        const box = await locator.boundingBox()
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      }
      for (const target of [
        () => card.getByRole('link', { name: "View Leila Noor's profile" }),
        () => card.getByText('8 September 2026', { exact: true }),
        () => card.getByText(post.readTime, { exact: true }),
      ]) {
        await page.goto(origin)
        await expect(card.getByRole('heading', { name: post.title })).toBeVisible()
        await clickArea(target())
        await expect(page).toHaveURL('/author/leila-noor')
      }
      await page.goto(origin)
      const category = card.getByRole('link', { name: 'everyday curiosity', exact: true })
      await expect(category).toHaveAttribute('href', '/search?q=everyday%20curiosity')
      const searchRequest = page.waitForRequest(request => {
        const url = new URL(request.url())
        return url.pathname === '/api/search' && url.searchParams.get('q') === 'everyday curiosity' && url.searchParams.get('type') === 'posts'
      })
      await category.click()
      await searchRequest
      await expect(page).toHaveURL(/\/search\?q=everyday%20curiosity$/)
      for (const target of [
        () => card.getByText(post.excerpt, { exact: true }),
        () => card.getByRole('heading', { name: post.title }),
        ...(image ? [() => card.getByRole('link', { name: `Read ${post.title}`, exact: true })] : []),
      ]) {
        await page.goto(origin)
        await expect(card.getByRole('heading', { name: post.title })).toBeVisible()
        await clickArea(target())
        await expect(page).toHaveURL(`/post/${post.id}`)
      }
      await page.goto(origin)
      await expect(card.getByRole('heading', { name: post.title })).toBeVisible()
      await card.scrollIntoViewIfNeeded()
      const box = await card.boundingBox()
      await page.mouse.click(box.x + box.width - 3, box.y + box.height - 3)
      await expect(page).toHaveURL(`/post/${post.id}`)
      await page.goto(origin)
      const titleLink = card.getByRole('link', { name: post.title, exact: true })
      await titleLink.focus()
      await titleLink.press('Enter')
      await expect(page).toHaveURL(`/post/${post.id}`)
    })
  }
}

test('grid author links and remaining card area keep distinct destinations', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')
  const section = page.locator('section').filter({ has: page.getByRole('heading', { name: "Writer's picks", exact: true }) }).last()
  await section.scrollIntoViewIfNeeded()
  await section.getByRole('link', { name: "View Leila Noor's profile" }).click()
  await expect(page).toHaveURL('/author/leila-noor')
  await page.goto('/')
  const card = section.getByRole('article').first()
  await card.scrollIntoViewIfNeeded()
  const box = await card.boundingBox()
  await page.mouse.click(box.x + 3, box.y + box.height - 3)
  await expect(page).toHaveURL(`/post/${post.id}`)
})

test('short-card category and background preserve search and modal destinations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await mockApi(page)
  await page.route(`**/api/post/${post.id}`, route => route.fulfill({ json: { postData: { ...post, _id: post.id, body: JSON.stringify([{ id: 'text', type: 'text', content: post.excerpt }]) } } }))
  await page.goto('/shorts')
  const card = page.getByRole('article').first()
  await card.getByRole('link', { name: 'science', exact: true }).click()
  await expect(page).toHaveURL('/search?q=science')
  await page.goto('/shorts')
  await card.getByText(post.excerpt, { exact: true }).scrollIntoViewIfNeeded()
  const excerpt = await card.getByText(post.excerpt, { exact: true }).boundingBox()
  await page.mouse.click(excerpt.x + excerpt.width / 2, excerpt.y + excerpt.height / 2)
  await expect(page.getByRole('dialog', { name: post.title, exact: true })).toBeVisible()
  await expect(page).toHaveURL('/shorts')
  await page.getByRole('button', { name: 'Close short read' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

for (const width of [320, 350, 390, 767, 768, 1280]) {
  test(`card actions, comment modal, and menu fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await mockApi(page)
    await page.goto('/search?q=mornings')
    const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: post.title, exact: true }) }).first()
    const like = card.getByRole('button', { name: `Appreciate ${post.title}`, exact: true })
    const comments = card.getByRole('button', { name: `Comments on ${post.title}` })
    await expect(like).toHaveText('30')
    await expect(comments).toHaveText('0')
    const assertBounds = async () => {
      for (const element of [card, like, comments, ...await card.locator('a[href^="/search?q="]').all()]) {
        const box = await element.boundingBox()
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(width)
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    }
    await assertBounds()
    const metadata = await card.getByText('8 September 2026', { exact: true }).boundingBox()
    const heading = await card.getByRole('heading', { name: post.title, exact: true }).boundingBox()
    expect(heading.y - metadata.y - metadata.height).toBeGreaterThanOrEqual(19)
    await expect(like).toHaveCSS('border-top-width', '1px')
    await expect(comments).toHaveCSS('border-top-width', '1px')
    if (width < 768) {
      const cover = await card.getByRole('link', { name: `Read ${post.title}`, exact: true }).boundingBox()
      const excerpt = await card.getByText(post.excerpt, { exact: true }).boundingBox()
      const tags = card.locator('a[href^="/search?q="]')
      expect(cover.y).toBeGreaterThanOrEqual(excerpt.y + excerpt.height + 15)
      expect((await like.boundingBox()).y).toBeGreaterThanOrEqual(cover.y + cover.height + 11)
      for (const tag of await tags.all()) {
        const box = await tag.boundingBox()
        expect(box.x + box.width).toBeLessThanOrEqual((await like.boundingBox()).x - 8)
      }
    }
    if (width === 350) await card.screenshot({ path: 'test-results/discovery-card-mobile.png' })
    await like.click()
    const unlike = card.getByRole('button', { name: `Remove appreciation from ${post.title}` })
    await expect(unlike).toHaveAttribute('aria-pressed', 'true')
    await expect(unlike).toHaveText('31')
    await unlike.click()
    await expect(like).toHaveText('30')
    const before = await card.boundingBox()
    await comments.click()
    const dialog = page.getByRole('dialog', { name: 'Comments', exact: true })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Close comments' })).toBeFocused()
    await expect(card.getByRole('textbox', { name: 'Add a comment' })).toHaveCount(0)
    expect((await card.boundingBox()).height).toBe(before.height)
    await expect(comments).toHaveAttribute('aria-expanded', 'true')
    await dialog.getByRole('textbox', { name: 'Add a comment' }).fill('A thoughtful morning read.')
    await assertBounds()
    await dialog.getByRole('button', { name: 'Comment', exact: true }).click()
    await expect(dialog.getByText('A thoughtful morning read.', { exact: true })).toBeVisible()
    await expect(comments).toHaveText('1')
    await page.keyboard.press('Escape')
    await expect(comments).toBeFocused()
    await expect(card.getByRole('textbox', { name: 'Add a comment' })).toHaveCount(0)
    const trigger = card.getByRole('button', { name: `More options for ${post.title}` })
    await trigger.click()
    const menu = page.getByRole('menu', { name: `Options for ${post.title}` })
    await expect(menu.getByRole('menuitem', { name: 'Appreciate story' })).toHaveCount(0)
    for (const item of await menu.getByRole('menuitem').all()) await expect(item.locator('svg')).toHaveCount(1)
    await expect(menu.getByRole('menuitem', { name: 'Save story' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
  })
}

test('failed appreciation restores count and pressed state', async ({ page }) => {
  await mockApi(page, { failLike: true })
  await page.goto('/search?q=mornings')
  const like = page.getByRole('button', { name: `Appreciate ${post.title}`, exact: true })
  await like.click()
  await expect(page.getByText('The appreciation could not be updated.')).toBeVisible()
  await expect(like).toHaveText('30')
  await expect(like).toHaveAttribute('aria-pressed', 'false')
})

test('guest card actions preserve sign-in and public comment access', async ({ page }) => {
  await mockApi(page, { signedIn: false })
  await page.goto('/search?q=mornings')
  await page.getByRole('button', { name: `Comments on ${post.title}` }).click()
  await expect(page.getByText('Sign in to join the conversation.')).toBeVisible()
  await page.getByRole('button', { name: 'Close comments' }).click()
  await page.getByRole('button', { name: `Appreciate ${post.title}`, exact: true }).click()
  await expect(page).toHaveURL(/\/login/)
})

test('short-card actions do not open the reading modal', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await mockApi(page)
  await page.goto('/shorts')
  await page.getByRole('button', { name: `Comments on ${post.title}` }).click()
  await expect(page.getByRole('textbox', { name: 'Add a comment' })).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Comments', exact: true })).toBeVisible()
  await page.getByRole('textbox', { name: 'Add a comment' }).fill('Short and useful.')
  await page.getByRole('button', { name: 'Comment', exact: true }).click()
  await expect(page.getByText('Short and useful.', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('grid cards expose direct actions and distinct comment modals', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')
  await page.getByRole('heading', { name: "Writer's picks", exact: true }).scrollIntoViewIfNeeded()
  const section = page.locator('section').filter({ has: page.getByRole('heading', { name: "Writer's picks", exact: true }) }).last()
  const comments = section.getByRole('button', { name: `Comments on ${post.title}` })
  await comments.click()
  await expect(page.getByRole('dialog', { name: 'Comments', exact: true }).getByRole('textbox', { name: 'Add a comment' })).toBeVisible()
  await expect(section.getByRole('button', { name: `Appreciate ${post.title}`, exact: true })).toBeVisible()
  const panelId = await comments.getAttribute('aria-controls')
  expect(await page.evaluate(id => [...document.querySelectorAll('[id]')].filter(node => node.id === id).length, panelId)).toBe(1)
})

test('long mobile metadata and expanded menu fit in dark mode', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await mockApi(page)
  await page.addInitScript(() => localStorage.setItem('ink-theme', 'dark'))
  await page.route('**/api/search?**', route => route.fulfill({ json: { data: { posts: [{ ...post, title: 'Mornings'.repeat(12), tags: ['curiosity'.repeat(12)], author: { ...post.author, username: 'Leila'.repeat(20) } }], writers: [], shorts: [] } } }))
  await page.goto('/search?q=mornings')
  await expect(page.locator('html')).toHaveClass(/dark/)
  const card = page.getByRole('article').first()
  await card.getByRole('button', { name: /More options/ }).click()
  await page.getByRole('menu', { name: `Options for ${'Mornings'.repeat(12)}` }).getByRole('menuitem', { name: 'Why you’re seeing this' }).click()
  const menu = page.getByRole('menu', { name: `Options for ${'Mornings'.repeat(12)}` })
  const box = await menu.boundingBox()
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(320)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/discovery-card-dark-menu.png' })
})

for (const size of [{ width: 320, height: 420 }, { width: 1280, height: 720 }]) {
  test(`comment modal scrolls through all pages and contains focus at ${size.width}px`, async ({ page }) => {
    await page.setViewportSize(size)
    await mockApi(page)
    await page.route('**/api/post/*/comments**', route => {
      const next = new URL(route.request().url()).searchParams.has('cursor')
      return route.fulfill({ json: { data: Array.from({ length: next ? 1 : 12 }, (_, i) => ({ id: `${next}-${i}`, content: next ? 'Last comment in the thread' : `Existing comment ${i + 1}`, author: { name: 'Reader' }, createdAt: '2026-10-06T00:00:00Z' })), meta: { nextCursor: next ? null : 'next-page' } } })
    })
    await page.goto('/search?q=mornings')
    const trigger = page.getByRole('button', { name: `Comments on ${post.title}` })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Comments', exact: true })
    const panel = await dialog.locator('section').first().boundingBox()
    expect(panel.x).toBeGreaterThanOrEqual(0)
    expect(panel.x + panel.width).toBeLessThanOrEqual(size.width)
    expect(panel.y).toBeGreaterThanOrEqual(0)
    expect(panel.y + panel.height).toBeLessThanOrEqual(size.height)
    const close = dialog.getByRole('button', { name: 'Close comments' })
    await expect(close).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    const more = dialog.getByRole('button', { name: 'Load more comments' })
    await expect(more).toBeFocused()
    await more.click()
    await expect(dialog.getByText('Last comment in the thread')).toBeVisible()
    await expect(more).toHaveCount(0)
    await close.scrollIntoViewIfNeeded()
    if (size.width === 320) await page.screenshot({ path: 'test-results/comments-modal-mobile.png' })
    await close.click()
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await trigger.click()
    await dialog.click({ position: { x: 2, y: 2 } })
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
}
