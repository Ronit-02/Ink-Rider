import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), route => {
    if (new URL(route.request().url()).pathname === '/api/auth/refresh-token') return route.fulfill({ status: 401, json: { message: 'Signed out' } })
    return route.fulfill({ json: { data: [], meta: { nextCursor: null } } })
  })
})

test('Google sign-in control follows the available form width on resize', async ({ page }) => {
  await page.addInitScript(() => {
    window.google = { accounts: { id: {
      initialize() {},
      renderButton(container, options) {
        const button = document.createElement('button')
        button.type = 'button'
        button.textContent = 'Continue with Google'
        button.style.width = `${options.width}px`
        container.appendChild(button)
      },
    } } }
  })
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
  const google = page.getByRole('button', { name: 'Continue with Google' })
  // Identity is optional in environments without a configured public client ID.
  if (await google.count() === 0) { test.skip(true, 'Google client ID is not configured'); return }
  await expect(google).toBeVisible()
  await page.setViewportSize({ width: 320, height: 568 })
  await expect.poll(async () => {
    const bounds = await google.boundingBox()
    const form = await page.locator('#auth-form').boundingBox()
    if (!bounds || !form) return false
    return bounds.x >= form.x && bounds.x + bounds.width <= form.x + form.width
  }).toBe(true)
})

for (const width of [320, 390, 1280]) {
  test(`guest profile and write prompts and settings at ${width}px`, async ({ page }) => {
    const privateReads = []
    page.on('request', request => { if (/^\/api\/(user|drafts|v1\/me)/.test(new URL(request.url()).pathname)) privateReads.push(request.url()) })
    await page.setViewportSize({ width, height: 735 })
    await page.goto('/profile')
    const main = page.getByRole('main')
    await expect(main.getByRole('link', { name: 'Sign In', exact: true })).toHaveCount(1)
    await expect(main.getByText('Sign in to view your profile.')).toBeVisible()
    expect(await main.getByRole('link', { name: 'Sign In', exact: true }).evaluate(element => getComputedStyle(element).color !== getComputedStyle(element).backgroundColor)).toBe(true)
    await expect(main.getByText('Sign Up', { exact: true })).toHaveCount(0)
    await expect(main.getByRole('button', { name: 'Open app settings' })).toHaveCount(0)
    await page.goto('/settings')
    await expect(page.getByLabel('Language', { exact: true })).toBeDisabled()
    await expect(page.getByLabel('Language', { exact: true }).locator('option')).toHaveText(['English'])
    await page.getByLabel('Theme', { exact: true }).selectOption('dark')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.goto('/write?draft=private-draft')
    await expect(page).toHaveURL(/\/write\?draft=/)
    await expect(main.getByText('Sign in to start writing.')).toBeVisible()
    expect(privateReads).toEqual([])
    await main.getByRole('link', { name: 'Sign In', exact: true }).click()
    await expect(page).toHaveURL(/\/login$/)
  })
}

for (const size of [{ width: 320, height: 568 }, { width: 390, height: 360 }, { width: 768, height: 450 }]) {
  test(`auth forms and verification fit ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size)
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await page.getByRole('tab', { name: 'Sign Up' }).click()
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Test Reader')
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill('reader@example.test')
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Test-password-123')
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Test-password-123')
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Enter Verification Code' })).toBeVisible()
    for (let digit = 1; digit <= 6; digit++) {
      const input = page.getByRole('textbox', { name: `Verification digit ${digit}` })
      const bounds = await input.boundingBox()
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(size.width)
      await input.fill(String(digit))
    }
    await page.getByRole('button', { name: 'Verify Email' }).scrollIntoViewIfNeeded()
    await expect(page.getByRole('button', { name: 'Verify Email' })).toBeInViewport()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
