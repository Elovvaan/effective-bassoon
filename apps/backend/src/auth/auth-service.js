const crypto = require('node:crypto');
const { signJwt, verifyJwt } = require('./jwt');

class InMemoryRefreshTokenStore {
  constructor() {
    this.tokensByHash = new Map();
  }

  save(record) {
    this.tokensByHash.set(record.tokenHash, record);
  }

  get(tokenHash) {
    return this.tokensByHash.get(tokenHash);
  }

  revoke(tokenHash, metadata = {}) {
    const token = this.tokensByHash.get(tokenHash);
    if (!token) {
      return;
    }

    this.tokensByHash.set(tokenHash, {
      ...token,
      revokedAt: metadata.revokedAt ?? new Date().toISOString(),
      revokeReason: metadata.reason,
    });
  }
}

class AuthService {
  constructor({
    jwtSecret,
    accessTokenTtlSeconds = 900,
    refreshTokenTtlSeconds = 60 * 60 * 24 * 14,
    refreshTokenStore = new InMemoryRefreshTokenStore(),
    auditService,
    now = () => new Date(),
    validateCredentials,
    findUserById,
  }) {
    this.jwtSecret = jwtSecret;
    this.accessTokenTtlSeconds = accessTokenTtlSeconds;
    this.refreshTokenTtlSeconds = refreshTokenTtlSeconds;
    this.refreshTokenStore = refreshTokenStore;
    this.auditService = auditService;
    this.now = now;
    this.validateCredentials = validateCredentials;
    this.findUserById = findUserById;
  }

  hashRefreshToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  createRefreshToken(userId) {
    return `${userId}.${crypto.randomBytes(48).toString('hex')}`;
  }

  issueAccessToken(user) {
    return signJwt(
      {
        sub: user.id,
        role: user.role,
        districtId: user.districtId,
        schoolId: user.schoolId,
      },
      this.jwtSecret,
      { expiresInSeconds: this.accessTokenTtlSeconds }
    );
  }

  issueRefreshToken(userId, previousTokenHash = null) {
    const token = this.createRefreshToken(userId);
    const tokenHash = this.hashRefreshToken(token);
    const now = this.now();
    const expiresAt = new Date(now.getTime() + this.refreshTokenTtlSeconds * 1000).toISOString();
    this.refreshTokenStore.save({
      tokenHash,
      userId,
      expiresAt,
      createdAt: now.toISOString(),
      previousTokenHash,
      revokedAt: null,
    });

    return token;
  }

  async login(email, password, context = {}) {
    const user = await this.validateCredentials(email, password);

    if (!user) {
      this.auditService?.authEvent('login_failed', {
        email,
        ip: context.ip,
        userAgent: context.userAgent,
      });
      return null;
    }

    const accessToken = this.issueAccessToken(user);
    const refreshToken = this.issueRefreshToken(user.id);

    this.auditService?.authEvent('login_succeeded', {
      userId: user.id,
      role: user.role,
      ip: context.ip,
      userAgent: context.userAgent,
    });

    return { accessToken, refreshToken, user };
  }

  async refresh(refreshToken, context = {}) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const record = this.refreshTokenStore.get(tokenHash);
    if (!record) {
      this.auditService?.authEvent('refresh_failed', { reason: 'unknown_token', ...context });
      return null;
    }

    if (record.revokedAt) {
      this.auditService?.authEvent('refresh_failed', {
        userId: record.userId,
        reason: 'revoked_token_reuse',
        ...context,
      });
      return null;
    }

    if (new Date(record.expiresAt) < this.now()) {
      this.auditService?.authEvent('refresh_failed', {
        userId: record.userId,
        reason: 'expired_token',
        ...context,
      });
      return null;
    }

    this.refreshTokenStore.revoke(tokenHash, { reason: 'rotated' });
    const user = await this.findUserById(record.userId);
    if (!user) {
      this.auditService?.authEvent('refresh_failed', {
        userId: record.userId,
        reason: 'missing_user',
        ...context,
      });
      return null;
    }

    const newRefreshToken = this.issueRefreshToken(user.id, tokenHash);
    const accessToken = this.issueAccessToken(user);

    this.auditService?.authEvent('refresh_succeeded', {
      userId: user.id,
      role: user.role,
      ...context,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user,
    };
  }

  async logout(refreshToken, context = {}) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const record = this.refreshTokenStore.get(tokenHash);

    if (!record) {
      this.auditService?.authEvent('logout', {
        reason: 'unknown_refresh_token',
        ...context,
      });
      return;
    }

    this.refreshTokenStore.revoke(tokenHash, { reason: 'logout' });
    this.auditService?.authEvent('logout', {
      userId: record.userId,
      ...context,
    });
  }

  authenticateAccessToken(token) {
    const claims = verifyJwt(token, this.jwtSecret);
    return {
      id: claims.sub,
      role: claims.role,
      districtId: claims.districtId,
      schoolId: claims.schoolId,
    };
  }
}

module.exports = {
  AuthService,
  InMemoryRefreshTokenStore,
};
