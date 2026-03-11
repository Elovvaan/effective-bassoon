const express = require('express');

function buildAuthRouter({ authService }) {
  const router = express.Router();

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    if (!result) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    res.status(200).json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  });

  router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    if (!result) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    res.status(200).json(result);
  });

  router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(204).send();
  });

  return router;
}

module.exports = {
  buildAuthRouter,
};
