import * as path from 'path';

import { config } from 'dotenv';

config();

export const type = 'mysql';
export const host = process.env.DB_HOST || '127.0.0.1';
export const port = Number(process.env.DB_PORT) || 3306;
export const username = process.env.DB_USERNAME || 'root';
export const password = process.env.DB_PASSWORD || 'root';
export const database = process.env.DB_NAME || 'apiperionica';
export const synchronize = process.env.NODE_ENV !== 'production';
export const logging = process.env.NODE_ENV !== 'production';

export const entities = [path.join(__dirname, '**', '*.entity{.ts,.js}')];
export const migrations = [path.join(__dirname, 'database', 'migrations', '*.ts')];

export const cli = {
  migrationsDir: 'src/database/migrations',
};
