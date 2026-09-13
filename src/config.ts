import 'dotenv/config';
export const config = {
  token: process.env.DISCORD_TOKEN || '',
  dbPath: process.env.DB_PATH || './data/tutien.db'
};
