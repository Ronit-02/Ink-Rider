import { test, expect } from '@playwright/test'

for (const width of [320, 369, 390, 1280]) {
  test(`search filter panel stays pinned and visible as results change at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 735 })
    await page.route(url => url.pathname.startsWith('/api/'), route => {
      const url = new URL(route.request().url())
      if (url.pathname === '/api/auth/refresh-token') return route.fulfill({ status: 401, json: { message: 'Signed out' } })
      if (url.pathname === '/api/search') {
        const posts = url.searchParams.get('topic') === 'ai' ? [] : Array.from({ length: 5 }, (_, index) => ({
          id: `507f1f77bcf86cd79943901${index}`,
          title: `Practical curiosity ${index + 1}`,
          abstract: 'Explore a practical approach to science and everyday curiosity.',
          author: { id: '507f1f77bcf86cd799439011', username: 'Leila Noor', handle: 'leila-noor' },
          createdAt: '2026-09-08T00:00:00Z', readTime: '1 min read', tags: ['science'], likesCount: 29, commentsCount: 0,
        }))
        return route.fulfill({ json: { data: { posts, writers: [], shorts: [] } } })
      }
      return route.fulfill({ json: { data: [], meta: { nextCursor: null } } })
    })
    await page.goto('/search?q=practical')
    await expect(page.getByRole('heading', { name: 'Practical curiosity 1' })).toBeVisible()
    const trigger = page.getByRole('button', { name: 'Filters' })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Refine results' })
    await expect(dialog).toBeVisible()
    const opening = await dialog.boundingBox()
    const assertPinned = async () => {
      const current = await dialog.boundingBox()
      expect(current.x).toBeCloseTo(opening.x, 0)
      expect(current.y).toBeCloseTo(opening.y, 0)
      expect(current.x).toBeGreaterThanOrEqual(0)
      expect(current.x + current.width).toBeLessThanOrEqual(width)
      expect(current.y).toBeGreaterThanOrEqual(56)
      expect(current.y + current.height).toBeLessThanOrEqual(width < 768 ? 671 : 735)
    }
    await assertPinned()
    await dialog.getByRole('button', { name: 'AI', exact: true }).click()
    await expect(page.getByText('No posts found', { exact: true })).toBeVisible()
    await assertPinned()
    await dialog.getByRole('button', { name: 'Science', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Practical curiosity 1' })).toBeVisible()
    await assertPinned()
    await dialog.getByRole('combobox').first().selectOption('week')
    await expect(page).toHaveURL(/time=week/)
    await assertPinned()
    await dialog.getByRole('button', { name: 'Reset filters' }).click()
    await expect(page).toHaveURL(/\/search\?q=practical$/)
    await assertPinned()
    if (width < 768) {
      await page.setViewportSize({ width, height: 420 })
      await expect.poll(async () => {
        const bounds = await dialog.boundingBox()
        return bounds.y + bounds.height
      }).toBeLessThanOrEqual(356)
      await dialog.getByRole('button', { name: 'Reset filters' }).scrollIntoViewIfNeeded()
      await expect(dialog.getByRole('button', { name: 'Reset filters' })).toBeInViewport()
    }
    await dialog.getByRole('button', { name: 'Close filters' }).press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await trigger.click()
    await expect(dialog).toBeVisible()
    await page.getByRole('link', { name: 'Ink Rider home' }).click()
    await expect(dialog).toHaveCount(0)
  })
}
