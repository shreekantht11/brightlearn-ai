import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT || 3306),
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'brightlearn_lms',
  DB_SSL: process.env.DB_SSL === 'true',
  DB_SSL_CA_PATH: process.env.DB_SSL_CA_PATH || '',
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
  HF_API_KEY: process.env.HF_API_KEY || '',
  HF_MODEL: process.env.HF_MODEL || 'deepseek-ai/DeepSeek-R1:fastest',
};
