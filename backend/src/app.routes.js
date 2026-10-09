import express from 'express';
import authRouter from './modules/user/user.route.js';
import healthRoute from './modules/health/health.route.js';
import categoryRouter from './modules/category/category.route.js';
import productRouter from './modules/product/product.route.js';
import productVariantRouter from './modules/productVariant/productVariant.route.js';
import productStockRouter from './modules/productStock/productStock.route.js';
import cartRouter from './modules/cart/cart.route.js';

const AllRoutes = express.Router();

AllRoutes.use('/health', healthRoute);
AllRoutes.use('/auth', authRouter);
AllRoutes.use('/categories', categoryRouter);
AllRoutes.use('/products', productRouter);
AllRoutes.use('/products', productVariantRouter);
AllRoutes.use('/products', productStockRouter);
AllRoutes.use('/cart', cartRouter);

export { AllRoutes };
