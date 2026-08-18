import { test, expect } from '@playwright/test'

test('question detail exposes answers, published responses, and follow controls on phone', async ({ page }) => {
  const questionId = '507f1f77bcf86cd799439040'
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname === '/api/auth/refresh-token') return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    if (url.pathname === `/api/question/${questionId}`) {
      const body = JSON.stringify({ data: {
      id: questionId, text: 'How can cities preserve neighborhood memory?', context: 'Looking for a practical and humane explanation.', tags: ['science'], upvotesCount: 12, isUpvoted: false, followersCount: 4, isFollowing: false, status: 'answered', createdAt: '2026-08-24T00:00:00.000Z',
      author: { id: '507f1f77bcf86cd799439041', username: 'Priya Mehta', picture: null },
      answers: [{ id: '507f1f77bcf86cd799439042', text: 'Start by documenting lived experience with the people who hold it.', createdAt: '2026-08-24T01:00:00.000Z', upvotesCount: 3, isUpvoted: false, author: { id: '507f1f77bcf86cd799439043', username: 'Maya Sen', picture: null } }],
      responsePosts: [{ _id: '507f1f77bcf86cd799439044', title: 'Designing Better Questions for Better Technology' }],
      } })
      return route.fulfill({ status: 200, contentType: 'application/json', body })
    }
    return route.abort('blockedbyclient')
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`/explore/questions/${questionId}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'How can cities preserve neighborhood memory?', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Answers (1)' })).toBeVisible()
  await expect(page.getByText('Start by documenting lived experience with the people who hold it.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Report answer' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Designing Better Questions for Better Technology' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Follow question' })).toBeVisible()
  await expect(page.locator('main')).toHaveCount(1)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})

test('question detail announces its contextual loading state', async ({ page }) => {
  const questionId = '507f1f77bcf86cd799439045'
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const requestUrl = new URL(route.request().url())
    if (requestUrl.pathname === '/api/auth/refresh-token') return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Signed out' }) })
    if (requestUrl.pathname === `/api/question/${questionId}`) {
      await new Promise(resolve => setTimeout(resolve, 600))
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { id: questionId } }) })
    }
    return route.abort('blockedbyclient')
  })

  await page.goto(`/explore/questions/${questionId}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('status', { name: 'Loading question' })).toBeVisible()
})
