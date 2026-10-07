import express from 'express';
import authRouter from './modules/user/user.route.js';
import healthRoute from './modules/health/health.route.js';


const AllRoutes = express.Router();

AllRoutes.use('/health', healthRoute);
AllRoutes.use('/auth', authRouter);


export { AllRoutes };
