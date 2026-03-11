function createAuthenticateMiddleware(authService) {
  return function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing bearer token' });
      return;
    }

    const token = header.slice('Bearer '.length);
    try {
      req.user = authService.authenticateAccessToken(token);
      next();
    } catch (_error) {
      res.status(401).json({ error: 'Invalid access token' });
    }
  };
}

module.exports = {
  createAuthenticateMiddleware,
};
