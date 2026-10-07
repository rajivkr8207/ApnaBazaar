import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import Config from './config/Config.js';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

const corsOption = {
  origin: Config.frontend_url,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again in 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

export const Middleware = (app) => {
  app.use(express.json({ limit: '16kb' }));
  app.use(express.urlencoded({ extended: true, limit: '16kb' }));
  app.use(cookieParser());
  app.use(cors(corsOption));
  app.use(morgan(Config.env === 'production' ? 'combined' : 'dev'));
  app.use(helmet());
  app.use(compression());
  app.use(express.static('public/dist'));
  app.use(hpp());
  app.use('/api', limiter);
};
