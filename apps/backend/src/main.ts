import { buildApp } from './app.js';
import { env } from './config/env.js';

const app = buildApp();

app.listen(env.PORT, () => {
  console.log(`Backend listening on http://localhost:${env.PORT}`);
});
