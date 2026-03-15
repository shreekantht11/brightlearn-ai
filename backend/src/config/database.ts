import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from './env';

const resolveCaPath = () => {
  if (!env.DB_SSL_CA_PATH) {
    throw new Error('DB_SSL is enabled, but DB_SSL_CA_PATH is missing.');
  }

  const absolutePath = path.isAbsolute(env.DB_SSL_CA_PATH)
    ? env.DB_SSL_CA_PATH
    : path.resolve(process.cwd(), env.DB_SSL_CA_PATH);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Database CA certificate not found at: ${absolutePath}`);
  }

  return fs.readFileSync(absolutePath, 'utf8');
};

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: env.DB_SSL ? { ca: resolveCaPath() } : undefined,
});

export default pool;
