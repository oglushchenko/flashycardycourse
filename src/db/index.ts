import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(client);

let isConnected = false;

export async function connectDb() {
  if (isConnected) return;
  await client.connect();
  isConnected = true;
}

