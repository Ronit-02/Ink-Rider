import { test, expect } from '@playwright/test'

for (const width of [320, 1280]) {
  test(`editor insert menu stays visible near the bottom at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 420 })
    await page.route(url => url.pathname.startsWith('/api/'), route => {
      const path = new URL(route.request().url()).pathname
      if (path === '/api/auth/refresh-token') return route.fulfill({ json: { accessToken: 'editor-overlay-token', user: 'Reader', email: 'reader@example.test', role: 'regular' } })
      if (path.startsWith('/api/drafts')) return route.fulfill({ json: { data: { id: '507f1f77bcf86cd799439041', version: 1, title: '', blocks: [] } } })
      if (path === '/api/v1/me/entitlements') return route.fulfill({ json: { data: { capabilities: [] } } })
      return route.fulfill({ json: { data: [], meta: { nextCursor: null, unreadCount: 0 } } })
    })
    await page.goto('/write')
    const paragraph = page.getByRole('textbox', { name: 'Paragraph block', exact: true })
    await paragraph.fill('/')
    const menu = page.getByRole('listbox', { name: 'Insert block' })
    await expect(menu).toBeVisible()
    expect(await menu.evaluate(element => {
      const rect = element.getBoundingClientRect()
      const bar = document.querySelector('[aria-label="Mobile primary navigation"]')?.getBoundingClientRect()
      return element.parentElement === document.body && rect.top >= 56 && rect.bottom <= (bar?.height ? bar.top : window.innerHeight) && rect.left >= 0 && rect.right <= window.innerWidth
    })).toBe(true)
    await paragraph.press('ArrowDown')
    await expect(menu.getByRole('option', { name: 'Insert Heading 1' })).toHaveAttribute('aria-selected', 'true')
    await paragraph.press('Enter')
    await expect(menu).toHaveCount(0)
    await expect(page.getByRole('textbox', { name: 'h1 block', exact: true })).toBeVisible()
  })
}

for (const width of [320, 1280]) {
  test(`slash arrows stay in the active block and scroll only the menu at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 520 })
    await page.route(url => url.pathname.startsWith('/api/'), route => {
      const path = new URL(route.request().url()).pathname
      if (path === '/api/auth/refresh-token') return route.fulfill({ json: { accessToken: 'editor-keyboard-token', user: 'Writer', email: 'writer@example.test', role: 'regular' } })
      if (path.startsWith('/api/drafts')) return route.fulfill({ json: { data: { id: 'keyboard-draft', version: 1 } } })
      if (path === '/api/v1/me/entitlements') return route.fulfill({ json: { data: { capabilities: [] } } })
      return route.fulfill({ json: { data: [], meta: { nextCursor: null, unreadCount: 0 } } })
    })
    await page.goto('/write')
    const paragraphs = page.getByRole('textbox', { name: 'Paragraph block', exact: true })
    await paragraphs.first().fill('First paragraph')
    await paragraphs.first().press('Enter')
    await expect(paragraphs).toHaveCount(2)
    await paragraphs.nth(1).fill('Second paragraph')
    const anchor = paragraphs.first()
    await anchor.fill('/')
    const menu = page.getByRole('listbox', { name: 'Insert block' })
    await expect(menu).toBeVisible()
    const pageScroll = await page.locator('#main-content').evaluate(element => element.scrollTop)
    const labels = ['Text', 'Heading 1', 'Heading 2', 'Heading 3', 'Quote', 'Code', 'Image URL', 'Divider']
    for (const label of [...labels.slice(1), ...labels]) {
      await page.keyboard.press('ArrowDown')
      await expect(anchor).toBeFocused()
      const selected = menu.getByRole('option', { name: `Insert ${label}`, exact: true })
      await expect(selected).toHaveAttribute('aria-selected', 'true')
      expect(await selected.evaluate(element => {
        const item = element.getBoundingClientRect()
        const panel = element.closest('[role=listbox]').getBoundingClientRect()
        return item.top >= panel.top && item.bottom <= panel.bottom
      })).toBe(true)
      expect(await page.locator('#main-content').evaluate(element => element.scrollTop)).toBe(pageScroll)
    }
    await page.keyboard.press('ArrowDown')
    await expect(menu.getByRole('option', { name: 'Insert Text', exact: true })).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('ArrowUp')
    await expect(menu.getByRole('option', { name: 'Insert Divider', exact: true })).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    await expect(anchor).toHaveValue('/')
    await anchor.fill('/h')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('textbox', { name: 'h2 block', exact: true })).toBeFocused()
    await expect(paragraphs).toHaveCount(1)
    await expect(paragraphs).toHaveValue('Second paragraph')
  })
}

test('slash selection survives autosave and empty filters recover safely', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/auth/refresh-token') return route.fulfill({ json: { accessToken: 'editor-save-token', user: 'Writer', email: 'writer@example.test', role: 'regular' } })
    if (path.startsWith('/api/drafts')) return route.fulfill({ json: { data: { id: 'keyboard-draft', version: 1 } } })
    if (path === '/api/v1/me/entitlements') return route.fulfill({ json: { data: { capabilities: [] } } })
    return route.fulfill({ json: { data: [], meta: { nextCursor: null, unreadCount: 0 } } })
  })
  await page.goto('/write')
  const paragraph = page.getByRole('textbox', { name: 'Paragraph block', exact: true })
  const menu = page.getByRole('listbox', { name: 'Insert block' })
  await paragraph.fill('/')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await expect(menu.getByRole('option', { name: 'Insert Heading 2' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('status').filter({ hasText: '✓ Saved' })).toBeVisible()
  await expect(menu.getByRole('option', { name: 'Insert Heading 2' })).toHaveAttribute('aria-selected', 'true')
  await paragraph.fill('/zzzz')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Enter')
  await expect(paragraph).toHaveValue('/zzzz')
  await expect(paragraph).toHaveCount(1)
  await paragraph.fill('/quote')
  await expect(menu.getByRole('option', { name: 'Insert Quote' })).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('textbox', { name: 'quote block', exact: true })).toHaveValue('')
})
