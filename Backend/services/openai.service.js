const config = require('../config/config');
const { hasConfiguredValue } = require('./provider-readiness.service');

const extractOutputText = response => (response.output || [])
  .filter(item => item.type === 'message')
  .flatMap(item => item.content || [])
  .filter(item => item.type === 'output_text' && typeof item.text === 'string')
  .map(item => item.text)
  .join('\n')
  .trim();

const generateWritingSuggestion = async ({ action, text }) => {
  if (!hasConfiguredValue(config.OPENAI_API_KEY)) throw Object.assign(new Error('OpenAI is not configured'), { code: 'PROVIDER_NOT_CONFIGURED' });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.PROVIDER_TIMEOUT_MS);
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: controller.signal,
      headers: { authorization: `Bearer ${config.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: config.OPENAI_MODEL,
        store: false,
        max_output_tokens: 800,
        instructions: 'You are an editorial assistant. Preserve the writer’s meaning and voice. Do not invent facts, citations, quotes, or lived experiences. Return only the requested writing suggestion, without commentary about your process.',
        input: `Task: ${action}\n\nWriter text:\n${text}`,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw Object.assign(new Error(data?.error?.message || 'OpenAI request failed'), { code: 'PROVIDER_ERROR' });
    const suggestion = extractOutputText(data);
    if (!suggestion) throw Object.assign(new Error('OpenAI returned no text'), { code: 'EMPTY_PROVIDER_RESPONSE' });
    return { suggestion, model: config.OPENAI_MODEL, providerResponseId: data.id || null };
  } finally { clearTimeout(timeout); }
};

module.exports = { extractOutputText, generateWritingSuggestion };
