class AuditService {
  constructor({ sink = console, now = () => new Date().toISOString() } = {}) {
    this.sink = sink;
    this.now = now;
  }

  record(event) {
    const payload = {
      timestamp: this.now(),
      ...event,
    };

    if (typeof this.sink.info === 'function') {
      this.sink.info({ audit: payload });
    }

    return payload;
  }

  authEvent(action, context = {}) {
    return this.record({
      category: 'auth',
      action,
      ...context,
    });
  }

  privilegeEvent(action, context = {}) {
    return this.record({
      category: 'privilege',
      action,
      ...context,
    });
  }
}

function withPrivilegeAudit(auditService, action, handler) {
  return async function auditedHandler(req, res, next) {
    try {
      auditService.privilegeEvent(action, {
        actorId: req.user?.id,
        actorRole: req.user?.role,
        resourceId: req.params?.id,
        method: req.method,
        path: req.path,
      });
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  AuditService,
  withPrivilegeAudit,
};
