import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import {config} from '../config';
import {ITEMS,auditCatalog} from '../config/GameCatalog';
fs.mkdirSync(path.dirname(config.dbPath),{recursive:true});
const db=new Database(config.dbPath);db.pragma('foreign_keys = ON');db.pragma('busy_timeout = 5000');try{db.pragma('journal_mode = WAL')}catch{db.pragma('journal_mode = DELETE')}
function addColumn(table:string,name:string,definition:string){const cols=(db.prepare(`PRAGMA table_info(${table})`).all() as any[]).map(x=>x.name);if(!cols.includes(name))db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`)}
export function initDatabase(){
 const errs=auditCatalog();if(errs.length)throw new Error('Catalog audit failed:\n'+errs.join('\n'));
 db.exec(`
 CREATE TABLE IF NOT EXISTS users(discord_id TEXT PRIMARY KEY,name TEXT NOT NULL,title TEXT DEFAULT 'Tán Tu',avatar_url TEXT DEFAULT '',thumbnail_url TEXT DEFAULT '',level INTEGER DEFAULT 1,tu_vi INTEGER DEFAULT 0,exp_needed INTEGER DEFAULT 125,hp INTEGER DEFAULT 100,max_hp INTEGER DEFAULT 100,mp INTEGER DEFAULT 50,max_mp INTEGER DEFAULT 50,atk INTEGER DEFAULT 15,def INTEGER DEFAULT 10,speed INTEGER DEFAULT 100,dodge REAL DEFAULT .05,stamina INTEGER DEFAULT 500,coin_ha_pham INTEGER DEFAULT 100,knb INTEGER DEFAULT 0,pvp_rating INTEGER DEFAULT 1000,pvp_wins INTEGER DEFAULT 0,pvp_losses INTEGER DEFAULT 0,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS items(id TEXT PRIMARY KEY,name TEXT NOT NULL,emoji TEXT,type TEXT NOT NULL,rarity TEXT NOT NULL,description TEXT,value_ha_pham INTEGER DEFAULT 0,tradable INTEGER DEFAULT 1);
 CREATE TABLE IF NOT EXISTS inventories(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,item_id TEXT NOT NULL REFERENCES items(id),quantity INTEGER NOT NULL DEFAULT 1,is_equipped INTEGER DEFAULT 0,UNIQUE(user_id,item_id));
 CREATE TABLE IF NOT EXISTS active_effects(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,source_item TEXT NOT NULL,effect_json TEXT NOT NULL,expires_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS duty_progress(user_id TEXT NOT NULL,day TEXT NOT NULL,work_count INTEGER DEFAULT 0,fish_count INTEGER DEFAULT 0,craft_count INTEGER DEFAULT 0,combat_count INTEGER DEFAULT 0,claimed INTEGER DEFAULT 0,PRIMARY KEY(user_id,day));
 CREATE TABLE IF NOT EXISTS discoveries(user_id TEXT NOT NULL,item_id TEXT NOT NULL,discovered_at INTEGER NOT NULL,PRIMARY KEY(user_id,item_id));
 CREATE TABLE IF NOT EXISTS market_listings(id INTEGER PRIMARY KEY AUTOINCREMENT,seller_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,item_id TEXT NOT NULL REFERENCES items(id),quantity INTEGER NOT NULL,price INTEGER NOT NULL,status TEXT DEFAULT 'active',created_at INTEGER NOT NULL,expires_at INTEGER NOT NULL,buyer_id TEXT);
 CREATE INDEX IF NOT EXISTS idx_market_active ON market_listings(status,expires_at);
 CREATE TABLE IF NOT EXISTS boss_instances(boss_id TEXT PRIMARY KEY,hp INTEGER NOT NULL,max_hp INTEGER NOT NULL,spawned_at INTEGER NOT NULL,respawn_at INTEGER DEFAULT 0);
 CREATE TABLE IF NOT EXISTS boss_damage(boss_id TEXT NOT NULL,user_id TEXT NOT NULL,damage INTEGER DEFAULT 0,PRIMARY KEY(boss_id,user_id));
 CREATE TABLE IF NOT EXISTS secret_realm_log(user_id TEXT NOT NULL,realm_id TEXT NOT NULL,last_entered INTEGER NOT NULL,clears INTEGER DEFAULT 0,PRIMARY KEY(user_id,realm_id));
 `);
 addColumn('users','avatar_url',"TEXT DEFAULT ''");addColumn('users','thumbnail_url',"TEXT DEFAULT ''");addColumn('users','pvp_rating','INTEGER DEFAULT 1000');addColumn('users','pvp_wins','INTEGER DEFAULT 0');addColumn('users','pvp_losses','INTEGER DEFAULT 0');
 const q=db.prepare(`INSERT INTO items(id,name,emoji,type,rarity,description,value_ha_pham,tradable) VALUES(@id,@name,@emoji,@type,@rarity,@description,@value,@tradable) ON CONFLICT(id) DO UPDATE SET name=excluded.name,emoji=excluded.emoji,type=excluded.type,rarity=excluded.rarity,description=excluded.description,value_ha_pham=excluded.value_ha_pham,tradable=excluded.tradable`);
 db.transaction(()=>Object.values(ITEMS).forEach(i=>q.run({...i,tradable:i.tradable?1:0})))();
 console.log(`✅ Catalog audit: ${Object.keys(ITEMS).length} vật phẩm · 0 lỗi nguồn`);
}
export default db;
