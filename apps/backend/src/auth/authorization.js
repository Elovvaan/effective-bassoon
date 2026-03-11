const Roles = Object.freeze({
  DISTRICT_ADMIN: 'district_admin',
  SCHOOL_ADMIN: 'school_admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
});

function hasRequiredRole(user, allowedRoles) {
  return Boolean(user?.role && allowedRoles.includes(user.role));
}

function authorizeResourceAccess(user, resource) {
  if (!user) {
    return false;
  }

  switch (user.role) {
    case Roles.DISTRICT_ADMIN:
      return !resource.districtId || resource.districtId === user.districtId;

    case Roles.SCHOOL_ADMIN:
      if (resource.districtId && resource.districtId !== user.districtId) {
        return false;
      }
      return !resource.schoolId || resource.schoolId === user.schoolId;

    case Roles.TEACHER:
      if (resource.teacherId && resource.teacherId !== user.id) {
        return false;
      }
      if (resource.schoolId && resource.schoolId !== user.schoolId) {
        return false;
      }
      return !resource.districtId || resource.districtId === user.districtId;

    case Roles.STUDENT:
      if (resource.studentId && resource.studentId !== user.id) {
        return false;
      }
      if (resource.schoolId && resource.schoolId !== user.schoolId) {
        return false;
      }
      return !resource.districtId || resource.districtId === user.districtId;

    case Roles.PARENT:
      if (resource.schoolId && resource.schoolId !== user.schoolId) {
        return false;
      }
      if (resource.districtId && resource.districtId !== user.districtId) {
        return false;
      }
      return (
        !resource.studentId ||
        (Array.isArray(user.childrenStudentIds) && user.childrenStudentIds.includes(resource.studentId))
      );

    default:
      return false;
  }
}

function requireRoles(allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!hasRequiredRole(req.user, allowedRoles)) {
      res.status(403).json({ error: 'Insufficient role privileges' });
      return;
    }
    next();
  };
}

function requireResourceAccess(resourceSelector) {
  return function resourceGuard(req, res, next) {
    const resource = resourceSelector(req);
    if (!authorizeResourceAccess(req.user, resource)) {
      res.status(403).json({ error: 'Forbidden for requested resource' });
      return;
    }
    next();
  };
}

module.exports = {
  Roles,
  hasRequiredRole,
  authorizeResourceAccess,
  requireRoles,
  requireResourceAccess,
};
