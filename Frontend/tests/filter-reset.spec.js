import { test, expect } from '@playwright/test'

const surfaces = [
  { path: '/explore/trending', topic: 'trendingTopic', sort: 'trendingSort', alternateSort: 'latest', defaultSort: 'popular' },
  { path: '/explore/questions', topic: 'questionTopic', sort: 'questionSort', alternateSort: 'newest', defaultSort: 'hot' },
]

for (const surface of surfaces) {
  for (const width of [320, 1280]) {
    test(`${surface.path} resets topic and sort together at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 735 })
      await page.route(url => url.pathname.startsWith('/api/'), route => {
        if (new URL(route.request().url()).pathname === '/api/auth/refresh-token') {
          return route.fulfill({ status: 401, json: { message: 'Signed out' } })
        }
        return route.fulfill({ json: { data: [], meta: { nextCursor: null } } })
      })
      await page.goto(`${surface.path}?${surface.topic}=science&${surface.sort}=${surface.alternateSort}&keep=reader`)
      const trigger = page.getByRole('button', { name: /Filters/ })
      if (surface.path === '/explore/questions') {
        const ask = await page.getByRole('button', { name: 'Ask a question' }).boundingBox()
        const filters = await trigger.boundingBox()
        expect(Math.abs(ask.y + ask.height / 2 - filters.y - filters.height / 2)).toBeLessThan(1)
        expect(filters.x).toBeGreaterThanOrEqual(ask.x + ask.width + 11)
        if (width === 320) await page.screenshot({ path: 'test-results/questions-header-mobile.png' })
      }
      await trigger.click()
      const dialog = page.getByRole('dialog', { name: 'Filter by topic' })
      const reset = dialog.getByRole('button', { name: 'Reset filters' })
      await expect(trigger).toHaveText(/Filters 2/)
      await reset.click()
      await expect(page).toHaveURL(`${surface.path}?keep=reader`)
      await expect(dialog.getByRole('button', { name: 'All', exact: true })).toHaveAttribute('aria-pressed', 'true')
      await expect(dialog.getByRole('combobox', { name: 'Sort' })).toHaveValue(surface.defaultSort)
      await expect(reset).toBeDisabled()
      await expect(trigger).toHaveText('Filters')
      await dialog.getByRole('button', { name: 'Science', exact: true }).click()
      await expect(reset).toBeEnabled()
      await reset.click()
      await expect(page).toHaveURL(`${surface.path}?keep=reader`)
      await dialog.getByRole('combobox', { name: 'Sort' }).selectOption(surface.alternateSort)
      await expect(reset).toBeEnabled()
      await reset.click()
      await expect(page).toHaveURL(`${surface.path}?keep=reader`)
      const bounds = await dialog.boundingBox()
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      await dialog.getByRole('button', { name: 'Close filters' }).press('Escape')
      await expect(dialog).toHaveCount(0)
      await expect(trigger).toBeFocused()
    })
  }
}
