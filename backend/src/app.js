import express from 'express';
import { errorHandler } from './middlewares/error.middleware.js';
import { Middleware } from './app.middleware.js';
import { AllRoutes } from './app.routes.js';
import path from 'path';
const app = express();

Middleware(app);
app.use('/api/v1', AllRoutes);
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.resolve('public', 'dist', 'index.html'));
});

app.use(errorHandler);

export { app };
