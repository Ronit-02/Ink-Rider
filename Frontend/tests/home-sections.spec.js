import { test, expect } from '@playwright/test'

const posts = Array.from({ length: 12 }, (_, index) => ({
  id: `507f1f77bcf86cd7994390${20 + index}`,
  title: `A seeded story ${index + 1}`,
  excerpt: 'A short excerpt for the Home deferred section regression.',
  body: 'A short body.',
  image: null,
  author: { id: `507f1f77bcf86cd7994391${20 + index}`, username: 'Maya Sen', handle: 'maya-sen', picture: null },
  tags: ['science'],
  readTime: '4 min read',
  createdAt: '2026-08-25T00:00:00.000Z',
  likesCount: 2,
  commentsCount: 0,
  isLiked: false,
  isBookmarked: false,
}))

test('Home deferred collections expose a retryable failure state', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const requestUrl = new URL(route.request().url())
    if (requestUrl.pathname === '/api/auth/refresh-token') return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    if (requestUrl.pathname === '/api/post/feed') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: posts, meta: { nextCursor: null } }) })
    if (requestUrl.pathname === '/api/collection') return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Unavailable' }) })
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.getByRole('status', { name: 'Loading discovery section' }).last().scrollIntoViewIfNeeded()
  await expect(page.getByRole('heading', { name: 'Browse collections' })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('Collections could not be loaded.')
  await expect(page.getByRole('alert').getByRole('button', { name: 'Try again' })).toBeVisible()
})
