import { test, expect } from '@playwright/test'

for (const width of [320, 1280]) {
  test(`editor insert menu stays visible near the bottom at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 420 })
    await page.route(url => url.pathname.startsWith('/api/'), route => {
      const path = new URL(route.request().url()).pathname
      if (path === '/api/auth/refresh-token') return route.fulfill({ json: { accessToken: 'editor-overlay-token', user: 'Reader', email: 'reader@example.test', role: 'regular' } })
      if (path.startsWith('/api/drafts')) return route.fulfill({ json: { data: { id: '507f1f77bcf86cd799439041', version: 1, title: '', blocks: [] } } })
      if (path === '/api/v1/me/entitlements') return route.fulfill({ json: { data: { capabilities: [] } } })
      return route.fulfill({ json: { data: [], meta: { nextCursor: null, unreadCount: 0 } } })
    })
    await page.goto('/write')
    const paragraph = page.getByRole('textbox', { name: 'Paragraph block', exact: true })
    await paragraph.fill('/')
    const menu = page.getByRole('listbox', { name: 'Insert block' })
    await expect(menu).toBeVisible()
    expect(await menu.evaluate(element => {
      const rect = element.getBoundingClientRect()
      const bar = document.querySelector('[aria-label="Mobile primary navigation"]')?.getBoundingClientRect()
      return element.parentElement === document.body && rect.top >= 56 && rect.bottom <= (bar?.height ? bar.top : window.innerHeight) && rect.left >= 0 && rect.right <= window.innerWidth
    })).toBe(true)
    await paragraph.press('ArrowDown')
    await expect(menu.getByRole('option', { name: 'Insert Heading 1' })).toHaveAttribute('aria-selected', 'true')
    await paragraph.press('Enter')
    await expect(menu).toHaveCount(0)
    await expect(page.getByRole('textbox', { name: 'h1 block', exact: true })).toBeVisible()
  })
}
