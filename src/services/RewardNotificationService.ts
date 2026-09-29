import db from '../database/database';
export const rewardNotificationService={
 push(uid:string,source:string,message:string,overflow=false){db.prepare('INSERT INTO reward_notifications(user_id,source,message,overflow,created_at) VALUES(?,?,?,?,?)').run(uid,source,message,overflow?1:0,Date.now())},
 unread(uid:string){return db.prepare('SELECT * FROM reward_notifications WHERE user_id=? AND read_at IS NULL ORDER BY created_at DESC').all(uid) as any[]},
 read(uid:string,id:number){return db.prepare('UPDATE reward_notifications SET read_at=? WHERE id=? AND user_id=? AND read_at IS NULL').run(Date.now(),id,uid).changes===1}
};
