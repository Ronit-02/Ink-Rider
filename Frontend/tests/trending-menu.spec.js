import { test, expect } from '@playwright/test'

const article = {
  id: '507f1f77bcf86cd799439020',
  title: 'The quiet craft of public spaces',
  excerpt: 'A deterministic article-of-the-day fixture for keyboard coverage.',
  image: null,
  tags: ['design'],
  readTime: '4 min read',
  isLiked: false,
  isBookmarked: false,
  author: { username: 'Maya Sen', handle: 'maya-sen' },
}

const story = {
  ...article,
  id: '507f1f77bcf86cd799439021',
  title: 'How a neighborhood remembers',
  recommendationReason: 'Popular with readers following design.',
}

test('article-of-the-day menu supports keyboard navigation and focus return', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === '/api/post/feed') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [article, story], meta: { nextCursor: null } }),
      })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/explore/trending', { waitUntil: 'domcontentloaded' })

  const trigger = page.getByRole('button', { name: `More options for ${article.title}` })
  await trigger.click()

  const menu = page.getByRole('menu', { name: `Options for ${article.title}` })
  const appreciate = menu.getByRole('menuitem', { name: 'Appreciate story' })
  const save = menu.getByRole('menuitem', { name: 'Save story' })
  const share = menu.getByRole('menuitem', { name: 'Share link' })
  await expect(menu).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(appreciate).toBeFocused()

  await appreciate.press('ArrowDown')
  await expect(save).toBeFocused()
  await save.press('End')
  await expect(share).toBeFocused()
  await share.press('Home')
  await expect(appreciate).toBeFocused()
  await appreciate.press('Escape')

  await expect(menu).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()

  const hasHorizontalOverflow = await page.evaluate(() => (
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  ))
  expect(hasHorizontalOverflow).toBe(false)
})

test('discovery-card menu keeps nested controls safe while navigating menu items', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === '/api/post/feed') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [article, story], meta: { nextCursor: null } }),
      })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/explore/trending', { waitUntil: 'domcontentloaded' })

  const trigger = page.getByRole('button', { name: `More options for ${story.title}` })
  await trigger.click()

  const menu = page.getByRole('menu', { name: `Options for ${story.title}` })
  const appreciate = menu.getByRole('menuitem', { name: 'Appreciate story' })
  const why = menu.getByRole('menuitem', { name: 'Why you’re seeing this' })
  const hide = menu.getByRole('menuitem', { name: 'Not interested' })
  const report = menu.getByRole('menuitem', { name: 'Report story' })
  await expect(appreciate).toBeFocused()

  await appreciate.press('End')
  await expect(report).toBeFocused()
  await report.press('Enter')

  const reason = menu.getByLabel('Report reason')
  await expect(reason).toBeVisible()
  await reason.focus()
  await reason.press('ArrowDown')
  await expect(reason).toBeFocused()

  await reason.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()

  await trigger.click()
  await expect(appreciate).toBeFocused()
  await appreciate.press('Home')
  await expect(appreciate).toBeFocused()
  await appreciate.press('ArrowUp')
  await expect(report).toBeFocused()
  await report.press('ArrowUp')
  await expect(hide).toBeFocused()
  await hide.press('ArrowUp')
  await expect(why).toBeFocused()
})
