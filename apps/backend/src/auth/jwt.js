const crypto = require('node:crypto');

function toBase64Url(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + '='.repeat(padLength), 'base64').toString('utf8');
}

function signJwt(payload, secret, options = {}) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const claims = {
    iat: now,
    exp: now + (options.expiresInSeconds ?? 900),
    jti: options.jti ?? crypto.randomUUID(),
    ...payload,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(claims));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(unsignedToken)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${unsignedToken}.${signature}`;
}

function verifyJwt(token, secret) {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token');
  }

  const [encodedHeader, encodedPayload, receivedSignature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !receivedSignature) {
    throw new Error('Malformed token');
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(unsignedToken)
    .digest();

  const normalized = receivedSignature.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const signatureBuffer = Buffer.from(normalized + '='.repeat(padLength), 'base64');

  if (
    signatureBuffer.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSignature)
  ) {
    throw new Error('Invalid signature');
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload));
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp < now) {
    throw new Error('Token expired');
  }

  return payload;
}

module.exports = {
  signJwt,
  verifyJwt,
};
