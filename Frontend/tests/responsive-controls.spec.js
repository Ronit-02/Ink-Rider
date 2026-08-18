import { test, expect } from '@playwright/test'

test('shared discovery pills expose selected state and phone-sized targets', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === '/api/competition') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/explore/competitions', { waitUntil: 'domcontentloaded' })

  const active = page.getByRole('button', { name: 'Active (0)', exact: true })
  const inactive = page.getByRole('button', { name: 'Inactive (0)', exact: true })
  await expect(active).toHaveAttribute('aria-pressed', 'true')
  await expect(inactive).toHaveAttribute('aria-pressed', 'false')

  const activeBounds = await active.boundingBox()
  const inactiveBounds = await inactive.boundingBox()
  expect(activeBounds?.height).toBeGreaterThanOrEqual(44)
  expect(inactiveBounds?.height).toBeGreaterThanOrEqual(44)

  await inactive.click()
  await expect(page).toHaveURL(/competitionTab=inactive/)
  await expect(active).toHaveAttribute('aria-pressed', 'false')
  await expect(inactive).toHaveAttribute('aria-pressed', 'true')
})

test('Explore sections expose route navigation and the active destination on phone', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === '/api/post/feed') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { nextCursor: null } }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/explore/questions', { waitUntil: 'domcontentloaded' })

  const navigation = page.getByRole('navigation', { name: 'Explore sections' })
  const links = navigation.getByRole('link')
  await expect(links).toHaveText(['Trending', 'Questions', 'Competitions'])
  await expect(navigation.getByRole('link', { name: 'Questions' })).toHaveAttribute('aria-current', 'page')
  for (const link of await links.all()) {
    expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(40)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

  await navigation.getByRole('link', { name: 'Competitions' }).click()
  await expect(page).toHaveURL('/explore/competitions')
  await expect(page.getByRole('navigation', { name: 'Explore sections' }).getByRole('link', { name: 'Competitions' })).toHaveAttribute('aria-current', 'page')
})

test('Saved library sections expose active tab state and shareable URL state on phone', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'saved-test-token', user: 'Priya Mehta', email: 'member@inkrider.local', role: 'regular' }) })
    }
    if (url.pathname === '/api/user/me/bookmarks') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/saved?savedSection=stories', { waitUntil: 'domcontentloaded' })

  const navigation = page.getByRole('tablist', { name: 'Saved library sections' })
  await expect(navigation.getByRole('tab', { name: 'Stories' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel', { name: 'Stories content' })).toBeVisible()
  for (const tab of await navigation.getByRole('tab').all()) {
    expect((await tab.boundingBox())?.height).toBeGreaterThanOrEqual(44)
  }

  await navigation.getByRole('tab', { name: 'Collections' }).click()
  await expect(page).toHaveURL(/\/saved\?savedSection=collections$/)
  await expect(navigation.getByRole('tab', { name: 'Collections' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel', { name: 'Collections content' })).toBeVisible()
  await navigation.getByRole('tab', { name: 'Collections' }).press('Home')
  await expect(navigation.getByRole('tab', { name: 'Stories' })).toBeFocused()
  await expect(page).toHaveURL(/\/saved\/?$/)
})

test('discovery loading states announce the surface currently being fetched', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (['/api/post/feed', '/api/question', '/api/competition', '/api/collection'].includes(url.pathname)) {
      await new Promise(resolve => setTimeout(resolve, 600))
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { nextCursor: null } }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/explore/trending', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('status', { name: 'Loading trending stories' })).toBeVisible()
  await page.goto('/explore/questions', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('status', { name: 'Loading reader questions' })).toBeVisible()
  await page.goto('/explore/competitions', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('status', { name: 'Loading competitions' })).toBeVisible()
  await page.goto('/collections', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('status', { name: 'Loading collections' })).toBeVisible()
})

test('collection views expose tab semantics and keyboard navigation on phone', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'collection-view-token', user: 'Priya Mehta', email: 'member@inkrider.local', role: 'regular' }) })
    }
    if (url.pathname === '/api/collection') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { nextCursor: null } }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/collections?collectionView=mine', { waitUntil: 'domcontentloaded' })

  const navigation = page.getByRole('tablist', { name: 'Collection views' })
  await expect(navigation.getByRole('tab', { name: 'My collections' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel', { name: 'My collections content' })).toBeVisible()
  await navigation.getByRole('tab', { name: 'My collections' }).press('Home')
  await expect(navigation.getByRole('tab', { name: 'Discover' })).toBeFocused()
  await expect(page).toHaveURL(/\/collections\/?$/)
  await expect(navigation.getByRole('tab', { name: 'Discover' })).toHaveAttribute('aria-selected', 'true')
  expect((await navigation.getByRole('tab', { name: 'Discover' }).boundingBox())?.height).toBeGreaterThanOrEqual(44)
})

test('shared filters expose phone-sized controls without changing desktop sizing', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/explore/trending', { waitUntil: 'domcontentloaded' })

  const trigger = page.getByRole('button', { name: 'Filters' })
  await expect(trigger).toBeVisible()
  expect((await trigger.boundingBox())?.height).toBeGreaterThanOrEqual(44)
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Filter by topic' })
  await expect(dialog).toBeVisible()
  expect((await dialog.getByRole('button', { name: 'All', exact: true }).boundingBox())?.height).toBeGreaterThanOrEqual(44)
  expect((await dialog.getByRole('combobox').boundingBox())?.height).toBeGreaterThanOrEqual(44)
  expect((await dialog.getByRole('button', { name: 'Close filters' }).boundingBox())?.height).toBeGreaterThanOrEqual(40)

  await dialog.getByRole('button', { name: 'Science', exact: true }).click()
  await dialog.getByRole('button', { name: 'Close filters' }).press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Reset filters' })).toBeFocused()
  await dialog.getByRole('button', { name: 'Reset filters' }).press('Tab')
  await expect(dialog.getByRole('button', { name: 'Close filters' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
})

test('search filters expose phone-sized topic and select controls', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/search?q=city', { waitUntil: 'domcontentloaded' })
  const trigger = page.getByRole('button', { name: 'Filters' })
  await expect(trigger).toBeVisible()
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Refine results' })
  await expect(dialog).toBeVisible()
  expect((await dialog.getByRole('button', { name: 'All', exact: true }).boundingBox())?.height).toBeGreaterThanOrEqual(44)
  for (const select of await dialog.getByRole('combobox').all()) {
    expect((await select.boundingBox())?.height).toBeGreaterThanOrEqual(44)
  }
})

test('search input keeps a visible keyboard focus indicator with custom outline styles', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/search?q=city', { waitUntil: 'domcontentloaded' })

  const searchInput = page.getByLabel('Search posts and writers')
  await searchInput.focus()
  await expect(searchInput).toBeFocused()
  await expect.poll(() => searchInput.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe('none')
})

test('search recovery action exposes a phone-sized retry target', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === '/api/search') {
      return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Unavailable' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/search?q=city', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Search is unavailable' })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('Search is unavailable')
  expect((await page.getByRole('button', { name: 'Try again' }).boundingBox())?.height).toBeGreaterThanOrEqual(40)
})

test('reading history recovery is announced and retryable on phone', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'history-test-token', user: 'Priya Mehta', email: 'member@inkrider.local', role: 'regular' }) })
    }
    if (url.pathname === '/api/v1/reading-history') {
      return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Unavailable' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/history', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('alert')).toContainText('Reading history could not be loaded.')
  expect((await page.getByRole('button', { name: 'Try again' }).boundingBox())?.height).toBeGreaterThanOrEqual(40)
})

test('short-read recovery is announced and retryable on phone', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === '/api/post/shorts') {
      return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Unavailable' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/shorts', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('alert')).toContainText('Short reads could not be loaded.')
  expect((await page.getByRole('button', { name: 'Try again' }).boundingBox())?.height).toBeGreaterThanOrEqual(40)
})

test('Home recovery action is an explicit button outside form submission semantics', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === '/api/post/feed') {
      return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Unavailable' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'The feed could not be loaded' })).toBeVisible()
  const retry = page.getByRole('button', { name: 'Try again' })
  await expect(retry).toHaveAttribute('type', 'button')
  expect((await retry.boundingBox())?.height).toBeGreaterThanOrEqual(40)
})

test('mobile primary navigation exposes phone-sized link targets', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/search', { waitUntil: 'domcontentloaded' })

  const navigation = page.getByRole('navigation', { name: 'Mobile primary navigation' })
  await expect(navigation).toBeVisible()
  const links = navigation.getByRole('link')
  await expect(links).toHaveCount(5)
  await expect(links).toHaveText(['Home', 'Explore', 'Search', 'Write', 'Profile'])
  for (const link of await links.all()) {
    expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(40)
  }
  await expect(navigation.getByRole('link', { name: 'Search' })).toHaveAttribute('aria-current', 'page')
})

test('desktop sidebar resize handle supports bounded keyboard controls', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/explore/trending', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => window.localStorage.removeItem('ink-rider.sidebar-width'))
  await page.reload({ waitUntil: 'domcontentloaded' })

  const handle = page.getByRole('separator', { name: 'Resize sidebar' })
  await expect(handle).toBeVisible()
  await expect(handle).toHaveAttribute('aria-valuenow', '200')
  await handle.focus()
  await handle.press('ArrowRight')
  await expect(handle).toHaveAttribute('aria-valuenow', '220')
  await handle.press('Home')
  await expect(handle).toHaveAttribute('aria-valuenow', '140')
  await handle.press('End')
  await expect(handle).toHaveAttribute('aria-valuenow', '300')
})

test('desktop sidebar width persists across reloads', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/explore/trending', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => window.localStorage.removeItem('ink-rider.sidebar-width'))
  await page.reload({ waitUntil: 'domcontentloaded' })

  const handle = page.getByRole('separator', { name: 'Resize sidebar' })
  await handle.focus()
  await handle.press('ArrowRight')
  await expect(handle).toHaveAttribute('aria-valuenow', '220')

  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('separator', { name: 'Resize sidebar' })).toHaveAttribute('aria-valuenow', '220')
})

test('desktop sidebar expands without motion when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const explore = page.getByRole('button', { name: 'Explore' })
  await explore.click()
  await expect(page.getByRole('link', { name: 'Trending' })).toBeVisible()
})

test('short-read comment navigation avoids smooth scrolling for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === '/api/short-series/series-1') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { id: 'series-1', title: 'A walkable city', description: 'Two practical short reads.', entriesCount: 1, isOwner: false, author: { username: 'Maya Sen' }, entries: [{ id: 'short-1', title: 'Start with the street' }] } }) })
    }
    if (url.pathname === '/api/post/short-1') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ postData: { _id: 'short-1', title: 'Start with the street', body: JSON.stringify([{ id: 'block-1', type: 'paragraph', text: 'A short idea worth reading.' }]), author: { username: 'Maya Sen' }, readTime: '1 min read', commentsCount: 0, likesCount: 0, isLiked: false, isBookmarked: false } }) })
    }
    if (url.pathname === '/api/post/short-1/comments') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { nextCursor: null } }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.addInitScript(() => {
    window.__scrollBehavior = null
    Element.prototype.scrollIntoView = options => { window.__scrollBehavior = options?.behavior || 'auto' }
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/shorts/series/series-1', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Start with the street' }).click()
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-busy', 'false')
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Start with the street' })).toHaveAttribute('id', 'short-read-title')
  await expect(page.locator('h1')).toHaveCount(1)
  await page.getByRole('button', { name: 'View 0 comments' }).click()
  await expect.poll(() => page.evaluate(() => window.__scrollBehavior)).toBe('auto')
})

test('competition detail back navigation exposes a phone-sized target', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === '/api/competition/competition-1') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 'competition-1', title: 'Writing about place', description: 'A community competition.', status: 'closed', closeDate: '2026-08-01T00:00:00.000Z', entriesCount: 0, entries: [], rules: [], prizes: [], votingMode: 'reader' } }),
      })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/explore/competitions/competition-1', { waitUntil: 'domcontentloaded' })

  const back = page.getByRole('link', { name: '← Competitions' })
  await expect(back).toBeVisible()
  expect((await back.boundingBox())?.height).toBeGreaterThanOrEqual(40)
})

test('404 recovery navigation exposes a phone-sized target', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/missing-route', { waitUntil: 'domcontentloaded' })

  const recovery = page.getByRole('link', { name: 'Return home' })
  await expect(page.getByRole('heading', { name: 'This page slipped between the lines.' })).toBeVisible()
  expect((await recovery.boundingBox())?.height).toBeGreaterThanOrEqual(40)
  await expect(recovery).toHaveAttribute('href', '/')
})

test('filter reset clears topic and sort state together and uses the topic label', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.goto('/collections?collectionVisibility=private&collectionSort=popular', { waitUntil: 'domcontentloaded' })
  const trigger = page.getByRole('button', { name: /Filters/ })
  await expect(trigger).toBeVisible()
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Filter by topic' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Reset filters' }).click()
  await expect(page).toHaveURL(/\/collections\/?$/)
})

test('short-series owner controls expose phone-sized reorder targets', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === '/api/short-series/series-1') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 'series-1', title: 'A walkable city', description: 'Two practical short reads.', entriesCount: 2, isOwner: true, author: { username: 'Maya Sen' }, entries: [{ id: 'short-1', title: 'Start with the street' }, { id: 'short-2', title: 'Design for a slower city' }] } }),
      })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/shorts/series/series-1', { waitUntil: 'domcontentloaded' })
  const earlier = page.getByRole('button', { name: 'Move Start with the street earlier' })
  const later = page.getByRole('button', { name: 'Move Start with the street later' })
  await expect(earlier).toBeVisible()
  expect((await earlier.boundingBox())?.height).toBeGreaterThanOrEqual(40)
  expect((await later.boundingBox())?.height).toBeGreaterThanOrEqual(40)
})

test('Home category controls expose phone-sized targets after deferred loading', async ({ page }) => {
  const posts = Array.from({ length: 8 }, (_, index) => ({
    id: `post-${index + 1}`,
    title: `A thoughtful story ${index + 1}`,
    excerpt: 'A short editorial excerpt.',
    image: null,
    tags: ['Science'],
    readTime: '4 min read',
    likesCount: 2,
    commentsCount: 0,
    author: { id: 'writer-1', username: 'Maya Sen', handle: 'maya-sen', picture: null },
  }))
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    if (url.pathname === '/api/post/feed') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: posts, meta: { nextCursor: null } }) })
    }
    if (url.pathname === '/api/question') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { nextCursor: null } }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle')
  await page.locator('[data-app-scroll]').evaluate(element => element.scrollTo(0, element.scrollHeight))
  const category = page.getByRole('button', { name: 'Science', exact: true })
  await expect(category).toBeVisible({ timeout: 10_000 })
  expect((await category.boundingBox())?.height).toBeGreaterThanOrEqual(40)
})

test('authentication fields expose native names, autocomplete, and required constraints', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.goto('/signup', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('textbox', { name: 'Full Name' })).toHaveAttribute('name', 'name')
  await expect(page.getByRole('textbox', { name: 'Full Name' })).toHaveAttribute('autocomplete', 'name')
  await expect(page.getByRole('textbox', { name: 'Full Name' })).toHaveAttribute('required', '')
  await expect(page.getByRole('textbox', { name: 'Email' })).toHaveAttribute('autocomplete', 'email')
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('autocomplete', 'new-password')
  await expect(page.getByLabel('Confirm Password', { exact: true })).toHaveAttribute('name', 'confirmPassword')
  await expect(page.locator('main')).toHaveCount(1)
})

test('member hub loading exposes a named status region on phone', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'member-loading-token', user: 'Priya Mehta', email: 'member@inkrider.local', role: 'regular' }) })
    }
    if (url.pathname === '/api/v1/me/entitlements') {
      await new Promise(resolve => setTimeout(resolve, 600))
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { capabilities: [] } }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/members', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('status', { name: 'Loading member hub' })).toBeVisible()
})

test('keyboard skip link moves focus to the application content region', async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const skipLink = page.getByRole('link', { name: 'Skip to content' })
  await expect(skipLink).toBeAttached()
  await page.keyboard.press('Tab')
  await expect(skipLink).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
})
