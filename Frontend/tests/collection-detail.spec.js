import { test, expect } from '@playwright/test'

const collectionId = '507f1f77bcf86cd799439030'
const collection = {
  id: collectionId,
  title: 'Cities worth reading slowly',
  description: 'A deterministic collection fixture for reading-order controls.',
  coverImage: null,
  postsCount: 2,
  visibility: 'public',
  isOwner: true,
  author: { username: 'Maya Sen' },
  posts: [
    { id: '507f1f77bcf86cd799439031', title: 'First story', author: { username: 'Maya Sen' }, readTime: '3 min read' },
    { id: '507f1f77bcf86cd799439032', title: 'Second story', author: { username: 'Maya Sen' }, readTime: '4 min read' },
  ],
}

test('collection reading-order controls are keyboard reachable and phone-sized', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === `/api/collection/${collectionId}`) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: collection }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`/collections/${collectionId}`, { waitUntil: 'domcontentloaded' })

  const earlier = page.getByRole('button', { name: 'Move Second story earlier' })
  const later = page.getByRole('button', { name: 'Move First story later' })
  await expect(earlier).toBeVisible()
  await expect(later).toBeVisible()
  await expect(earlier).toHaveCSS('min-width', '40px')
  await expect(earlier).toHaveCSS('min-height', '40px')

  await later.focus()
  await expect(later).toBeFocused()
  await earlier.focus()
  await expect(earlier).toBeFocused()

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(hasHorizontalOverflow).toBe(false)
})

test('collection error state preserves the application main landmark', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === `/api/collection/${collectionId}`) {
      return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'Not found' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.goto(`/collections/${collectionId}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByText('This collection is private or no longer exists.')).toBeVisible()
  await expect(page.locator('main')).toHaveCount(1)
})
