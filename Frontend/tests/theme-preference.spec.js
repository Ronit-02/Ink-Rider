import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), route => route.fulfill(
    new URL(route.request().url()).pathname === '/api/auth/refresh-token'
      ? { status: 401, json: { message: 'Signed out' } }
      : { json: { data: [], meta: { nextCursor: null } } },
  ))
})

for (const theme of ['light', 'dark']) {
  const opposite = theme === 'dark' ? 'light' : 'dark'
  const assertTheme = async (page, expected) => {
    await expect(page.locator('html')).toHaveClass(expected === 'dark' ? /dark/ : /^(?!.*\bdark\b)/)
  }

  test(`unsaved theme follows the ${theme} system and live changes; sidebar arrow inherits its label`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme })
    await page.goto('/')
    await assertTheme(page, theme)
    const explore = page.getByRole('navigation', { name: 'Desktop primary navigation' }).getByRole('button', { name: 'Explore', exact: true })
    await expect(explore.locator('svg').first()).toHaveAttribute('stroke', 'currentColor')
    await expect.poll(() => explore.evaluate(element => getComputedStyle(element.querySelector('svg')).stroke === getComputedStyle(element).color)).toBe(true)
    expect(await page.evaluate(() => localStorage.getItem('ink-theme'))).toBeNull()
    await page.emulateMedia({ colorScheme: opposite })
    await assertTheme(page, opposite)
    await page.reload()
    await assertTheme(page, opposite)
    expect(await page.evaluate(() => localStorage.getItem('ink-theme'))).toBeNull()
    await page.goto('/explore/trending')
    await expect(explore.locator('svg').first()).toHaveCSS('stroke', opposite === 'dark' ? 'rgb(238, 236, 232)' : 'rgb(25, 25, 25)')
  })

  test(`explicit ${theme} choice overrides the system and persists across reload and routes`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: opposite })
    await page.goto('/settings')
    await page.getByLabel('Theme', { exact: true }).selectOption(theme)
    await assertTheme(page, theme)
    expect(await page.evaluate(() => localStorage.getItem('ink-theme'))).toBe(theme)
    await page.emulateMedia({ colorScheme: theme })
    await page.emulateMedia({ colorScheme: opposite })
    await assertTheme(page, theme)
    await page.reload()
    await assertTheme(page, theme)
    await page.goto('/login')
    await assertTheme(page, theme)
    await page.goto('/')
    await assertTheme(page, theme)
  })
}
