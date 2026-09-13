import db from '../database';
export interface UserEntity{discord_id:string;name:string;title:string;avatar_url:string;thumbnail_url:string;level:number;tu_vi:number;exp_needed:number;hp:number;max_hp:number;mp:number;max_mp:number;atk:number;def:number;speed:number;dodge:number;stamina:number;coin_ha_pham:number;knb:number;pvp_rating:number;pvp_wins:number;pvp_losses:number;created_at:number;updated_at:number}
class UserRepository{
 get(id:string){return (db.prepare('SELECT * FROM users WHERE discord_id=?').get(id) as UserEntity)||null}
 create(id:string,name:string,avatarUrl='',thumbnailUrl=''){const n=Math.floor(Date.now()/1000);db.prepare('INSERT INTO users(discord_id,name,avatar_url,thumbnail_url,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(id,name,avatarUrl,thumbnailUrl,n,n);return this.get(id)!}
 update(id:string,data:Partial<UserEntity>){const entries=Object.entries(data);if(!entries.length)return;const keys=entries.map(([k])=>`${k}=?`).join(',');const vals=entries.map(([,v])=>v);db.prepare(`UPDATE users SET ${keys},updated_at=? WHERE discord_id=?`).run(...vals,Math.floor(Date.now()/1000),id)}
}
export const userRepository=new UserRepository();
