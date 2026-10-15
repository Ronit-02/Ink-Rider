import { test, expect } from '@playwright/test'

const excerpt = 'A focused idea that keeps unfolding as the reader moves through the short preview. '.repeat(14)
const post = {
  id: '507f1f77bcf86cd799439021', title: 'A short idea', excerpt,
  format: 'short', image: null, author: { username: 'Leila Noor', handle: 'leila-noor' },
  createdAt: '2026-09-08T00:00:00Z', readTime: '1 min read', likesCount: 2, commentsCount: 1,
}

async function mockFeed(page, story = post) {
  await page.route(url => url.pathname.startsWith('/api/'), route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/auth/refresh-token') return route.fulfill({ status: 401, json: { message: 'Signed out' } })
    if (path === '/api/post/shorts' || path === '/api/post/feed') return route.fulfill({ json: { data: [story], meta: { nextCursor: null } } })
    return route.fulfill({ json: { data: [], meta: { nextCursor: null } } })
  })
}

test('covered short keeps its excerpt above the footer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockFeed(page, { ...post, image: '/logo/logo-dark-profile.png' })
  await page.goto('/shorts')
  const card = page.locator('[data-story-format="short"]').first()
  const paragraph = card.getByText(excerpt, { exact: true })
  await expect(paragraph).toBeVisible()
  const layout = await paragraph.evaluate(element => {
    const footer = element.parentElement.nextElementSibling
    return { lines: Number(getComputedStyle(element).webkitLineClamp), bottom: element.getBoundingClientRect().bottom, footerTop: footer.getBoundingClientRect().top }
  })
  expect(layout.lines).toBeGreaterThan(0)
  expect(layout.bottom).toBeLessThanOrEqual(layout.footerTop)
})

test('long short titles stay clear of the action footer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockFeed(page, { ...post, title: 'A longer short title that remains readable as it wraps. '.repeat(5).trim() })
  await page.goto('/shorts')
  const card = page.locator('[data-story-format="short"]').first()
  await expect(card).toBeVisible()
  const layout = await card.evaluate(element => {
    const heading = element.querySelector('h2')
    const footer = element.firstElementChild.lastElementChild
    return { titleBottom: heading.getBoundingClientRect().bottom, footerTop: footer.getBoundingClientRect().top }
  })
  expect(layout.titleBottom).toBeLessThanOrEqual(layout.footerTop)
})

for (const width of [390, 1280]) {
  test(`short excerpt fills available lines at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await mockFeed(page)
    await page.goto('/shorts')
    const card = page.locator('[data-story-format="short"]').first()
    const paragraph = card.getByText(excerpt, { exact: true })
    await expect(paragraph).toBeVisible()
    const layout = await card.evaluate((element, text) => {
      const paragraph = [...element.querySelectorAll('p')].find(node => node.textContent === text)
      const content = paragraph.parentElement
      const footer = content.nextElementSibling
      const style = getComputedStyle(paragraph)
      const lines = Number(style.webkitLineClamp)
      const available = (content.getBoundingClientRect().bottom - paragraph.getBoundingClientRect().top) / parseFloat(style.lineHeight)
      return { lines, available, clipped: paragraph.scrollHeight > paragraph.clientHeight, inside: paragraph.getBoundingClientRect().bottom <= content.getBoundingClientRect().bottom && content.getBoundingClientRect().bottom <= footer.getBoundingClientRect().top }
    }, excerpt)
    expect(layout.lines).toBeGreaterThan(2)
    expect(layout.lines).toBe(Math.floor(layout.available + 0.05))
    expect(layout.clipped).toBe(true)
    expect(layout.inside).toBe(true)
  })
}

test('Home feed tabs stay at the top of the scrolling content', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 })
  await mockFeed(page)
  await page.goto('/')
  const tabs = page.getByRole('tablist', { name: 'Discovery feeds' })
  await expect(tabs).toBeVisible()
  await page.locator('[data-app-scroll]').evaluate(element => element.scrollTop = 500)
  const layout = await tabs.evaluate(element => ({ top: element.getBoundingClientRect().top, scrollTop: element.closest('[data-app-scroll]').getBoundingClientRect().top }))
  expect(layout.top - layout.scrollTop).toBeCloseTo(12, 0)
})
