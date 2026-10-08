import express from 'express';
import authRouter from './modules/user/user.route.js';
import healthRoute from './modules/health/health.route.js';
import categoryRouter from './modules/category/category.route.js';
import productRouter from './modules/product/product.route.js';

const AllRoutes = express.Router();

AllRoutes.use('/health', healthRoute);
AllRoutes.use('/auth', authRouter);
AllRoutes.use('/categories', categoryRouter);
AllRoutes.use('/products', productRouter);

export { AllRoutes };
