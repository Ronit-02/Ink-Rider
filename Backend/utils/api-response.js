const statusCodeNames = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'RATE_LIMITED',
};

const success = (res, data, meta, status = 200) => {
  const payload = { data };
  if (meta !== undefined) payload.meta = meta;
  return res.status(status).json(payload);
};

const failure = (res, status, message, code = statusCodeNames[status] || 'REQUEST_FAILED', fields) => {
  const error = { code, message, requestId: res.req?.requestId };
  if (fields !== undefined) error.fields = fields;
  return res.status(status).json({ error });
};

const noContent = res => res.status(204).send();

module.exports = { success, failure, noContent };
