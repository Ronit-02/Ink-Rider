import { test, expect } from '@playwright/test'

const id = '507f1f77bcf86cd799439021'
const secondId = '507f1f77bcf86cd799439022'
const article = { id, title: 'A deeper explanation' }
const competition = { id, title: 'Writing challenge', status: 'judging', votingMode: 'judges', canEnter: true, entries: [{ id: 'entry-one', post: article, author: { username: 'Writer' }, likesCount: 0 }] }

async function fixture(page, judging = false) {
  const writes = []
  const windows = []
  await page.route(url => url.pathname.startsWith('/api/'), route => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    if (path === '/api/auth/refresh-token') return route.fulfill({ json: { accessToken: 'test', user: 'Writer', email: 'writer@example.test', role: 'admin' } })
    if (path === '/api/user/me') return route.fulfill({ json: { data: { role: 'admin', username: 'Writer' } } })
    if (['POST', 'PUT'].includes(request.method())) {
      if (path === '/api/post/') {
        writes.push({ path, body: request.postData() })
        return route.fulfill({ status: 500, json: { message: 'Publication fixture failure' } })
      }
      writes.push({ path, body: request.postDataJSON() })
      return route.fulfill({ status: 201, json: { data: path.startsWith('/api/drafts') ? { id: 'short-draft', version: writes.length + 1 } : {} } })
    }
    if (path === '/api/v1/me/entitlements') return route.fulfill({ json: { data: { capabilities: ['behind_scenes'] } } })
    if (path === '/api/drafts/short-draft') return route.fulfill({ json: { data: { title: 'A quick explanation', blocks: [{ id: 'text', type: 'text', content: 'Existing writing.' }], format: 'short', tags: ['science'], version: 1 } } })
    if (path === '/api/post/depth-options' || path.endsWith('/eligible-posts')) return route.fulfill({ json: { data: [article] } })
    if (path === '/api/competition') return route.fulfill({ json: { data: [competition, { ...competition, id: secondId, title: 'Second challenge' }] } })
    if (path.startsWith('/api/competition/')) return route.fulfill({ json: { data: { ...competition, status: judging ? 'judging' : 'open', id: path.split('/').at(-1) } } })
    if (path === '/api/staff/competition-fraud') windows.push(url.searchParams.get('minutes'))
    return route.fulfill({ json: { data: [], meta: { unreadCount: 0, nextCursor: null } } })
  })
  return { writes, windows }
}

async function checkDropdown(page, name, selection, parent) {
  const field = page.getByRole('combobox', { name, exact: true })
  await field.scrollIntoViewIfNeeded()
  await field.click()
  const list = page.getByRole('listbox', { name, exact: true })
  await expect(list).toBeVisible()
  await expect(list.getByRole('option').first()).toHaveCSS('font-size', '14px')
  expect((await field.boundingBox()).height).toBeGreaterThanOrEqual(44)
  expect((await list.getByRole('option').first().boundingBox()).height).toBeGreaterThanOrEqual(44)
  expect(Math.abs((await field.boundingBox()).width - (await list.boundingBox()).width)).toBeLessThanOrEqual(1)
  if (parent) await expect(parent.getByRole('listbox', { name, exact: true })).toBeVisible()
  await field.press('Escape')
  await expect(list).toHaveCount(0)
  await expect(field).toBeFocused()
  if (parent) await expect(parent).toBeVisible()
  await field.click()
  await list.getByRole('option', { name: selection, exact: true }).click()
  await expect(field).toHaveText(selection)
  await expect(field).toBeFocused()
  await field.click()
  await expect(list.getByRole('option', { name: selection, exact: true })).toHaveAttribute('aria-selected', 'true')
  await expect(list.getByRole('option', { name: selection, exact: true }).locator('svg')).toHaveCount(1)
  await field.press('Tab')
  await expect(list).toHaveCount(0)
  return field
}

async function setup(page, width) {
    await page.setViewportSize({ width, height: 820 })
    await page.addInitScript(theme => localStorage.setItem('ink-theme', theme), width === 320 ? 'light' : 'dark')
}

for (const width of [320, 1280]) {
  test(`collection visibility preserves the creation payload at ${width}px`, async ({ page }, testInfo) => {
    await setup(page, width)
    const { writes } = await fixture(page)
    await page.goto('/collections')
    await page.getByRole('button', { name: 'Create collection', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Create a collection' })
    await dialog.getByRole('textbox', { name: /Title/ }).fill('My collection')
    const visibility = await checkDropdown(page, 'Visibility', 'Private', dialog)
    await visibility.click()
    await page.getByRole('listbox', { name: 'Visibility' }).evaluate(list => Promise.all(list.getAnimations().map(animation => animation.finished)))
    await dialog.screenshot({ path: testInfo.outputPath('collection-select.png') })
    await visibility.press('Escape')
    await dialog.getByRole('button', { name: 'Create collection', exact: true }).click()
    await expect.poll(() => writes.find(write => write.path === '/api/collection')?.body).toEqual({ title: 'My collection', description: '', visibility: 'private', postIds: [] })
  })

  test(`competition article retains required validation and submission at ${width}px`, async ({ page }) => {
    await setup(page, width)
    const { writes } = await fixture(page)
    await page.goto(`/explore/competitions/${id}`)
    await page.getByRole('button', { name: 'Add your entry', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Submit an article' })
    const field = dialog.getByRole('combobox', { name: 'Your published article', exact: true })
    await expect(field).toHaveAttribute('aria-required', 'true')
    expect(await dialog.locator('form').evaluate(form => form.checkValidity())).toBe(false)
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    await field.press('Escape')
    await expect(dialog).toBeVisible()
    await checkDropdown(page, 'Your published article', article.title, dialog)
    expect(await dialog.locator('form').evaluate(form => form.checkValidity())).toBe(true)
    await dialog.getByRole('textbox', { name: /Author note/ }).fill('A useful entry')
    await dialog.getByRole('button', { name: 'Submit entry', exact: true }).click()
    await expect.poll(() => writes.find(write => write.path.endsWith('/entries'))?.body).toEqual({ postId: id, note: 'A useful entry' })
  })

  test(`short depth link is retained in publication at ${width}px`, async ({ page }) => {
    await setup(page, width)
    const { writes } = await fixture(page)
    await page.goto('/write?draft=short-draft')
    await page.getByText('Publishing options', { exact: true }).click()
    await checkDropdown(page, 'Deeper article (optional)', article.title)
    await page.getByRole('button', { name: 'Publish', exact: true }).click()
    await expect.poll(() => writes.find(write => write.path === '/api/post/')?.body).toContain(`name="depthParentId"\r\n\r\n${id}`)
    await expect(page.getByRole('combobox', { name: 'Deeper article (optional)', exact: true })).toHaveText(article.title)
  })

  test(`Member Hub audience is preserved in the update payload at ${width}px`, async ({ page }) => {
    await setup(page, width)
    const { writes } = await fixture(page)
    await page.goto('/members')
    await page.getByRole('button', { name: 'Creator studio', exact: true }).click()
    const section = page.getByRole('heading', { name: 'Publish a creator update' }).locator('..')
    await section.getByRole('textbox', { name: /Title/ }).fill('Process notes')
    await section.getByRole('textbox', { name: /Update/ }).fill('My writing process')
    await checkDropdown(page, 'Audience', 'My supporters')
    await section.getByRole('button', { name: 'Publish update', exact: true }).click()
    await expect.poll(() => writes.find(write => write.path === '/api/v1/creator-updates')?.body).toEqual({ title: 'Process notes', body: 'My writing process', audience: 'supporters' })
  })

  test(`Staff choices retain creation, winner reset, and numeric windows at ${width}px`, async ({ page }, testInfo) => {
    await setup(page, width)
    const { writes, windows } = await fixture(page, true)
    await page.goto('/staff')
    await page.getByRole('tab', { name: 'Competitions', exact: true }).click()
    await checkDropdown(page, 'Competition type', 'Reader choice')
    await checkDropdown(page, 'Voting mode', 'Hybrid')
    await page.getByRole('textbox', { name: /^Title/ }).fill('New challenge')
    await page.getByLabel('Opens', { exact: false }).fill('2027-01-01T12:00')
    await page.getByLabel('Closes', { exact: false }).fill('2027-01-08T12:00')
    await page.getByRole('button', { name: 'Create competition', exact: true }).click()
    await expect.poll(() => writes.find(write => write.path === '/api/competition')?.body).toMatchObject({ competitionType: 'reader_choice', votingMode: 'hybrid' })
    await checkDropdown(page, 'Competition', 'Writing challenge · judging')
    await page.getByRole('checkbox', { name: `Select ${article.title} as winner` }).check()
    await expect(page.getByRole('button', { name: 'Publish 1 winner', exact: true })).toBeEnabled()
    await checkDropdown(page, 'Competition', 'Second challenge · judging')
    await expect(page.getByRole('button', { name: 'Publish 0 winners', exact: true })).toBeDisabled()
    await page.getByRole('tab', { name: 'Vote review', exact: true }).click()
    const window = await checkDropdown(page, 'Window', 'Last hour')
    await expect.poll(() => windows.includes('60')).toBe(true)
    await window.press('Enter')
    await window.press('Home')
    await window.press('ArrowDown')
    await window.press('Enter')
    await expect(window).toHaveText('Last 30 minutes')
    await expect.poll(() => windows.includes('30')).toBe(true)
    await window.click()
    await page.getByRole('listbox', { name: 'Window' }).evaluate(list => Promise.all(list.getAnimations().map(animation => animation.finished)))
    await page.screenshot({ path: testInfo.outputPath('staff-select.png') })
    await window.press('Escape')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
