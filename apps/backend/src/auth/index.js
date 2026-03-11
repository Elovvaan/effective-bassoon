const { AuthService, InMemoryRefreshTokenStore } = require('./auth-service');
const { buildAuthRouter } = require('./routes');
const { createAuthenticateMiddleware } = require('./middleware');
const {
  Roles,
  hasRequiredRole,
  authorizeResourceAccess,
  requireRoles,
  requireResourceAccess,
} = require('./authorization');
const { AuditService, withPrivilegeAudit } = require('./audit');

module.exports = {
  AuthService,
  InMemoryRefreshTokenStore,
  buildAuthRouter,
  createAuthenticateMiddleware,
  Roles,
  hasRequiredRole,
  authorizeResourceAccess,
  requireRoles,
  requireResourceAccess,
  AuditService,
  withPrivilegeAudit,
};
