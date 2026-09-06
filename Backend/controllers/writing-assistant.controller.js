const AiUsage = require('../schemas/ai-usage.schema');
const { hasCapability } = require('../services/entitlement.service');
const { generateWritingSuggestion } = require('../services/openai.service');
const config = require('../config/config');

const actions = ['improve_clarity', 'tighten', 'create_outline', 'suggest_titles', 'find_gaps'];

const reserveDailyRequest = async (userId, day) => {
  let usage = await AiUsage.findOneAndUpdate(
    { userId, day, requests: { $lt: 50 } },
    { $inc: { requests: 1 } },
    { returnDocument: 'after' }
  );
  if (usage) return usage;
  try {
    return await AiUsage.create({ userId, day, requests: 1 });
  } catch (error) {
    if (error?.code !== 11000) throw error;
    usage = await AiUsage.findOneAndUpdate(
      { userId, day, requests: { $lt: 50 } },
      { $inc: { requests: 1 } },
      { returnDocument: 'after' }
    );
    return usage;
  }
};

const assistWriting = async (req, res) => {
  try {
    if (!await hasCapability(req.auth.userId, 'ai_writing_assistant')) return res.status(403).json({ code: 'ENTITLEMENT_REQUIRED', message: 'The writing assistant requires an active membership' });
    const action = String(req.body.action || 'improve_clarity');
    const text = String(req.body.text || '').trim();
    if (!actions.includes(action) || text.length < 20 || text.length > 12000) return res.status(400).json({ message: 'Choose a valid task and provide between 20 and 12,000 characters' });
    if (!config.OPENAI_API_KEY) return res.status(503).json({ code: 'PROVIDER_NOT_CONFIGURED', message: 'The writing assistant is not configured yet' });
    const day = new Date().toISOString().slice(0, 10);
    const usage = await reserveDailyRequest(req.auth.userId, day);
    if (!usage) return res.status(429).json({ message: 'Daily writing assistant limit reached' });
    try {
      const result = await generateWritingSuggestion({ action, text });
      return res.json({ data: { suggestion: result.suggestion, model: result.model, disclosure: 'Generated with AI from the text you submitted. Review facts and voice before using it.' }, meta: { remainingToday: Math.max(0, 50 - usage.requests) } });
    } catch (error) {
      await AiUsage.updateOne({ _id: usage._id, requests: { $gt: 0 } }, { $inc: { requests: -1 } }).catch(() => {});
      throw error;
    }
  } catch (error) {
    if (error?.code === 'PROVIDER_NOT_CONFIGURED') return res.status(503).json({ code: error.code, message: 'The writing assistant is not configured yet' });
    return res.status(502).json({ message: 'The writing assistant is temporarily unavailable' });
  }
};

module.exports = { assistWriting, actions, reserveDailyRequest };
