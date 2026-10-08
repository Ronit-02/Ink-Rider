import { test, expect } from '@playwright/test'

async function mockEditor(page, { capabilities = [], saveStatus = 200 } = {}) {
  const saves = []
  const publications = []
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (path === '/api/auth/refresh-token') return route.fulfill({ json: { accessToken: 'editor-test-token', user: 'Test Writer', email: 'writer@example.test', role: 'regular' } })
    if (path === '/api/v1/me/entitlements') return route.fulfill({ json: { data: { capabilities } } })
    if (path.startsWith('/api/drafts') && ['POST', 'PUT'].includes(request.method())) {
      saves.push(request.postDataJSON())
      return route.fulfill({ status: saveStatus, json: saveStatus === 200 ? { data: { id: 'draft-layout', version: saves.length } } : { message: 'Save unavailable' } })
    }
    if (path === '/api/drafts/draft-layout' && request.method() === 'GET') return route.fulfill({ json: { data: { title: 'Existing draft', blocks: [{ id: 'paragraph', type: 'text', content: 'Existing draft content.' }], tags: ['writing'], format: 'short', version: 1 } } })
    if (path === '/api/post/' && request.method() === 'POST') {
      publications.push(request.postData())
      return route.fulfill({ status: 400, json: { message: 'Publication test: draft preserved.' } })
    }
    return route.fulfill({ json: { data: [], meta: { nextCursor: null, unreadCount: 0 } } })
  })
  return { saves, publications }
}

for (const size of [{ width: 320, height: 735 }, { width: 390, height: 844 }, { width: 768, height: 900 }, { width: 1280, height: 900 }]) {
  test(`story details precede writing in one column at ${size.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(size)
    await page.emulateMedia({ colorScheme: size.width === 390 ? 'dark' : 'light' })
    const { saves, publications } = await mockEditor(page)
    await page.goto('/write')
    const title = page.getByRole('textbox', { name: 'Article title', exact: true })
    const body = page.getByRole('textbox', { name: 'Paragraph block', exact: true })
    await expect(title).toBeInViewport()
    await expect(body).toBeInViewport()
    expect((await body.boundingBox()).x).toBe((await title.boundingBox()).x)
    await page.screenshot({ path: testInfo.outputPath('editor-initial.png') })
    const details = page.locator('details')
    await expect(details).toHaveJSProperty('open', false)
    const detailsBounds = await details.boundingBox()
    const editorBounds = await page.getByRole('region', { name: 'Writing area' }).boundingBox()
    expect(detailsBounds.y + detailsBounds.height).toBeLessThan(editorBounds.y)
    expect(detailsBounds.x).toBe(editorBounds.x)
    expect(detailsBounds.width).toBe(editorBounds.width)
    await details.locator('summary').click()
    const cover = page.getByRole('button', { name: '+ Add cover image', exact: true })
    await expect(cover).toBeVisible()
    expect((await cover.boundingBox()).height).toBeLessThan(80)
    expect((await details.boundingBox()).y + (await details.boundingBox()).height).toBeLessThan((await title.boundingBox()).y)
    await page.getByRole('button', { name: 'Short read', exact: true }).click()
    await page.getByRole('textbox', { name: 'Short title', exact: true }).fill('A focused idea')
    await body.fill('This is a short explanation with enough content to test the existing publishing controls.')
    await page.getByLabel('Add a tag', { exact: true }).fill('writing')
    await page.getByRole('button', { name: 'Add', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Publish', exact: true })).toBeEnabled()
    await expect.poll(() => saves.some(save => save.tags?.includes('writing') && save.title === 'A focused idea')).toBe(true)
    await expect(page.getByRole('status').filter({ hasText: '✓ Saved' })).toBeVisible()
    await details.locator('summary').click()
    await expect(details).toHaveJSProperty('open', false)
    await details.locator('summary').focus()
    await page.keyboard.press('Enter')
    await expect(page.getByLabel('Add a tag', { exact: true })).toHaveValue('')
    await expect(page.getByRole('button', { name: 'Open assistant', exact: true })).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath('editor-layout.png'), fullPage: true })
    await page.getByRole('button', { name: 'Publish', exact: true }).click()
    await expect(page.locator('#main-content').getByRole('alert').filter({ hasText: 'Publication test: draft preserved.' })).toBeVisible()
    expect(publications).toHaveLength(1)
    expect(publications[0]).toContain('A focused idea')
    await expect(page.getByRole('textbox', { name: 'Short title', exact: true })).toHaveValue('A focused idea')
  })
}

test('member release settings remain available without writing assistance', async ({ page }) => {
  const assistantRequests = []
  page.on('request', request => { if (request.url().includes('/writing-assistant')) assistantRequests.push(request.url()) })
  await page.setViewportSize({ width: 320, height: 568 })
  await mockEditor(page, { capabilities: ['early_access', 'ai_writing_assistant'] })
  await page.goto('/write')
  await page.getByRole('textbox', { name: 'Paragraph block', exact: true }).fill('Your writing stays in the editor.')
  await page.locator('details summary').click()
  await expect(page.getByLabel('Public release')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Writing assistant', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Open assistant', exact: true })).toHaveCount(0)
  expect(assistantRequests).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('cover removal restores article requirements', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await mockEditor(page)
  await page.goto('/write')
  await page.getByRole('textbox', { name: 'Article title', exact: true }).fill('An article')
  await page.getByRole('textbox', { name: 'Paragraph block', exact: true }).fill('Article body.')
  await page.locator('details summary').click()
  await page.getByLabel('Add a tag', { exact: true }).fill('writing')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await page.locator('input[type=file]').setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZ94AAAAASUVORK5CYII=', 'base64') })
  await expect(page.getByRole('button', { name: 'Publish', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Remove cover image' }).click()
  await expect(page.getByRole('button', { name: 'Publish', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: '+ Add cover image', exact: true })).toBeVisible()
})

test('draft load and save failures keep visible recovery feedback', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 735 })
  await mockEditor(page, { saveStatus: 409 })
  await page.goto('/write?draft=draft-layout')
  await expect(page.getByRole('textbox', { name: 'Short title', exact: true })).toHaveValue('Existing draft')
  await expect(page.getByRole('textbox', { name: 'Paragraph block', exact: true })).toHaveValue('Existing draft content.')
  await page.getByRole('textbox', { name: 'Short title', exact: true }).fill('Edited draft')
  await expect(page.getByRole('alert').filter({ hasText: 'This draft changed in another tab.' })).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: 'Draft conflict' })).toBeVisible()
})
