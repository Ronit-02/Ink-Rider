export const suggestedSearchTopics = ['Travel', 'AI', 'Science', 'Entrepreneurship', 'Lifestyle', 'Career']

export function getTrendingSearches(posts: { title: string }[] = []) {
  return [...new Set(posts.map(post => post.title))].slice(0, 4)
}
