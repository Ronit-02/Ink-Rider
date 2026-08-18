import api from '@/app/api'

const SESSION_KEY = 'ink-rider-discovery-session'

function createId() {
  return crypto.randomUUID()
}

function getAnonymousSessionId() {
  let sessionId = sessionStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = createId()
    sessionStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

export function createInteractionEvent(event) {
  return { eventId: createId(), eventAt: new Date().toISOString(), ...event }
}

export async function recordInteractionEvents(events) {
  if (!events.length) return
  await api.post('/api/v1/events', { anonymousSessionId: getAnonymousSessionId(), events })
}
