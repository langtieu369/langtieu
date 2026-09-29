import db from '../database/database';
export const DEFAULT_PROFILE_THUMBNAIL='https://cdn.discordapp.com/attachments/1554068055989026826/1554068450614448178/tb.jfif';
function imageUrl(value:string){try{const u=new URL(value.trim());return ['http:','https:'].includes(u.protocol)&&u.toString().length<=2000?u.toString():''}catch{return ''}}
export const appearanceService={
 update(uid:string,field:'avatar_url'|'thumbnail_url',raw:string){const value=imageUrl(raw);if(!value)return{ok:false,message:'Link ảnh không hợp lệ; cần dùng `http://` hoặc `https://`.'};const user=db.prepare('SELECT avatar_url,thumbnail_url FROM users WHERE discord_id=?').get(uid) as any;if(!user)return{ok:false,message:'Chưa có đạo hồ.'};db.transaction(()=>{db.prepare(`UPDATE users SET ${field}=?,updated_at=? WHERE discord_id=?`).run(value,Math.floor(Date.now()/1000),uid);db.prepare('INSERT INTO appearance_preferences(user_id,field,old_url,new_url,created_at) VALUES(?,?,?,?,?)').run(uid,field,user[field]||'',value,Date.now())})();return{ok:true,message:field==='avatar_url'?'Đã đổi diện mạo nhân vật.':'Đã đổi ảnh nền hồ sơ.'}},
 resetThumbnail(uid:string){return this.update(uid,'thumbnail_url',DEFAULT_PROFILE_THUMBNAIL)}
};
