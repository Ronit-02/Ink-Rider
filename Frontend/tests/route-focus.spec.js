import { test, expect } from '@playwright/test'

test('client-side route changes move focus to the new app content region', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === '/api/post/feed') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { nextCursor: null } }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.goto('/explore/questions', { waitUntil: 'domcontentloaded' })
  const navigation = page.getByRole('navigation', { name: 'Explore sections' })

  await navigation.getByRole('link', { name: 'Competitions' }).click()
  await expect(page).toHaveURL('/explore/competitions')
  await expect(page.locator('#main-content')).toBeFocused()
  await expect(page.locator('#main-content')).toHaveJSProperty('scrollTop', 0)
})
