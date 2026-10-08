import { test, expect } from '@playwright/test'

const postId = '507f1f77bcf86cd799439012'
const post = {
  _id: postId, title: 'The Case for Slower Digital Mornings',
  body: JSON.stringify([{ id: 'text', type: 'text', content: 'Take time to read and reflect before starting the day.' }]),
  coverImage: null, tags: ['science', 'travel'], likesCount: 30, commentsCount: 0,
  createdAt: '2026-09-08T08:00:00Z', readTime: '5 mins', isLiked: false, isBookmarked: false,
  author: { _id: '507f1f77bcf86cd799439011', username: 'Leila Noor', handle: 'leila-noor', picture: null },
}

async function mockArticle(page, { member = true, capabilities = [], longName = false } = {}) {
  await page.route(url => url.pathname.startsWith('/api/'), route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/auth/refresh-token') return route.fulfill(member
      ? { json: { accessToken: 'layout-test', user: 'Reader', email: 'reader@example.test', role: 'regular' } }
      : { status: 401, json: { message: 'Signed out' } })
    if (path === `/api/post/${postId}`) return route.fulfill({ json: { postData: { ...post, author: { ...post.author, username: longName ? 'Leila Noor With A Longer Writer Name' : post.author.username } } } })
    if (path === '/api/v1/me/entitlements') return route.fulfill({ json: { data: { capabilities } } })
    if (path.endsWith('/summary')) return route.fulfill({ json: { data: { points: ['A calmer start to the morning.'], disclosure: 'Generated overview of this article revision.' } } })
    return route.fulfill({ json: { data: [], meta: { nextCursor: null, unreadCount: 0 } } })
  })
}

for (const width of [320, 390, 768, 1023, 1280]) {
  test(`post header and reading tools fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await mockArticle(page)
    await page.goto(`/post/${postId}`)
    const main = page.getByRole('main')
    const title = main.getByRole('heading', { name: post.title, level: 1 })
    const author = main.getByRole('link', { name: "View Leila Noor's profile" })
    const date = main.getByText('8 September 2026', { exact: false }).first()
    const actions = main.getByRole('button', { name: 'Appreciate this article' })
    const tools = main.getByRole('group', { name: 'Article tools' })
    await expect(title).toBeVisible()
    const authorBox = await author.boundingBox()
    const dateBox = await date.boundingBox()
    const actionBox = await actions.boundingBox()
    const toolsBox = await tools.boundingBox()
    expect(authorBox.width).toBeGreaterThan(90)
    expect(authorBox.height).toBeLessThan(40)
    expect(dateBox.height).toBeLessThan(25)
    if (width < 1024) {
      expect(dateBox.y).toBeGreaterThanOrEqual(authorBox.y + authorBox.height)
      expect(actionBox.y).toBeGreaterThanOrEqual(dateBox.y + dateBox.height)
      expect(toolsBox.y).toBeGreaterThanOrEqual(actionBox.y + actionBox.height)
      expect(toolsBox.y).toBeGreaterThan((await title.boundingBox()).y)
      await expect(tools.getByText('Article overview', { exact: true })).toBeVisible()
      expect((await tools.getByRole('button', { name: 'Read aloud' }).boundingBox()).height).toBeGreaterThanOrEqual(44)
    } else {
      expect(toolsBox.x).toBeGreaterThan((await title.boundingBox()).x + (await title.boundingBox()).width)
    }
    if (width === 390) await page.screenshot({ path: 'test-results/post-detail-mobile.png' })
    await tools.getByRole('button', { name: 'Article overview' }).click()
    await expect(main.getByText('Member feature', { exact: true })).toBeVisible()
    if (width < 1024) {
      const panel = await main.getByText('Member feature', { exact: true }).boundingBox()
      const body = await main.getByRole('article', { name: 'Article body' }).boundingBox()
      expect(panel.y).toBeGreaterThan(toolsBox.y)
      expect(panel.y).toBeLessThan(body.y)
    }
    await tools.getByRole('button', { name: 'Read aloud' }).click()
    await expect(main.getByText(/Read aloud is included/)).toBeVisible()
    await expect(main.getByText(/Article overviews is included/)).toHaveCount(0)
    expect(await main.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(false)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
  })
}

test('entitled tools stay inline on mobile and move to the desktop rail on resize', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await mockArticle(page, { capabilities: ['article_summary', 'read_aloud'], longName: true })
  await page.addInitScript(() => localStorage.setItem('ink-theme', 'dark'))
  await page.goto(`/post/${postId}`)
  const tools = page.getByRole('group', { name: 'Article tools' })
  await tools.getByRole('button', { name: 'Article overview' }).click()
  await expect(page.getByText('A calmer start to the morning.')).toBeVisible()
  await expect(page.getByText('Generated overview of this article revision.')).toBeVisible()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.screenshot({ path: 'test-results/post-detail-dark.png' })
  await tools.getByRole('button', { name: 'Read aloud' }).click()
  await expect(page.getByText('Browser read aloud')).toBeVisible()
  await expect(page.getByText('A calmer start to the morning.')).toHaveCount(0)
  expect(await page.getByRole('main').evaluate(node => node.scrollWidth > node.clientWidth)).toBe(false)
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(tools).toHaveCount(1)
  await expect(page.getByText('Browser read aloud')).toHaveCount(1)
  await page.setViewportSize({ width: 390, height: 900 })
  await expect(page.getByText('Browser read aloud')).toHaveCount(1)
  await tools.getByRole('button', { name: 'Read aloud' }).click()
  await expect(page.getByText('Browser read aloud')).toHaveCount(0)
})

test('guest article tools preserve the sign-in flow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await mockArticle(page, { member: false })
  await page.goto(`/post/${postId}`)
  await page.getByRole('button', { name: 'Article overview', exact: true }).click()
  await expect(page).toHaveURL(/\/login/)
})
