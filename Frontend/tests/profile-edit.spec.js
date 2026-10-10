import { test, expect } from '@playwright/test'

async function mockProfile(page, { guest = false, failRead = false } = {}) {
  let profile = { displayName: 'Maya Sen', bio: 'Writing about cities.', handle: 'maya-sen', joinedAt: '2025-01-01T00:00:00Z', writerStatus: 'reader', postCount: 0 }
  let failSave = true
  let readFailure = failRead
  const writes = []
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/auth/refresh-token') return route.fulfill(guest ? { status: 401, json: { message: 'Signed out' } } : { json: { accessToken: 'profile-edit-fixture', user: 'Maya Sen', email: 'reader@example.test', role: 'regular' } })
    if (path === '/api/user/me') {
      if (readFailure) return route.fulfill({ status: 500, json: { message: 'Unavailable' } })
      return route.fulfill({ json: { data: profile } })
    }
    if (path === '/api/user/profile') {
      const input = route.request().postDataJSON()
      writes.push(input)
      if (failSave) { failSave = false; return route.fulfill({ status: 400, json: { message: 'Name unavailable' } }) }
      profile = { ...profile, displayName: input.username, bio: input.bio }
      return route.fulfill({ json: { profile } })
    }
    if (path === '/api/v1/reading-history') return route.fulfill({ json: { data: { continueReading: [], history: [] } } })
    if (path === '/api/v1/me/entitlements') return route.fulfill({ json: { data: { capabilities: [], membership: { status: 'inactive' } } } })
    return route.fulfill({ json: { data: [], meta: { unreadCount: 0, nextCursor: null } } })
  })
  return { writes, recover: () => { readFailure = false } }
}

for (const width of [320, 1280]) {
  test(`Edit profile opens a page and preserves failed changes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 720 })
    await page.addInitScript(theme => localStorage.setItem('ink-theme', theme), width === 320 ? 'light' : 'dark')
    const calls = await mockProfile(page)
    await page.goto('/profile?profileTab=posts')
    await page.getByRole('button', { name: 'Edit profile', exact: true }).click()
    await expect(page).toHaveURL(/\/profile\/edit\?profileTab=posts$/)
    await expect(page.getByRole('heading', { name: 'Edit profile', exact: true })).toBeVisible()
    await expect(page.getByRole('tablist')).toHaveCount(0)
    await expect(page.getByLabel('Display name')).toHaveValue('Maya Sen')
    await expect(page.getByLabel('Biography')).toHaveValue('Writing about cities.')
    await page.getByLabel('Display name').fill('Maya Updated')
    await page.getByLabel('Biography').fill('A new biography.')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'Profile update failed' })).toBeVisible()
    await expect(page.getByLabel('Display name')).toHaveValue('Maya Updated')
    await expect(page.getByLabel('Biography')).toHaveValue('A new biography.')
    expect(await page.locator('[data-app-scroll]').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
    await page.screenshot({ path: `node_modules/.cache/profile-notifications/edit-${width}.png` })
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page).toHaveURL(/\/profile\?profileTab=posts$/)
    await expect(page.getByRole('heading', { name: 'Maya Updated', exact: true })).toBeVisible()
    expect(calls.writes).toEqual(Array(2).fill({ username: 'Maya Updated', bio: 'A new biography.' }))
    await page.getByRole('button', { name: 'Edit profile', exact: true }).click()
    await page.getByLabel('Display name').fill('Discard me')
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Maya Updated', exact: true })).toBeVisible()
    expect(calls.writes).toHaveLength(2)
  })
}

test('direct edit entry recovers loading failures and Back falls back to Profile', async ({ page }) => {
  const calls = await mockProfile(page, { failRead: true })
  await page.goto('/profile/edit')
  await expect(page.getByRole('alert')).toHaveText('We couldn’t load your profile.')
  calls.recover()
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByLabel('Display name')).toHaveValue('Maya Sen')
  await page.getByLabel('Display name').fill('   ')
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(page).toHaveURL(/\/profile$/)
  expect(calls.writes).toHaveLength(0)
})

test('guest edit entry keeps private fields gated', async ({ page }) => {
  await mockProfile(page, { guest: true })
  await page.goto('/profile/edit')
  await expect(page.getByText('Sign in to edit your profile.', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Display name')).toHaveCount(0)
  await page.getByRole('main').getByRole('button', { name: 'Sign In', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Sign in to Ink Rider', exact: true })).toBeVisible()
  await expect(page).toHaveURL(/\/profile\/edit$/)
})
