import { test, expect } from '@playwright/test'

test('staff vote review presents aggregate fraud signals without raw identifiers', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'staff-test-token', user: 'Admin', email: 'admin@inkrider.local', role: 'admin' }) })
    if (url.pathname === '/api/user/me') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { role: 'admin', username: 'Admin' } }) })
    if (url.pathname === '/api/staff/competition-fraud') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ competitionId: '507f1f77bcf86cd799439011', signalType: 'NETWORK', distinctVoterCount: 4, voteCount: 4, windowMs: 600000, reason: 'CROSS_ACCOUNT_SIGNAL' }], meta: { analyzedVoteCount: 9, windowMs: 600000 } }) })
    if (url.pathname === '/api/staff/competition-fraud/reviews') return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: { id: 'review-1', disposition: 'confirmed' } }) })
    if (url.pathname === '/api/v1/notifications') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { unreadCount: 0 } }) })
    return route.abort('blockedbyclient')
  })

  await page.goto('/staff', { waitUntil: 'domcontentloaded' })
  const tabs = page.getByRole('tablist', { name: 'Staff console sections' })
  await tabs.getByRole('tab', { name: 'Vote review' }).click()
  await expect(tabs.getByRole('tab', { name: 'Vote review' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel', { name: 'Vote review content' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Competition vote review' })).toBeVisible()
  await expect(page.getByText('4 distinct accounts · 4 votes')).toBeVisible()
  await expect(page.getByText('NETWORK signal', { exact: true })).toBeVisible()
  await expect(page.getByText('network-hash')).toHaveCount(0)
  await page.getByLabel('Review note for network signal').fill('The concentration requires a manual follow-up.')
  await page.getByRole('button', { name: 'Confirm signal' }).click()
  await expect(page.getByText('Fraud disposition recorded.')).toBeVisible()
  await tabs.getByRole('tab', { name: 'Vote review' }).press('Home')
  await expect(tabs.getByRole('tab', { name: 'Moderation' })).toBeFocused()
  await expect(tabs.getByRole('tab', { name: 'Moderation' })).toHaveAttribute('aria-selected', 'true')
})

test('staff moderation failures expose a retryable alert instead of an empty queue', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'staff-test-token', user: 'Admin', email: 'admin@inkrider.local', role: 'admin' }) })
    if (url.pathname === '/api/user/me') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { role: 'admin', username: 'Admin' } }) })
    if (url.pathname === '/api/staff/reports') return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Reports unavailable' }) })
    if (url.pathname === '/api/v1/notifications') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { unreadCount: 0 } }) })
    return route.abort('blockedbyclient')
  })

  await page.goto('/staff', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('alert')).toContainText('Moderation reports could not be loaded.')
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
})
