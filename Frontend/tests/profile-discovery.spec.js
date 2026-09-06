import { test, expect } from '@playwright/test'

const memberEmail = process.env.E2E_MEMBER_EMAIL || 'member@inkrider.local'
const password = process.env.E2E_PASSWORD || 'InkRiderDemo123!'

const writer = {
  id: '507f1f77bcf86cd799439011',
  handle: 'maya-sen',
  displayName: 'Maya Sen',
  bio: 'Essays on cities, memory, and public life.',
  avatarUrl: null,
  websiteUrl: null,
  writerStatus: 'writer',
  membershipEnabled: true,
  directRequestsEnabled: true,
  followersCount: 42,
  followingCount: 8,
  joinedAt: '2025-01-15T00:00:00.000Z',
  isFollowing: false,
  isSelf: false,
  posts: [],
}

const mockMemberProfileApi = async page => {
  let hasSession = false
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const request = route.request()
    const url = new URL(request.url())

    if (url.pathname === '/api/auth/refresh-token') {
      return route.fulfill({
        status: hasSession ? 200 : 401,
        contentType: 'application/json',
        body: JSON.stringify(hasSession
          ? { accessToken: 'profile-test-token', user: 'Priya Mehta', email: memberEmail, role: 'regular' }
          : { message: 'Signed out' }),
      })
    }
    if (url.pathname === '/api/auth/login' && request.method() === 'POST') {
      hasSession = true
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, token: 'profile-test-token', username: 'Priya Mehta', email: memberEmail, role: 'regular' }),
      })
    }
    if (url.pathname === '/api/writer/maya-sen') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: writer }) })
    }
    if (url.pathname === '/api/v1/me/entitlements') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { capabilities: ['direct_creator_requests'] } }) })
    }
    if (url.pathname === '/api/v1/notifications') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { unreadCount: 0 } }) })
    }

    return route.abort('blockedbyclient')
  })
}

test.describe('public writer profile discovery', () => {
  test('writer loading exposes a named status region on phone', async ({ page }) => {
    await page.route(url => url.pathname.startsWith('/api/'), async route => {
      const url = new URL(route.request().url())
      if (url.pathname === '/api/auth/refresh-token') {
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
      }
      if (url.pathname === '/api/writer/maya-sen') {
        await new Promise(resolve => setTimeout(resolve, 600))
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { username: 'Maya Sen', posts: [] } }) })
      }
      return route.abort('blockedbyclient')
    })

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/author/maya-sen', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('status', { name: 'Loading writer profile' })).toBeVisible()
  })

  test('writer recovery navigates through a real search link', async ({ page }) => {
    await page.goto('/author', { waitUntil: 'domcontentloaded' })

    const searchWritersLink = page.getByRole('link', { name: 'Search writers' })
    await expect(searchWritersLink).toHaveAttribute('href', '/search?type=writers')
    await searchWritersLink.click()

    await expect(page).toHaveURL(/\/search\?type=writers$/)
    await expect(page.getByRole('tab', { name: 'Writers' })).toHaveAttribute('aria-selected', 'true')
  })

  test('member direct-request form has visible labels and fits a phone viewport', async ({ page }) => {
    await mockMemberProfileApi(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.getByLabel('Email').fill(memberEmail)
    await page.getByLabel('Password').fill(password)
    const [loginResponse] = await Promise.all([
      page.waitForResponse(response => response.url().endsWith('/api/auth/login')),
      page.locator('form button[type="submit"]').click(),
    ])
    expect(loginResponse.status()).toBe(200)
    await page.waitForURL('**/', { waitUntil: 'domcontentloaded', timeout: 30_000 })

    await page.goto('/author/maya-sen', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Maya Sen', level: 1 })).toBeVisible()
    await expect(page.locator('main')).toHaveCount(1)

    const requestButton = page.getByRole('button', { name: 'Request an article' })
    await requestButton.click()
    await expect(requestButton).toHaveAttribute('aria-expanded', 'true')

    const subject = page.getByLabel('Request subject')
    const details = page.getByLabel('Request details')
    await expect(subject).toBeVisible()
    await expect(details).toBeVisible()
    await expect(subject).toHaveAttribute('aria-describedby', /creator-request-subject-help/)
    await expect(details).toHaveAttribute('aria-describedby', /creator-request-details-help/)

    await subject.fill('A labelled request')
    await details.fill('Useful context for the writer.')
    await expect(page.getByText('18/140', { exact: true })).toBeVisible()
    await expect(page.getByText('30/2000', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send request' })).toBeEnabled()

    const hasHorizontalOverflow = await page.evaluate(() => (
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    ))
    expect(hasHorizontalOverflow).toBe(false)
  })

  test('profile library tabs restore from a shareable URL state', async ({ page }) => {
    await page.route(url => url.pathname.startsWith('/api/'), async route => {
      const request = route.request()
      const url = new URL(request.url())
      if (url.pathname === '/api/auth/refresh-token') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ accessToken: 'profile-tab-token', user: 'Priya Mehta', email: memberEmail, role: 'regular' }),
        })
      }
      if (url.pathname === '/api/user/me') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {
          displayName: 'Priya Mehta', handle: 'priya-mehta', bio: 'Reader', avatarUrl: null,
          joinedAt: '2025-01-15T00:00:00.000Z', writerStatus: 'reader', role: 'regular',
          postCount: 0, followersCount: 0, followingCount: 0,
        } }) })
      }
      if (url.pathname === '/api/user/me/posts') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) })
      }
      if (url.pathname === '/api/v1/me/entitlements') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { capabilities: [] } }) })
      }
      if (url.pathname === '/api/v1/reading-history') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { continueReading: [], history: [] } }) })
      }
      return route.abort('blockedbyclient')
    })

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/profile?profileTab=history', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Recent history', level: 2 })).toBeVisible()
    await expect(page).toHaveURL(/\/profile\?profileTab=history$/)
    await expect(page.getByRole('tab', { name: 'Reading history' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('tabpanel', { name: 'Reading history content' })).toBeVisible()

    await page.getByRole('tab', { name: 'Overview' }).click()
    await expect(page).toHaveURL(/\/profile$/)
    await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
    await page.getByRole('tab', { name: 'Overview' }).press('End')
    await expect(page.getByRole('tab', { name: 'Analytics' })).toBeFocused()
    await expect(page).toHaveURL(/\/profile\?profileTab=analytics$/)
  })

  test('profile published-post failures expose a retry state on phone', async ({ page }) => {
    await page.route(url => url.pathname.startsWith('/api/'), async route => {
      const url = new URL(route.request().url())
      if (url.pathname === '/api/auth/refresh-token') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'profile-posts-token', user: 'Priya Mehta', email: memberEmail, role: 'regular' }) })
      }
      if (url.pathname === '/api/user/me') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { displayName: 'Priya Mehta', handle: 'priya-mehta', bio: 'Reader', avatarUrl: null, joinedAt: '2025-01-15T00:00:00.000Z', writerStatus: 'reader', role: 'regular', postCount: 0, followersCount: 0, followingCount: 0 } }) })
      }
      if (url.pathname === '/api/user/me/posts') {
        return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Unavailable' }) })
      }
      if (url.pathname === '/api/v1/me/entitlements') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { capabilities: [] } }) })
      }
      if (url.pathname === '/api/v1/reading-history') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { continueReading: [], history: [] } }) })
      }
      return route.abort('blockedbyclient')
    })

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/profile?profileTab=posts', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('alert')).toContainText('Published posts could not be loaded.')
    const retry = page.getByRole('button', { name: 'Try again' })
    expect((await retry.boundingBox())?.height).toBeGreaterThanOrEqual(40)
  })

  test('profile draft failures expose a retry state on phone', async ({ page }) => {
    await page.route(url => url.pathname.startsWith('/api/'), async route => {
      const url = new URL(route.request().url())
      if (url.pathname === '/api/auth/refresh-token') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'profile-drafts-token', user: 'Priya Mehta', email: memberEmail, role: 'regular' }) })
      }
      if (url.pathname === '/api/user/me') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { displayName: 'Priya Mehta', handle: 'priya-mehta', bio: 'Reader', avatarUrl: null, joinedAt: '2025-01-15T00:00:00.000Z', writerStatus: 'reader', role: 'regular', postCount: 0, followersCount: 0, followingCount: 0 } }) })
      }
      if (url.pathname === '/api/user/me/posts') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) })
      }
      if (url.pathname === '/api/drafts') {
        return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Unavailable' }) })
      }
      if (url.pathname === '/api/v1/me/entitlements') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { capabilities: [] } }) })
      }
      if (url.pathname === '/api/v1/reading-history') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { continueReading: [], history: [] } }) })
      }
      return route.abort('blockedbyclient')
    })

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/profile?profileTab=drafts', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('alert')).toContainText('Drafts could not be loaded.')
    const retry = page.getByRole('button', { name: 'Try again' })
    expect((await retry.boundingBox())?.height).toBeGreaterThanOrEqual(40)
  })

  test('profile draft loading exposes a named status region on phone', async ({ page }) => {
    await page.route(url => url.pathname.startsWith('/api/'), async route => {
      const request = route.request()
      const url = new URL(request.url())
      if (url.pathname === '/api/auth/refresh-token') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'profile-draft-loading-token', user: 'Priya Mehta', email: memberEmail, role: 'regular' }) })
      }
      if (url.pathname === '/api/user/me') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { displayName: 'Priya Mehta', handle: 'priya-mehta', bio: 'Reader', avatarUrl: null, joinedAt: '2025-01-15T00:00:00.000Z', writerStatus: 'reader', role: 'regular', postCount: 0, followersCount: 0, followingCount: 0 } }) })
      }
      if (url.pathname === '/api/user/me/posts') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) })
      }
      if (url.pathname === '/api/drafts') {
        await new Promise(resolve => setTimeout(resolve, 600))
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) })
      }
      if (url.pathname === '/api/v1/me/entitlements') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { capabilities: [] } }) })
      }
      return route.abort('blockedbyclient')
    })

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/profile?profileTab=drafts', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('status', { name: 'Loading drafts' })).toBeVisible()
  })
})
