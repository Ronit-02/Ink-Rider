import { test, expect } from '@playwright/test'

const searchResponse = {
  data: {
    suggestions: [{ text: 'making room for memory in growing cities', articleCount: 1 }],
    posts: [{
      id: '507f1f77bcf86cd799439012',
      title: 'Making room for memory in growing cities',
      image: null,
      author: { username: 'Maya Sen' },
    }],
    writers: [{
      id: '507f1f77bcf86cd799439011',
      handle: 'maya-sen',
      displayName: 'Maya Sen',
      avatarUrl: null,
    }],
    shorts: [],
  },
  meta: { query: 'maya', type: 'all' },
}

for (const loggedIn of [false, true]) {
  test(`mobile header search and Profile choices work for ${loggedIn ? 'members' : 'guests'}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('ink-theme', 'light'))
    await page.setViewportSize({ width: 325, height: 735 })
    await page.route(url => url.pathname.startsWith('/api/'), async route => {
      const url = new URL(route.request().url())
      if (url.pathname === '/api/auth/refresh-token') {
        return route.fulfill({ status: loggedIn ? 200 : 401, json: loggedIn
          ? { accessToken: 'navbar-test-token', user: 'Priya Mehta', email: 'member@inkrider.local', role: 'regular' }
          : { message: 'Signed out' } })
      }
      if (url.pathname === '/api/search') return route.fulfill({ json: searchResponse })
      if (url.pathname === '/api/v1/onboarding') return route.fulfill({ json: { data: { topics: [], selectedTopicSlugs: [] } } })
      if (url.pathname === '/api/user/me') return route.fulfill({ json: { data: { displayName: 'Priya Mehta', joinedAt: '2025-01-15', postCount: 0, followersCount: 0, followingCount: 0 } } })
      if (url.pathname === '/api/v1/me/entitlements') return route.fulfill({ json: { data: { capabilities: [] } } })
      if (url.pathname === '/api/v1/notifications') return route.fulfill({ json: { data: [], meta: { unreadCount: 0 } } })
      return route.fulfill({ json: { data: [], meta: { nextCursor: null } } })
    })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const header = page.getByRole('navigation', { name: 'Global navigation' })
    await expect(header.getByRole('link', { name: 'Ink Rider home' })).toBeVisible()
    await expect(header.getByRole('button', { name: /Use .* theme/ })).toBeHidden()
    await expect(header.getByText('Sign In', { exact: true })).toBeHidden()
    const search = header.getByRole('combobox', { name: 'Search posts and writers' })
    await expect(search).toBeVisible()
    const bounds = await header.getByRole('search').boundingBox()
    expect(bounds.x + bounds.width).toBeGreaterThan(300)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(325)
    await search.click()
    const dialogSearch = page.getByRole('dialog', { name: 'Search Ink Rider' }).getByRole('combobox')
    await dialogSearch.fill('maya')
    await expect(page.getByRole('listbox', { name: 'Search suggestions' })).toBeVisible()
    await dialogSearch.press('Escape')
    await page.getByRole('navigation', { name: 'Mobile primary navigation' }).getByRole('button', { name: 'Account' }).click()
    const account = page.getByRole('dialog', { name: 'Account', exact: true })
    await expect(account).toBeVisible()
    if (!loggedIn) {
      await expect(account.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible()
      await expect(account.getByRole('link', { name: 'Sign Up' })).toBeVisible()
    } else await expect(account.getByRole('link', { name: /My profile/ })).toBeVisible()
    await account.getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL(/\/settings$/)
    await page.getByLabel('Theme', { exact: true }).click()
    await page.getByRole('option', { name: 'Dark', exact: true }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await search.click()
    await dialogSearch.fill('memory')
    await dialogSearch.press('Enter')
    await expect(page).toHaveURL(/\/search\?q=memory$/)
    await expect(search).toBeVisible()
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(header.getByRole('button', { name: /Use .* theme/ })).toHaveCount(0)
    await expect(page.getByRole('navigation', { name: 'Desktop primary navigation' }).getByRole('link', { name: 'Settings' })).toBeVisible()
  })
}

test('global search suggestions support combobox keyboard navigation', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === '/api/search') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(searchResponse) })
    }
    if (url.pathname === '/api/post/feed') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { nextCursor: null } }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const search = page.getByRole('combobox', { name: 'Search posts and writers' })
  await search.fill('maya')
  await expect.poll(() => search.evaluate(element => getComputedStyle(element).outlineColor)).toBe('rgb(25, 25, 25)')
  await expect.poll(() => search.evaluate(element => getComputedStyle(element).outlineStyle)).toBe('none')

  const suggestions = page.getByRole('listbox', { name: 'Search suggestions' })
  await expect(suggestions).toBeVisible()
  await expect(search).toHaveAttribute('aria-expanded', 'true')
  await expect(suggestions.getByRole('option')).toHaveCount(2)

  await search.press('ArrowDown')
  await expect(search).toHaveAttribute('aria-activedescendant', 'search-suggestion-0')
  await expect(suggestions.getByRole('option').nth(0)).toHaveAttribute('aria-selected', 'true')

  await search.press('ArrowDown')
  await expect(search).toHaveAttribute('aria-activedescendant', 'search-suggestion-1')
  await expect(suggestions.getByRole('option').nth(1)).toHaveAttribute('aria-selected', 'true')

  await search.press('Enter')
  await expect(page).toHaveURL(/\/author\/maya-sen$/)
})

test('account menu supports focus entry, Arrow keys, and Escape restoration', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'navbar-test-token', user: 'Priya Mehta', email: 'member@inkrider.local', role: 'regular' }),
      })
    }
    if (url.pathname === '/api/v1/notifications') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { unreadCount: 0 } }) })
    }
    if (url.pathname === '/api/post/feed') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { nextCursor: null } }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const trigger = page.getByRole('button', { name: 'Open account menu' })
  await trigger.click()

  const menu = page.getByRole('menu', { name: 'Account' })
  await expect(menu).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')

  const viewProfile = menu.getByRole('menuitem', { name: 'View Profile' })
  const saved = menu.getByRole('menuitem', { name: 'Saved' })
  const signOutAll = menu.getByRole('menuitem', { name: 'Sign Out all Devices' })
  await expect(viewProfile).toBeFocused()

  await viewProfile.press('ArrowDown')
  await expect(saved).toBeFocused()
  await saved.press('End')
  await expect(signOutAll).toBeFocused()

  await signOutAll.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()
})

for (const width of [320, 1280]) {
  test(`content search offers five phrases and five authors at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.addInitScript(theme => localStorage.setItem('ink-theme', theme), width === 320 ? 'light' : 'dark')
    const requests = []
    await page.route(url => url.pathname.startsWith('/api/'), route => {
      const url = new URL(route.request().url())
      if (url.pathname === '/api/auth/refresh-token') return route.fulfill({ status: 401, json: { message: 'Signed out' } })
      if (url.pathname === '/api/search') {
        if (url.searchParams.get('suggestions') === 'true') {
          requests.push(Object.fromEntries(url.searchParams))
          return route.fulfill({ json: { data: {
            suggestions: Array.from({ length: 7 }, (_, index) => ({ text: `writing dialogue and developing believable characters ${index}`, articleCount: 7 - index })),
            writers: Array.from({ length: 7 }, (_, index) => ({ id: `writer-${index}`, handle: `writer-${index}`, displayName: `Writing author ${index}` })),
          } } })
        }
        return route.fulfill({ json: { data: { posts: [], writers: [], shorts: [], questions: [] } } })
      }
      return route.fulfill({ json: { data: [], meta: { nextCursor: null } } })
    })
    await page.goto('/')
    const header = page.getByRole('navigation', { name: 'Global navigation' })
    await header.getByRole('combobox').click()
    const input = width < 768 ? page.getByRole('dialog', { name: 'Search Ink Rider' }).getByRole('combobox') : header.getByRole('combobox')
    await input.fill('writ')
    const list = page.getByRole('listbox', { name: 'Search suggestions' })
    await expect(list.getByRole('group', { name: 'Search suggestions', exact: true }).getByRole('option')).toHaveCount(5)
    await expect(list.getByRole('group', { name: 'Authors', exact: true }).getByRole('option')).toHaveCount(5)
    await expect(header.getByRole('group', { name: 'Search result type' })).toHaveCount(0)
    expect(requests.at(-1)).toMatchObject({ q: 'writ', type: 'all', suggestions: 'true', limit: '5' })
    const longPhrase = list.getByRole('option').first()
    expect(await longPhrase.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
    await page.screenshot({ path: `node_modules/.cache/search-suggestions/${width}.png` })
    await page.setViewportSize({ width, height: 360 })
    const pageScroll = await page.locator('[data-app-scroll]').evaluate(element => element.scrollTop)
    for (let index = 0; index < 10; index += 1) await input.press('ArrowDown')
    await expect(list.getByRole('option').last()).toHaveAttribute('aria-selected', 'true')
    await expect(list.getByRole('option').last()).toBeInViewport()
    expect(await page.locator('[data-app-scroll]').evaluate(element => element.scrollTop)).toBe(pageScroll)
    await input.press('ArrowDown')
    await input.press('Enter')
    await expect(page).toHaveURL(/\/search\?q=writing%20dialogue%20and%20developing%20believable%20characters%200$/)
    await header.getByRole('combobox').click()
    const reopenedInput = width < 768 ? page.getByRole('dialog', { name: 'Search Ink Rider' }).getByRole('combobox') : header.getByRole('combobox')
    await reopenedInput.fill('writ')
    await expect(list.getByRole('option')).toHaveCount(10)
    for (let index = 0; index < 6; index += 1) await reopenedInput.press('ArrowDown')
    await expect(list.getByRole('option').nth(5)).toHaveAttribute('aria-selected', 'true')
    await reopenedInput.press('Enter')
    await expect(page).toHaveURL(/\/author\/writer-0$/)
  })

  test(`content search ignores older responses and supports empty/error submission at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    let releaseSlow
    let slowStarted = false
    let failed = true
    await page.route(url => url.pathname.startsWith('/api/'), async route => {
      const url = new URL(route.request().url())
      if (url.pathname === '/api/auth/refresh-token') return route.fulfill({ status: 401, json: { message: 'Signed out' } })
      if (url.pathname === '/api/search') {
        const query = url.searchParams.get('q')
        if (query === 'slow') {
          slowStarted = true
          await new Promise(resolve => { releaseSlow = resolve })
        }
        if (query === 'failed' && failed) return route.fulfill({ status: 500, json: { message: 'Unavailable' } })
        return route.fulfill({ json: { data: { suggestions: query === 'empty' ? [] : [{ text: `${query} phrase`, articleCount: 1 }], writers: [], posts: [], shorts: [] } } })
      }
      return route.fulfill({ json: { data: [], meta: { nextCursor: null } } })
    })
    await page.goto('/')
    const header = page.getByRole('navigation', { name: 'Global navigation' })
    await header.getByRole('combobox').click()
    const surface = width < 768 ? page.getByRole('dialog', { name: 'Search Ink Rider' }) : page
    const input = width < 768 ? surface.getByRole('combobox') : header.getByRole('combobox')
    await input.fill('slow')
    await expect.poll(() => slowStarted).toBe(true)
    await input.fill('fresh')
    await expect(surface.getByRole('option')).toHaveText('fresh phrase')
    releaseSlow()
    await expect(surface.getByRole('option')).toHaveText('fresh phrase')
    await input.fill('empty')
    await expect(surface.getByText(/No matching searches or authors/)).toBeVisible()
    await expect(surface.getByRole('option')).toHaveCount(0)
    await input.fill('failed')
    await expect(surface.getByText(/Suggestions are unavailable/)).toBeVisible()
    await expect(surface.getByRole('option')).toHaveCount(0)
    if (width < 768) {
      failed = false
      await surface.getByRole('button', { name: 'Try again' }).click()
      await expect(surface.getByRole('option')).toHaveText('failed phrase')
    }
    await input.press('Enter')
    await expect(page).toHaveURL(/\/search\?q=failed$/)
  })
}
