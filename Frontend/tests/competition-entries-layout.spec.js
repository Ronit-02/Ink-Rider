import { test, expect } from '@playwright/test'

for (const width of [320, 390, 600, 1280]) {
  test(`competition entries wrap metadata and separate voting at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    const entry = { id: 'entry-1', author: { username: 'Maya Sen With A Longer Writer Name', handle: 'maya-custom-handle' }, likesCount: 2, rank: 1, isWinner: true, isVoted: false, post: { _id: 'post-1', title: 'The Quiet Architecture of a Walkable City', createdAt: '2026-09-08T00:00:00Z', readTime: '12 min read', commentsCount: 2, coverImage: '/logo/logo-dark-profile.png' } }
    let voteMethod
    let status = 'open'
    await page.route(url => url.pathname.startsWith('/api/'), route => {
      const request = route.request()
      const path = new URL(request.url()).pathname
      if (path === '/api/auth/refresh-token') return route.fulfill({ json: { accessToken: 'entry-test-token', user: 'Reader', email: 'reader@example.test', role: 'regular' } })
      if (path.endsWith('/entries/entry-1/vote')) {
        voteMethod = request.method()
        entry.isVoted = request.method() === 'PUT'
        entry.likesCount = entry.isVoted ? 3 : 2
        return route.fulfill({ json: { data: entry } })
      }
      if (path === '/api/competition/contest-1') return route.fulfill({ json: { data: { id: 'contest-1', title: 'Writing about place', description: 'A community competition.', status, closeDate: '2026-11-01T00:00:00Z', votingMode: 'readers', entriesCount: 2, entries: [entry, { ...entry, id: 'entry-2', isWinner: false, post: null }] } } })
      return route.fulfill({ json: { data: [], meta: { nextCursor: null } } })
    })
    await page.goto('/explore/competitions/contest-1')
    const card = page.getByRole('article').first()
    const button = card.getByRole('button', { name: `Vote for ${entry.post.title}` })
    await expect(card.getByText('12 min read', { exact: false })).toBeVisible()
    await expect(card.getByText(entry.author.username)).toBeVisible()
    await expect(card.getByText('Winner', { exact: true })).toBeVisible()
    const bounds = await card.evaluate(element => {
      const content = element.children[1]
      const metadata = content.firstElementChild.children[1]
      return { content: content.getBoundingClientRect().toJSON(), vote: element.querySelector('button').getBoundingClientRect().toJSON(), metadataClipped: metadata.scrollWidth > metadata.clientWidth }
    })
    if (width < 640) {
      expect(bounds.vote.y).toBeGreaterThanOrEqual(bounds.content.bottom)
      expect(bounds.metadataClipped).toBe(false)
    } else expect(bounds.vote.y).toBeLessThan(bounds.content.y)
    expect(bounds.vote.height).toBeGreaterThanOrEqual(44)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(card.getByRole('link', { name: entry.post.title })).toHaveAttribute('href', '/post/post-1')
    await button.click()
    await expect(card.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    expect(voteMethod).toBe('PUT')
    await card.getByRole('button').click()
    await expect(card.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    expect(voteMethod).toBe('DELETE')
    await expect(page.getByRole('article').nth(1).getByText('Unavailable article')).toBeVisible()
    if (width === 390) {
      await card.evaluate(element => element.scrollIntoView({ block: 'center' }))
      await card.screenshot({ path: 'test-results/competition-entry-mobile.png' })
      await page.evaluate(() => localStorage.setItem('ink-theme', 'dark'))
      await page.reload()
      await expect(page.locator('html')).toHaveClass(/dark/)
      await expect(card.getByText(entry.author.username)).toBeVisible()
      await card.evaluate(element => element.scrollIntoView({ block: 'center' }))
      await card.screenshot({ path: 'test-results/competition-entry-dark.png' })
    }
    status = 'closed'
    entry.isVoted = true
    await page.reload()
    await expect(page.getByText('Reader voting is closed.', { exact: false })).toBeVisible()
    await expect(page.getByRole('article').getByRole('button')).toHaveCount(0)
    await expect(card.getByRole('link', { name: entry.post.title })).toBeVisible()
    await expect(card.getByText('Rank 1', { exact: true })).toBeVisible()
    await card.evaluate(element => element.scrollIntoView({ block: 'center' }))
    const targets = await card.evaluate(element => {
      const author = element.querySelector('a[aria-label]')
      const avatar = author.firstElementChild.getBoundingClientRect()
      const cover = element.firstElementChild.getBoundingClientRect()
      const rank = element.querySelector('h3').nextElementSibling.getBoundingClientRect()
      return [avatar, cover, rank].map(rect => document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest('a')?.getAttribute('href'))
    })
    expect(targets).toEqual(['/author/maya-custom-handle', '/post/post-1', '/post/post-1'])
    const authorLink = card.getByRole('link', { name: `View ${entry.author.username}'s profile` })
    await expect(authorLink).toHaveAttribute('href', '/author/maya-custom-handle')
    await authorLink.getByText(entry.author.username).click()
    await expect(page).toHaveURL('/author/maya-custom-handle')
    await page.goto('/explore/competitions/contest-1')
    await authorLink.locator(':scope > :first-child').click()
    await expect(page).toHaveURL('/author/maya-custom-handle')
    await page.goto('/explore/competitions/contest-1')
    await card.evaluate(element => element.scrollIntoView({ block: 'center' }))
    await card.click({ position: { x: 20, y: 30 } })
    await expect(page).toHaveURL('/post/post-1')
  })
}
