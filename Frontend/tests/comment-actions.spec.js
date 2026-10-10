import { test, expect } from '@playwright/test'

const postId = '507f1f77bcf86cd799439012'
const parentId = '507f1f77bcf86cd799439013'
const date = '2026-10-10T00:00:00Z'
async function fixture(page, { guest = false, longName = false, commentText = 'An original comment', replyText = 'Someone else replied' } = {}) {
  const records = [
    { id: parentId, content: commentText, createdAt: date, author: { name: 'Reader' }, canEdit: true, canDelete: true, likesCount: 0, isLiked: false, parentCommentId: null },
    { id: 'reply-1', content: replyText, createdAt: date, author: { name: 'Other reader' }, canEdit: false, canDelete: false, parentCommentId: parentId },
    { id: 'reply-2', content: 'A second reply', createdAt: date, author: { name: 'Other reader' }, parentCommentId: parentId },
  ]
  if (longName) records[0].author.name = 'abcdefghijklmnopqrstuvwxyz1234'
  const state = { requests: [], fail: null, hold: null }
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const req = route.request()
    const url = new URL(req.url())
    const method = req.method()
    if (url.pathname === '/api/auth/refresh-token') return route.fulfill({ status: guest ? 401 : 200, json: guest ? { message: 'Signed out' } : { accessToken: 'test-token', user: 'Reader', email: 'reader@example.test', role: 'regular' } })
    if (url.pathname === '/api/writer/writer') return route.fulfill({ json: { data: { id: 'writer-id', handle: 'writer', displayName: 'Writer', joinedAt: date, followersCount: 0, posts: [{ id: postId, title: 'Comment action testing', tags: [], createdAt: date, commentsCount: 3 }] } } })
    if (url.pathname === `/api/post/${postId}`) return route.fulfill({ json: { postData: { _id: postId, title: 'Comment action testing', body: JSON.stringify([{ id: 'text', type: 'text', content: 'Read and discuss.' }]), tags: [], createdAt: date, commentsCount: records.filter(c => !c.isDeleted).length, author: { username: 'Writer', handle: 'writer' } } } })
    if (url.pathname.includes('/comments')) {
      if (method !== 'GET') {
        state.requests.push({ method, path: url.pathname, body: req.postData() ? req.postDataJSON() : null })
        if (state.hold) await state.hold
        if (state.fail === method) { state.fail = null; return route.fulfill({ status: 500, json: { message: 'Try again' } }) }
      }
      if (method === 'GET') {
        const parent = url.searchParams.get('parentCommentId')
        const list = records.filter(row => (row.parentCommentId || null) === parent)
        const page = parent ? list.slice(url.searchParams.get('cursor') ? 1 : 0, url.searchParams.get('cursor') ? list.length : 1) : list
        return route.fulfill({ json: { data: page.map(row => ({ ...row, canEdit: !guest && !row.isDeleted && Boolean(row.canEdit), canDelete: !guest && !row.isDeleted && Boolean(row.canDelete), repliesCount: records.filter(c => c.parentCommentId === row.id).length })), meta: { nextCursor: parent && list.length > 1 && !url.searchParams.get('cursor') ? 'next' : null, totalCount: records.filter(c => !c.isDeleted).length } } })
      }
      const id = url.pathname.split('/comments/')[1]?.split('/')[0]
      const row = records.find(c => c.id === id)
      if (url.pathname.endsWith('/like')) {
        row.isLiked = method === 'PUT'; row.likesCount = row.isLiked ? 1 : 0
        return route.fulfill({ json: { data: row } })
      }
      if (method === 'PATCH') row.content = req.postDataJSON().text
      if (method === 'DELETE') { row.isDeleted = true; row.content = ''; row.author = null; row.canEdit = false; row.canDelete = false }
      if (method === 'POST') {
        const body = req.postDataJSON()
        const reply = { id: `new-${records.length}`, content: body.text, parentCommentId: body.parentCommentId || null, author: { name: 'Reader' }, createdAt: date, canEdit: true, canDelete: true }
        records.unshift(reply)
        return route.fulfill({ json: { data: reply } })
      }
      return route.fulfill({ json: { data: method === 'DELETE' ? { id, deleted: true, isDeleted: true } : row } })
    }
    return route.fulfill({ json: { data: [], meta: { nextCursor: null } } })
  })
  return state
}

for (const width of [320, 1280]) {
  for (const compact of [false, true]) {
    test(`comments expand only beyond four lines at ${width}px ${compact ? 'dialog' : 'article'}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(value => localStorage.setItem('ink-theme', value), compact ? 'dark' : 'light')
      const fourLines = 'First line\nSecond line\nThird line\nFourth line'
      const fiveLines = `${fourLines}\nFifth line`
      const state = await fixture(page, { commentText: fourLines, replyText: fiveLines })
      await page.goto(compact ? '/author/writer' : `/post/${postId}`)
      if (compact) await page.getByRole('button', { name: 'Comments on Comment action testing' }).click()
      const section = page.getByRole('region', { name: /^Comments \(/ })
      const comment = section.locator('article').first()
      const content = comment.locator('[data-comment-content]').first()
      await expect(content).toHaveText(fourLines)
      await expect(comment.getByRole('button', { name: 'Read more', exact: true })).toHaveCount(0)
      await comment.getByRole('button', { name: 'Edit', exact: true }).click()
      await comment.getByLabel('Edit comment', { exact: true }).fill(fiveLines)
      await comment.getByRole('button', { name: 'Save comment' }).click()
      const more = comment.getByRole('button', { name: 'Read more', exact: true })
      await expect(more).toBeVisible()
      await expect(more).toHaveAttribute('aria-expanded', 'false')
      await expect(more).toHaveAttribute('aria-controls', await content.getAttribute('id'))
      const height = await content.evaluate(node => ({ height: node.getBoundingClientRect().height, line: parseFloat(getComputedStyle(node).lineHeight) }))
      expect(Math.abs(height.height - height.line * 4)).toBeLessThan(1)
      await more.focus()
      await page.keyboard.press('Enter')
      const less = comment.getByRole('button', { name: 'Show less', exact: true })
      await expect(less).toHaveAttribute('aria-expanded', 'true')
      await expect(less).toBeFocused()
      expect((await content.boundingBox()).height).toBeGreaterThan(height.height)
      await less.click()
      await expect(more).toHaveAttribute('aria-expanded', 'false')
      expect((await content.boundingBox()).height).toBeCloseTo(height.height, 0)
      expect(state.requests.filter(request => request.method !== 'PATCH')).toHaveLength(0)
      await comment.getByRole('button', { name: 'View replies (2)' }).click()
      const reply = comment.locator('article').first()
      await expect(reply.getByRole('button', { name: 'Read more', exact: true })).toBeVisible()
      await reply.getByRole('button', { name: 'Read more', exact: true }).click()
      await expect(reply.getByRole('button', { name: 'Show less', exact: true })).toBeVisible()
      await section.screenshot({ path: testInfo.outputPath('read-more.png') })
    })
  }
}

test('wrapped guest comments remeasure the four-line threshold on resize', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  const state = await fixture(page, { guest: true, commentText: 'Writing slowly helps us notice what we would otherwise miss. '.repeat(5) })
  await page.goto(`/post/${postId}`)
  const comment = page.getByRole('region', { name: /^Comments \(/ }).locator('article').first()
  await expect(comment.locator('[data-comment-content]')).toBeVisible()
  await expect(comment.getByRole('button', { name: 'Read more', exact: true })).toHaveCount(0)
  await page.setViewportSize({ width: 320, height: 900 })
  const more = comment.getByRole('button', { name: 'Read more', exact: true })
  await expect(more).toBeVisible()
  await more.click()
  await expect(comment.getByRole('button', { name: 'Show less', exact: true })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await comment.getByRole('button', { name: 'Show less', exact: true }).click()
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(more).toHaveCount(0)
  expect(state.requests).toEqual([])
})

for (const width of [320, 1280]) {
  for (const theme of ['light', 'dark']) {
    for (const compact of [false, true]) {
      test(`comment layout ${width}px ${theme} ${compact ? 'dialog' : 'article'}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 800 })
        await page.addInitScript(value => localStorage.setItem('ink-theme', value), theme)
        const state = await fixture(page, { longName: true })
        await page.goto(compact ? '/author/writer' : `/post/${postId}`)
        if (compact) await page.getByRole('button', { name: 'Comments on Comment action testing' }).click()
        const section = page.getByRole('region', { name: /^Comments \(/ })
        const composer = section.locator('[data-comment-composer]')
        const input = composer.getByLabel('Add a comment', { exact: true })
        const submit = composer.getByRole('button', { name: 'Comment', exact: true })
        await expect(submit).toBeDisabled()
        await input.fill('A new comment')
        await expect(submit).toBeEnabled()
        await expect(composer.getByText('13/1000', { exact: true })).toBeVisible()
        await composer.getByRole('button', { name: 'Cancel', exact: true }).click()
        await expect(input).toHaveValue('')
        await input.fill('Posted from the updated composer')
        await submit.click()
        await expect(section.getByText('Posted from the updated composer', { exact: true })).toBeVisible()
        await expect(input).toHaveValue('')
        expect(state.requests.filter(request => request.method === 'POST')).toHaveLength(1)
        const layout = await section.evaluate(element => {
          const box = element.getBoundingClientRect()
          const overflows = [...element.querySelectorAll('article, textarea, time')].some(child => {
            const rect = child.getBoundingClientRect()
            return rect.left < box.left - 1 || rect.right > box.right + 1 || child.scrollWidth > child.clientWidth + 1
          })
          return { overflows, target: element.querySelector('[data-comment-composer] button[type="submit"]').getBoundingClientRect().height }
        })
        expect(layout.overflows).toBe(false)
        expect(layout.target).toBeGreaterThanOrEqual(44)
        await section.screenshot({ path: testInfo.outputPath('layout.png') })
      })
    }
  }
}

for (const width of [320, 1280]) {
  test(`edit, like, reply and delete preserve a thread at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(theme => localStorage.setItem('ink-theme', theme), width === 320 ? 'light' : 'dark')
    const state = await fixture(page)
    await page.goto(`/post/${postId}`)
    const section = page.locator('section').filter({ has: page.getByRole('heading', { name: /^Comments \(/ }) })
    const comment = section.locator('article').first()
    await comment.getByRole('button', { name: 'Edit', exact: true }).click()
    await comment.getByLabel('Edit comment', { exact: true }).fill('Edited comment')
    state.fail = 'PATCH'
    await comment.getByRole('button', { name: 'Save comment' }).click()
    await expect(comment.getByRole('alert')).toBeVisible()
    await expect(comment.getByLabel('Edit comment')).toHaveValue('Edited comment')
    await comment.getByRole('button', { name: 'Save comment' }).click()
    await expect(comment.getByText('Edited comment', { exact: true })).toBeVisible()
    let release
    state.hold = new Promise(resolve => { release = resolve })
    const like = comment.getByRole('button', { name: 'Like (0)', exact: true })
    const likeBox = await like.boundingBox()
    await expect(comment.getByRole('button', { name: 'Like (0)', exact: true })).toHaveText('0')
    await expect(comment.getByRole('button', { name: 'Like (0)', exact: true }).locator('svg')).toHaveAttribute('fill', 'none')
    await comment.getByRole('button', { name: 'Like (0)', exact: true }).click()
    await expect(comment.getByRole('button', { name: 'Like (0)' })).toHaveAttribute('aria-busy', 'true')
    await expect(like).toBeDisabled()
    await section.screenshot({ path: testInfo.outputPath('like-pending.png') })
    expect(await like.evaluate(button => getComputedStyle(button).backgroundColor)).toBe('rgba(0, 0, 0, 0)')
    expect(await like.boundingBox()).toEqual(likeBox)
    expect(state.requests.filter(r => r.method === 'PUT')).toHaveLength(1)
    release(); state.hold = null
    await expect(comment.getByRole('button', { name: 'Unlike (1)' })).toHaveAttribute('aria-pressed', 'true')
    await expect(comment.getByRole('button', { name: 'Unlike (1)' })).toHaveText('1')
    await expect(comment.getByRole('button', { name: 'Unlike (1)' }).locator('svg')).toHaveAttribute('fill', 'currentColor')
    await comment.getByRole('button', { name: 'Unlike (1)' }).click()
    await expect(comment.getByRole('button', { name: 'Like (0)' })).toHaveAttribute('aria-pressed', 'false')
    await comment.getByRole('button', { name: 'View replies (2)' }).click()
    await expect(comment.getByText('Someone else replied')).toBeVisible()
    await expect(comment.getByRole('button', { name: 'Edit', exact: true })).toHaveCount(1)
    await comment.getByRole('button', { name: 'Load more replies' }).click()
    await expect(comment.getByText('A second reply')).toBeVisible()
    await comment.getByRole('button', { name: 'Reply', exact: true }).first().click()
    await comment.getByLabel('Reply to Reader', { exact: true }).fill('My reply')
    await comment.getByRole('button', { name: 'Post reply' }).click()
    await expect(comment.getByText('My reply', { exact: true })).toBeVisible()
    expect(state.requests.find(r => r.method === 'POST').body.parentCommentId).toBe(parentId)
    // The original comment stays first; newly created replies have their own owner controls.
    await comment.getByRole('button', { name: 'Delete', exact: true }).first().click()
    await comment.getByRole('button', { name: 'Cancel delete' }).click()
    expect(state.requests.filter(r => r.method === 'DELETE' && !r.path.endsWith('/like'))).toHaveLength(0)
    await comment.getByRole('button', { name: 'Delete', exact: true }).first().click()
    state.fail = 'DELETE'
    await comment.getByRole('button', { name: 'Delete comment', exact: true }).click()
    await expect(comment.getByRole('alert')).toBeVisible()
    await expect(comment.getByText('Edited comment', { exact: true })).toBeVisible()
    await comment.getByRole('button', { name: 'Delete comment', exact: true }).click()
    await expect(comment.getByText('Comment deleted.', { exact: true })).toBeVisible()
    await expect(comment.getByText('Someone else replied')).toBeVisible()
    await expect(section.getByRole('heading', { name: 'Comments (3)' })).toBeVisible()
    await expect(comment.getByRole('button', { name: 'Like (0)', exact: true })).toHaveCount(3)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
    while (await page.getByRole('button', { name: 'Dismiss notification' }).count()) await page.getByRole('button', { name: 'Dismiss notification' }).first().click()
    await section.screenshot({ path: testInfo.outputPath(`comments-${width}.png`) })
  })
}

for (const [width, theme] of [[320, 'dark'], [1280, 'light']]) {
  test(`compact comment likes keep stable pending targets and retry at ${width}px ${theme}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 800 })
    await page.addInitScript(value => localStorage.setItem('ink-theme', value), theme)
    const state = await fixture(page)
    await page.goto('/author/writer')
    await page.getByRole('button', { name: 'Comments on Comment action testing' }).click()
    const dialog = page.getByRole('dialog', { name: 'Comments', exact: true })
    const comment = dialog.locator('article').first()
    const like = comment.locator('[data-comment-like]')
    await like.scrollIntoViewIfNeeded()
    const before = await like.boundingBox()
    let release
    state.hold = new Promise(resolve => { release = resolve })
    await like.click()
    await expect(like).toHaveAttribute('aria-busy', 'true')
    await expect(like).toBeDisabled()
    expect(await like.evaluate(button => getComputedStyle(button).backgroundColor)).toBe('rgba(0, 0, 0, 0)')
    expect(await like.boundingBox()).toEqual(before)
    await dialog.screenshot({ path: testInfo.outputPath('like-pending.png') })
    expect(state.requests.filter(request => request.path.endsWith('/like'))).toHaveLength(1)
    release(); state.hold = null
    await expect(like).toHaveAccessibleName('Unlike (1)')
    await expect(like).toBeEnabled()
    state.fail = 'DELETE'
    await like.click()
    await expect(comment.getByRole('alert')).toBeVisible()
    await expect(like).toHaveAccessibleName('Unlike (1)')
    await expect(like).toHaveAttribute('aria-busy', 'false')
    await expect(like).toBeEnabled()
    await like.click()
    await expect(like).toHaveAccessibleName('Like (0)')
    await expect(like).toBeEnabled()
  })
}

test('guest actions request sign-in while comments and replies remain readable', async ({ page }) => {
  const state = await fixture(page, { guest: true })
  await page.goto(`/post/${postId}`)
  const comment = page.locator('section article').first()
  await expect(comment.getByRole('button', { name: 'Edit', exact: true })).toHaveCount(0)
  await expect(comment.getByRole('button', { name: 'Delete', exact: true })).toHaveCount(0)
  await comment.getByRole('button', { name: 'Like (0)' }).click()
  await expect(page.getByRole('dialog', { name: 'Sign in to Ink Rider' })).toBeVisible()
  await page.getByRole('button', { name: 'Close sign-in dialog' }).click()
  await comment.getByRole('button', { name: 'Reply', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Sign in to Ink Rider' })).toBeVisible()
  expect(state.requests).toHaveLength(0)
})

test('compact comment dialog supports keyboard editing and reply actions', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await fixture(page)
  await page.goto('/author/writer')
  await page.getByRole('button', { name: 'Comments on Comment action testing' }).click()
  const dialog = page.getByRole('dialog', { name: 'Comments', exact: true })
  const comment = dialog.locator('article').first()
  await comment.getByRole('button', { name: 'Edit', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(comment.getByLabel('Edit comment')).toBeFocused()
  await comment.getByLabel('Edit comment').fill('Edited in compact dialog')
  await comment.getByRole('button', { name: 'Save comment' }).click()
  await expect(comment.getByText('Edited in compact dialog', { exact: true })).toBeVisible()
  await comment.getByRole('button', { name: 'Reply', exact: true }).click()
  await expect(comment.getByLabel('Reply to Reader')).toBeFocused()
  await comment.getByRole('button', { name: 'Cancel', exact: true }).click()
  await dialog.getByRole('button', { name: 'Close comments' }).click()
  await expect(page.getByRole('button', { name: 'Comments on Comment action testing' })).toBeFocused()
})
