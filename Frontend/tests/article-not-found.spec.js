import { expect, test } from '@playwright/test'

const missingPostId = '507f1f77bcf86cd799439011'

test('a missing article explains the 404 state and offers discovery recovery', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const requestUrl = new URL(route.request().url())
    if (requestUrl.pathname === '/api/auth/refresh-token') return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    if (requestUrl.pathname === `/api/post/${missingPostId}`) return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'Post not found' }) })
    return route.abort('blockedbyclient')
  })

  await page.goto(`/post/${missingPostId}`, { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'This article is no longer available' })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('It may have been removed, unpublished, or the link may be incorrect.')
  await expect(page.getByRole('button', { name: 'Try again' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Explore stories' })).toHaveAttribute('href', '/')
})
