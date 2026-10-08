import { test, expect } from '@playwright/test'

const postId = '507f1f77bcf86cd799439012'
const writerId = '507f1f77bcf86cd799439011'
const post = { _id: postId, title: 'A focused idea', body: JSON.stringify([{ id: 'text', type: 'text', content: 'An article for deterministic pending-state coverage.' }]), author: { _id: writerId, username: 'Maya Sen', handle: 'maya-sen' }, tags: [], likesCount: 0, commentsCount: 0, isBookmarked: false, createdAt: '2026-09-08T00:00:00Z' }
const writer = { id: writerId, handle: 'maya-sen', displayName: 'Maya Sen', bio: 'A writer.', posts: [], followersCount: 2, followingCount: 0, joinedAt: '2025-01-15T00:00:00Z', isFollowing: false, isSelf: false }
const competition = { id: 'contest-1', title: 'Writing about place', description: 'A writing competition.', status: 'open', votingMode: 'readers', closeDate: '2026-11-01T00:00:00Z', entries: [{ id: 'entry-1', author: post.author, likesCount: 2, isVoted: false, post }] }
const fixtures = {
  [`/api/post/${postId}`]: { postData: post },
  '/api/writer/maya-sen': { data: writer },
  '/api/competition/contest-1': { data: competition },
  '/api/v1/me/entitlements': { data: { capabilities: [], membership: { plan: 'free', status: 'inactive' } } },
  '/api/v1/notifications': { data: [{ _id: 'notice-1', title: 'An update', href: '/', readAt: null, createdAt: '2026-09-08T00:00:00Z' }], meta: { unreadCount: 1 } },
  '/api/collection': { data: [{ id: 'collection-1', title: 'Useful ideas', visibility: 'public', author: post.author, postsCount: 0, isSaved: false }], meta: { nextCursor: null } },
}

async function holdAction(page, path, signedIn = true) {
  let release
  let calls = 0
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const pathname = new URL(route.request().url()).pathname
    if (pathname === path) {
      calls++
      await new Promise(resolve => { release = resolve })
      return route.fulfill({ status: 500, json: { message: 'Deterministic action failure' } })
    }
    if (pathname === '/api/auth/refresh-token') return signedIn ? route.fulfill({ json: { accessToken: 'pending-test', user: 'Reader', email: 'reader@example.test', role: 'regular' } }) : route.fulfill({ status: 401, json: { message: 'Signed out' } })
    return route.fulfill({ json: fixtures[pathname] || { data: [], meta: { nextCursor: null, unreadCount: 0 } } })
  })
  return { calls: () => calls, release: () => release() }
}

async function expectMuted(button) {
  await expect(button).toBeDisabled()
  await expect(button).toHaveAttribute('aria-busy', 'true')
  await expect(button).toHaveCSS('opacity', '1')
  await expect(button).toHaveCSS('cursor', 'wait')
  await expect(button.locator('.animate-spin')).toHaveCount(0)
  await expect.poll(() => button.evaluate(element => {
    const probe = document.createElement('span')
    probe.style.background = 'color-mix(in srgb, var(--color-accent) 60%, var(--color-surface))'
    element.appendChild(probe)
    const expected = getComputedStyle(probe).backgroundColor
    probe.remove()
    return getComputedStyle(element).backgroundColor === expected
  })).toBe(true)
}

const actions = [
  { name: 'post bookmark icon', page: `/post/${postId}`, path: `/api/post/${postId}/bookmark`, button: /Save this article|Remove from saved articles/ },
  { name: 'writer follow', page: '/author/maya-sen', path: `/api/writer/${writerId}/follow`, button: /^(Follow|Following)$/ },
  { name: 'competition vote', page: '/explore/competitions/contest-1', path: '/api/competition/contest-1/entries/entry-1/vote', button: /Vote for A focused idea/ },
  { name: 'membership checkout', page: '/membership', path: '/api/v1/billing/checkout', button: 'Become a member' },
  { name: 'notification mark-all', page: '/notifications', path: '/api/v1/notifications/read-all', button: 'Mark all read' },
]

for (const { theme, width } of [{ theme: 'light', width: 320 }, { theme: 'dark', width: 1280 }]) {
  for (const action of actions) {
    test(`${action.name} uses muted loading and recovers in ${theme} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.addInitScript(value => localStorage.setItem('ink-theme', value), theme)
      const held = await holdAction(page, action.path)
      await page.goto(action.page)
      const button = page.getByRole('button', { name: action.button, exact: true }).first()
      await expect(button).toBeEnabled()
      await button.click()
      await expectMuted(button)
      await button.evaluate(element => element.click())
      await expect.poll(held.calls).toBe(1)
      held.release()
      await expect(button).toBeEnabled()
      await expect(button).toHaveAttribute('aria-busy', 'false')
      await button.click()
      await expect.poll(held.calls).toBe(2)
      await expectMuted(button)
      held.release()
      await expect(button).toBeEnabled()
    })
  }
}

test('login preserves its label and dimensions through a delayed failure', async ({ page }) => {
  const held = await holdAction(page, '/api/auth/login', false)
  await page.goto('/login')
  await page.getByPlaceholder('Email', { exact: true }).fill('reader@example.test')
  await page.getByPlaceholder('Password', { exact: true }).fill('Example-password-123')
  const button = page.locator('#auth-form button[type="submit"]')
  const before = await button.boundingBox()
  await button.click()
  await expectMuted(button)
  await expect(button).toHaveText('Login')
  const after = await button.boundingBox()
  expect(after.width).toBe(before.width)
  expect(after.height).toBe(before.height)
  await button.evaluate(element => element.click())
  await expect.poll(held.calls).toBe(1)
  held.release()
  await expect(button).toBeEnabled()
})

test('clipboard copy keeps its label while pending and can retry a failure', async ({ page }) => {
  await holdAction(page, '/unused-action')
  await page.addInitScript(() => {
    window.copyCalls = 0
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => {
      window.copyCalls++
      return new Promise((resolve, reject) => { window.rejectCopy = () => reject(new Error('Unavailable')) })
    } } })
  })
  await page.goto(`/post/${postId}`)
  await page.getByRole('button', { name: 'Share this article' }).click()
  const copy = page.getByRole('button', { name: 'Copy Link', exact: true })
  await copy.click()
  await expectMuted(copy)
  await expect(copy).toHaveText('Copy Link')
  await expect(page.getByRole('button', { name: 'Share on X' })).toBeDisabled()
  await copy.evaluate(element => element.click())
  expect(await page.evaluate(() => window.copyCalls)).toBe(1)
  await page.evaluate(() => window.rejectCopy())
  await expect(copy).toBeEnabled()
  await copy.click()
  await expectMuted(copy)
  expect(await page.evaluate(() => window.copyCalls)).toBe(2)
  await page.evaluate(() => window.rejectCopy())
  await expect(copy).toBeEnabled()
})

test('verification and resend use the same fill and prevent overlapping requests', async ({ page }) => {
  let release
  const calls = []
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/auth/login') return route.fulfill({ status: 403, json: { code: 'EMAIL_NOT_VERIFIED', message: 'Verify your email.' } })
    if (path === '/api/auth/resend-otp' || path === '/api/auth/verify-email') {
      calls.push(path)
      await new Promise(resolve => { release = resolve })
      return route.fulfill({ status: 500, json: { message: 'Try again.' } })
    }
    return route.fulfill({ status: 401, json: { message: 'Signed out' } })
  })
  await page.goto('/login')
  await page.getByPlaceholder('Email', { exact: true }).fill('reader@example.test')
  await page.getByPlaceholder('Password', { exact: true }).fill('Example-password-123')
  await page.locator('#auth-form button[type="submit"]').click()
  const resend = page.getByRole('button', { name: 'Resend OTP' })
  const verify = page.getByRole('button', { name: 'Verify Email' })
  await resend.click()
  await expectMuted(resend)
  await expect(verify).toBeDisabled()
  await verify.evaluate(element => element.click())
  await expect.poll(() => calls.length).toBe(1)
  release()
  await expect(resend).toBeEnabled()
  for (let index = 1; index <= 6; index++) await page.getByLabel(`Verification digit ${index}`).fill('1')
  await verify.click()
  await expectMuted(verify)
  await expect(resend).toBeDisabled()
  await expect.poll(() => calls.length).toBe(2)
  release()
  await expect(verify).toBeEnabled()
})

test('a query retry is visibly busy while refetching', async ({ page }) => {
  let count = 0
  let release
  await holdAction(page, '/unused-action')
  await page.route(`**/api/post/${postId}`, async route => {
    count++
    if (count <= 2) return route.fulfill({ status: 500, json: { message: 'Unavailable' } })
    await new Promise(resolve => { release = resolve })
    return route.fulfill({ json: { postData: post } })
  })
  await page.goto(`/post/${postId}`)
  const retry = page.getByRole('button', { name: 'Try again', exact: true })
  await retry.click()
  await expectMuted(retry)
  await retry.evaluate(element => element.click())
  await expect.poll(() => Boolean(release)).toBe(true)
  const pendingCount = count
  release()
  await expect(page.getByRole('heading', { name: post.title, exact: true })).toBeVisible()
  expect(count).toBe(pendingCount)
})

test('collection menu stays visible during save and permits retry after failure', async ({ page }) => {
  const held = await holdAction(page, '/api/collection/collection-1/save')
  await page.goto('/collections')
  await page.getByRole('button', { name: 'More options for Useful ideas' }).click()
  const save = page.getByRole('menuitem', { name: 'Save collection' })
  await save.click()
  await expectMuted(save)
  await save.evaluate(element => element.click())
  await expect.poll(held.calls).toBe(1)
  held.release()
  await expect(save).toBeEnabled()
})

test('staff review distinguishes validation-disabled from busy and recovers', async ({ page }) => {
  const held = await holdAction(page, '/api/staff/competition-fraud/reviews')
  await page.route('**/api/auth/refresh-token', route => route.fulfill({ json: { accessToken: 'staff-pending', user: 'Admin', email: 'admin@example.test', role: 'admin' } }))
  await page.route('**/api/user/me', route => route.fulfill({ json: { data: { role: 'admin', username: 'Admin' } } }))
  await page.route('**/api/staff/competition-fraud?*', route => route.fulfill({ json: { data: [{ competitionId: 'contest-1', signalType: 'NETWORK', distinctVoterCount: 4, voteCount: 4, reason: 'CROSS_ACCOUNT_SIGNAL' }], meta: { analyzedVoteCount: 4 } } }))
  await page.goto('/staff')
  await page.getByRole('tab', { name: 'Vote review' }).click()
  const review = page.getByRole('button', { name: 'Confirm signal' })
  await expect(review).toBeDisabled()
  await expect(review).toHaveAttribute('aria-busy', 'false')
  await page.getByLabel('Review note for network signal').fill('Review the aggregate signal.')
  await review.click()
  await expectMuted(review)
  await review.evaluate(element => element.click())
  await expect.poll(held.calls).toBe(1)
  held.release()
  await expect(review).toBeEnabled()
})

test('sign-out keeps the desktop account menu visible during the request', async ({ page }) => {
  const held = await holdAction(page, '/api/auth/logout')
  await page.setViewportSize({ width: 1280, height: 844 })
  await page.goto(`/post/${postId}`)
  await page.getByRole('button', { name: 'Open account menu' }).click()
  const signOut = page.getByRole('menuitem', { name: 'Sign Out', exact: true })
  await signOut.click()
  await expectMuted(signOut)
  await signOut.evaluate(element => element.click())
  await expect.poll(held.calls).toBe(1)
  held.release()
  await expect(signOut).toBeEnabled()
})
