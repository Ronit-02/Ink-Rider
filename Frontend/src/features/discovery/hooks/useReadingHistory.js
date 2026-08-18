import { useQuery } from '@tanstack/react-query'
import { fetchReadingHistory } from '../api/readingHistory'

export default function useReadingHistory() {
  return useQuery({ queryKey: ['reading-history'], queryFn: fetchReadingHistory })
}
