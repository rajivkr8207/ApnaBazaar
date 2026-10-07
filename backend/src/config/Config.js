import dotenv from 'dotenv';
dotenv.config();

const Config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  mongodb_uri: process.env.MONGODB_URI,
  Node_ENV: process.env.NODE_ENV,
  // JWT
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,

  // Redis (optional)
  redis_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,
  redis_password: process.env.REDIS_PASSWORD,

  // SMTP (optional)
  smtp_host: process.env.SMTP_HOST,
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,

  // ImageKit
  imagekit_public_key: process.env.IMAGE_KIT_PUBLIC_KEY,
  imagekit_private_key: process.env.IMAGE_KIT_PRIVATE_KEY,
  imagekit_url_endpoint: process.env.IMAGE_KIT_URL_ENDPOINT,

  // Frontend
  frontend_url: process.env.FRONTEND_URL,
};

export default Config;
