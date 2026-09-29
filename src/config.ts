import 'dotenv/config';
import path from 'path';
export const config = {
  token: process.env.DISCORD_TOKEN || '',
  dbPath: process.env.DB_PATH || './data/tutien.db',
  port: Number(process.env.PORT||3000),
  snapshotDir: process.env.SNAPSHOT_DIR||path.join(path.dirname(process.env.DB_PATH||'./data/tutien.db'),'snapshots'),
  snapshotRetention: Math.max(1,Number(process.env.SNAPSHOT_RETENTION||7))
};
