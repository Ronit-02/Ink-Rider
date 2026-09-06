import { test, expect } from '@playwright/test'

const searchResponse = {
  data: {
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
