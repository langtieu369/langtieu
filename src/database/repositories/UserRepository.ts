import db from '../database';
export interface UserEntity{
 discord_id:string;name:string;title:string;avatar_url:string;thumbnail_url:string;level:number;tu_vi:number;exp_needed:number;hp:number;max_hp:number;mp:number;max_mp:number;atk:number;def:number;speed:number;dodge:number;stamina:number;coin_ha_pham:number;knb:number;pvp_rating:number;pvp_wins:number;pvp_losses:number;competitive_locked:number;created_at:number;updated_at:number;
 background_id:string;destiny_id:string;linh_can_json:string;linh_can_main:string;linh_can_grade:string;heirloom_id:string;heirloom_name:string;prophecy:string;innate_skill:string;
 current_location:string;
}
export interface CreationData{backgroundId?:string;destinyId?:string;linhCanJson?:string;linhCanMain?:string;linhCanGrade?:string;heirloomId?:string;heirloomName?:string;prophecy?:string;innateSkill?:string;hpBonus?:number;atkBonus?:number;defBonus?:number;mpBonus?:number;speedBonus?:number;ltBonus?:number;knbBonus?:number}
class UserRepository{
 get(id:string){return (db.prepare('SELECT * FROM users WHERE discord_id=?').get(id) as UserEntity)||null}
 create(id:string,name:string,avatarUrl='',thumbnailUrl='',c:CreationData={}){const n=Math.floor(Date.now()/1000);db.transaction(()=>{db.prepare(`INSERT INTO users(discord_id,name,avatar_url,thumbnail_url,background_id,destiny_id,linh_can_json,linh_can_main,linh_can_grade,heirloom_id,heirloom_name,prophecy,innate_skill,max_hp,hp,atk,def,max_mp,mp,speed,coin_ha_pham,knb,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id,name,avatarUrl,thumbnailUrl,c.backgroundId||'',c.destinyId||'',c.linhCanJson||'{}',c.linhCanMain||'',c.linhCanGrade||'',c.heirloomId||'',c.heirloomName||'',c.prophecy||'',c.innateSkill||'',100+(c.hpBonus||0),100+(c.hpBonus||0),15+(c.atkBonus||0),10+(c.defBonus||0),50+(c.mpBonus||0),50+(c.mpBonus||0),100+(c.speedBonus||0),100+(c.ltBonus||0),c.knbBonus||0,n,n);db.prepare('INSERT INTO onboarding_milestones(user_id,milestone,completed_at) VALUES(?,?,?)').run(id,'SO_NHAP_COMPLETED',n*1000)})();return this.get(id)!}
 update(id:string,data:Partial<UserEntity>){const entries=Object.entries(data);if(!entries.length)return;const keys=entries.map(([k])=>`${k}=?`).join(',');const vals=entries.map(([,v])=>v);db.prepare(`UPDATE users SET ${keys},updated_at=? WHERE discord_id=?`).run(...vals,Math.floor(Date.now()/1000),id)}
}
export const userRepository=new UserRepository();
