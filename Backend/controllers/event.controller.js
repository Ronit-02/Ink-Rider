const mongoose = require('mongoose');
const InteractionEvent = require('../schemas/interaction-event.schema');
const Post = require('../schemas/post.schema');
const { presentDiscoveryPosts } = require('../services/post-presenter.service');
const { getPostAccessContext, accessiblePostClause } = require('../services/post-access.service');

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const postEventTypes = new Set(['impression', 'open', 'reading_depth', 'complete', 'save', 'hide', 'report']);

const recordEvents = async (req, res) => {
  const events = req.body?.events;
  const anonymousSessionId = String(req.body?.anonymousSessionId || '').trim();
  if (!Array.isArray(events) || events.length < 1 || events.length > 50) {
    return res.status(400).json({ message: 'Events must contain between 1 and 50 items' });
  }
  if (!req.auth && !uuidPattern.test(anonymousSessionId)) {
    return res.status(400).json({ message: 'A valid anonymous session id is required' });
  }

  const now = Date.now();
  const normalized = [];
  for (const event of events) {
    const eventAt = new Date(event?.eventAt);
    if (!uuidPattern.test(String(event?.eventId || ''))
      || !InteractionEvent.eventTypes.includes(event?.eventType)
      || !InteractionEvent.surfaces.includes(event?.surface)
      || Number.isNaN(eventAt.getTime())
      || Math.abs(now - eventAt.getTime()) > 24 * 60 * 60 * 1000
      || (event.postId && !mongoose.isValidObjectId(event.postId))
      || (event.writerId && !mongoose.isValidObjectId(event.writerId))
      || (postEventTypes.has(event.eventType) && !event.postId)
      || (event.eventType === 'follow' && !event.writerId)
      || (event.position != null && (!Number.isInteger(event.position) || event.position < 0 || event.position > 1000))
      || (event.recommendationRequestId && String(event.recommendationRequestId).length > 64)
      || (event.metadata?.readingDepth != null && (!Number.isFinite(event.metadata.readingDepth) || event.metadata.readingDepth < 0 || event.metadata.readingDepth > 100))) {
      return res.status(400).json({ message: 'One or more events are invalid' });
    }
    normalized.push({
      eventId: event.eventId,
      actorId: req.auth?.userId || null,
      anonymousSessionId: req.auth ? null : anonymousSessionId,
      eventType: event.eventType,
      postId: event.postId || null,
      writerId: event.writerId || null,
      surface: event.surface,
      position: event.position ?? null,
      recommendationRequestId: event.recommendationRequestId || null,
      eventAt,
      metadata: { readingDepth: event.metadata?.readingDepth ?? null },
    });
  }

  try {
    const postIds = [...new Set(normalized.map(event => event.postId).filter(Boolean).map(String))];
    if (postIds.length) {
      const context = await getPostAccessContext(req.auth?.userId);
      const accessible = await Post.find({ _id: { $in: postIds }, ...accessiblePostClause(context) }).select('_id');
      if (accessible.length !== postIds.length) return res.status(400).json({ message: 'One or more events reference an unavailable post' });
    }
    const result = await InteractionEvent.insertMany(normalized, { ordered: false });
    return res.status(202).json({ data: { accepted: result.length } });
  } catch (error) {
    if (error?.code === 11000 || error?.writeErrors?.every(item => item.code === 11000)) {
      const duplicates = error.writeErrors?.length || 1;
      return res.status(202).json({ data: { accepted: normalized.length - duplicates } });
    }
    console.error(`[${req.requestId}] Interaction event intake failed`);
    return res.status(500).json({ message: 'Unable to record events' });
  }
};

const getReadingHistory = async (req, res) => {
  try {
    const events = await InteractionEvent.find({
      actorId: req.auth.userId,
      postId: { $ne: null },
      eventType: { $in: ['open', 'reading_depth', 'complete'] },
    }).sort({ eventAt: -1 }).limit(1000).select('postId eventType eventAt metadata.readingDepth');
    const stateByPost = new Map();
    for (const event of events) {
      const id = event.postId.toString();
      const state = stateByPost.get(id) || { postId: id, lastReadAt: event.eventAt, progress: 0, completed: false };
      state.completed ||= event.eventType === 'complete';
      state.progress = Math.max(state.progress, event.eventType === 'complete' ? 100 : (event.metadata?.readingDepth || 0));
      stateByPost.set(id, state);
    }
    const states = [...stateByPost.values()].slice(0, 50);
    const context = await getPostAccessContext(req.auth.userId);
    const documents = await Post.find({ _id: { $in: states.map(state => state.postId) }, ...accessiblePostClause(context) })
      .populate({ path: 'author', select: 'picture username' });
    const posts = await presentDiscoveryPosts(documents);
    const postById = new Map(posts.map(post => [post.id.toString(), post]));
    const history = states.map(state => ({ ...postById.get(state.postId), ...state })).filter(item => item.id);
    return res.status(200).json({
      data: {
        continueReading: history.filter(item => !item.completed && item.progress > 0).slice(0, 6),
        history,
      },
    });
  } catch (error) {
    console.error(`[${req.requestId}] Reading history failed`);
    return res.status(500).json({ message: 'Unable to load reading history' });
  }
};

module.exports = { recordEvents, getReadingHistory };
