import { test, expect } from '@playwright/test'

const collection = {
  id: '507f1f77bcf86cd799439030',
  title: 'Short Reads for a Curious Mind',
  description: 'A demo public collection for testing ordering and visibility.',
  postsCount: 3,
  visibility: 'public',
  coverImage: null,
  author: { username: 'Priya Mehta With A Very Long Curator Name' },
}

async function mockCollections(page, loggedIn = true) {
  await page.route(url => url.pathname.startsWith('/api/'), route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') return route.fulfill({ status: loggedIn ? 200 : 401, json: loggedIn ? { accessToken: 'collection-layout-token', user: 'Priya Mehta', email: 'member@inkrider.local', role: 'regular' } : { message: 'Signed out' } })
    if (url.pathname === '/api/collection') return route.fulfill({ json: { data: [collection, { ...collection, id: '507f1f77bcf86cd799439031', title: 'AnUnbrokenCollectionTitleThatMustStayWithinTheCardAtPhoneWidths', author: { username: 'AnUnbrokenCuratorNameThatMustWrapWithoutOverflow' }, coverImage: '/logo/logo-dark.png' }], meta: { nextCursor: null } } })
    return route.fulfill({ json: { data: [], meta: { nextCursor: null, unreadCount: 0 } } })
  })
}

for (const width of [320, 325, 390, 600, 640, 768, 1280]) {
  test(`collections keep controls and card content within bounds at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await mockCollections(page)
    await page.goto('/collections')
    await expect(page.getByRole('tab', { name: 'My collections' })).toBeVisible()
    const cards = page.getByRole('article')
    await expect(cards).toHaveCount(2)
    await expect(cards.nth(1).locator('img')).toBeVisible()
    await expect.poll(() => cards.nth(1).locator('img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
    const filters = page.getByRole('button', { name: 'Filters', exact: true })
    const filterBounds = await filters.boundingBox()
    expect(filterBounds.x + filterBounds.width).toBeLessThanOrEqual(width)
    for (const card of await cards.all()) {
      const bounds = await card.boundingBox()
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
      const metadata = card.getByText(/^by /)
      const metadataBounds = await metadata.boundingBox()
      expect(metadataBounds.y + metadataBounds.height).toBeLessThan(bounds.y + bounds.height)
      expect(metadataBounds.x + metadataBounds.width).toBeLessThan(bounds.x + bounds.width)
      const count = await card.getByText('3 stories', { exact: true }).boundingBox()
      const coverBounds = await card.locator('.grid > div').last().boundingBox()
      expect(coverBounds.height).toBe(120)
      expect(coverBounds.x).toBeGreaterThan(bounds.x + bounds.width / 2)
      expect(coverBounds.x + coverBounds.width).toBeLessThan(bounds.x + bounds.width)
      expect(coverBounds.y).toBeGreaterThan(bounds.y)
      expect(count.y).toBeGreaterThan(coverBounds.y + coverBounds.height)
      expect(count.y).toBeLessThanOrEqual(metadataBounds.y)
      expect(bounds.height).toBeGreaterThanOrEqual(216)
      const footer = card.getByText('3 stories', { exact: true }).locator('..')
      expect(await footer.evaluate(element => getComputedStyle(element).borderTopWidth)).toBe('1px')
      const menuBounds = await card.getByRole('button', { name: /More options/ }).boundingBox()
      expect(menuBounds.width).toBeGreaterThanOrEqual(44)
      expect(menuBounds.height).toBeGreaterThanOrEqual(44)
      expect(menuBounds.x).toBeGreaterThanOrEqual(coverBounds.x)
      expect(menuBounds.x + menuBounds.width).toBeLessThanOrEqual(coverBounds.x + coverBounds.width)
    }
    expect(await page.evaluate(() => document.querySelector('[data-app-scroll]').scrollWidth <= document.querySelector('[data-app-scroll]').clientWidth)).toBe(true)
    await filters.click()
    const dialog = page.getByRole('dialog', { name: 'Filter by topic' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Private', exact: true }).click()
    await expect(page.getByText('No collections match this filter.')).toBeVisible()
    await dialog.getByRole('button', { name: 'Reset filters' }).click()
    await expect(cards).toHaveCount(2)
    await dialog.press('Escape')
    await expect(filters).toBeFocused()
    const discover = page.getByRole('tab', { name: 'Discover', exact: true })
    await discover.press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'My collections' })).toBeFocused()
    await expect(page).toHaveURL(/collectionView=mine/)
    const trigger = cards.first().getByRole('button', { name: /More options/ })
    await trigger.click()
    await expect(page.getByRole('menuitem', { name: 'Save collection' })).toBeFocused()
    await page.getByRole('menuitem', { name: 'Save collection' }).press('Escape')
    await expect(trigger).toBeFocused()
    if (width === 325 || width === 1280) await page.screenshot({ path: `test-results/collections-${width}.png` })
  })
}

test('guest collections and dark narrow cards retain navigation', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.addInitScript(() => localStorage.setItem('ink-theme', 'dark'))
  await mockCollections(page, false)
  await page.goto('/collections')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.getByRole('tab', { name: 'My collections' })).toHaveCount(0)
  await expect(page.getByRole('article').first().getByText(`by ${collection.author.username}`)).toBeVisible()
  await page.screenshot({ path: 'test-results/collections-dark-320.png' })
  await page.getByRole('link', { name: collection.title, exact: true }).click()
  await expect(page).toHaveURL(`/collections/${collection.id}`)
})
