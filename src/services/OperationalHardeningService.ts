import db from '../database/database';
import {runtimeKernel} from './RuntimeKernelService';
const now=()=>Date.now();
export const operationalHardeningService={
 beginInteraction(interactionId:string,userId:string,actionKey:string){try{db.prepare("INSERT INTO interaction_receipts(interaction_id,user_id,action_key,status,started_at) VALUES(?,?,?,'PROCESSING',?)").run(interactionId,userId,actionKey,now());return true}catch{return false}},
 completeInteraction(interactionId:string){db.prepare("UPDATE interaction_receipts SET status='COMPLETED',completed_at=? WHERE interaction_id=?").run(now(),interactionId)},
 failInteraction(interactionId:string,error:unknown){db.prepare("UPDATE interaction_receipts SET status='FAILED_TERMINAL',completed_at=?,error=? WHERE interaction_id=?").run(now(),String(error instanceof Error?error.message:error).slice(0,500),interactionId)},
 allow(userId:string,actionKey:string,limit=20,windowMs=2000){const bucket=Math.floor(now()/windowMs),key=`${actionKey}:${bucket}`;const tx=db.transaction(()=>{db.prepare('INSERT INTO interaction_rate_limits(user_id,window_key,window_started_at,count) VALUES(?,?,?,1) ON CONFLICT(user_id,window_key) DO UPDATE SET count=count+1').run(userId,key,bucket*windowMs);const x=db.prepare('SELECT count FROM interaction_rate_limits WHERE user_id=? AND window_key=?').get(userId,key) as any;return x.count<=limit});return tx.immediate()},
 acquireSchedulerCycle(at=now()){const minute=Math.floor(at/60_000),r=runtimeKernel.acquireLease('WORLD','SCHEDULER_CYCLE',String(minute),59_000);return r.ok},
 recover(at=now()){
  const out={leases:0,invites:0,parties:0,npc:0,owners:0,resets:0,rateLimits:0};
  out.leases=db.prepare("DELETE FROM runtime_leases WHERE state='ACTIVE' AND expires_at<=?").run(at).changes;
  out.invites+=db.prepare('DELETE FROM party_invites WHERE expires_at<=?').run(at).changes;
  out.invites+=db.prepare("UPDATE partner_invites SET status='EXPIRED' WHERE status IN ('INVITE_PENDING','ACCEPTED_PENDING_CONFIRM') AND expires_at<=?").run(at).changes;
  out.invites+=db.prepare("UPDATE mentorship_invites SET status='EXPIRED' WHERE status='INVITED' AND expires_at<=?").run(at).changes;
  const expiredParties=db.prepare("SELECT id FROM party_lobbies WHERE status='FORMING' AND updated_at<=?").all(at-30*60_000) as {id:string}[];
  if(expiredParties.length)db.transaction(()=>{for(const p of expiredParties){db.prepare('DELETE FROM party_invites WHERE party_id=?').run(p.id);db.prepare('DELETE FROM party_members WHERE party_id=?').run(p.id);db.prepare("UPDATE party_lobbies SET status='EXPIRED',updated_at=? WHERE id=?").run(at,p.id)}}).immediate();out.parties=expiredParties.length;
  const leases=db.prepare("SELECT * FROM npc_activity_leases WHERE state='ACTIVE' AND expires_at<=?").all(at) as any[];for(const x of leases){db.transaction(()=>{db.prepare("UPDATE npc_activity_leases SET state='EXPIRED' WHERE lease_key=?").run(x.lease_key);db.prepare("UPDATE npc_companion_states SET state='RESTING',activity_id=NULL,rest_until=?,updated_at=? WHERE user_id=? AND npc_id=?").run(at+30*60_000,at,x.player_id,x.npc_id);db.prepare("UPDATE npc_presence SET state='available',lease_key=NULL,lease_expires_at=NULL,updated_at=? WHERE npc_id=? AND lease_key=?").run(at,x.npc_id,x.lease_key)})();out.npc++}
  out.owners=db.prepare("UPDATE owner_mutations SET status='EXPIRED',nonce_hash='' WHERE status='PENDING' AND expires_at<=?").run(at).changes;
  out.resets=db.prepare("UPDATE world_reset_jobs SET state='CANCELLED',error='RECOVERED_STALE_SNAPSHOT',updated_at=? WHERE state='SNAPSHOT_CREATING' AND updated_at<=?").run(at,at-10*60_000).changes;
  if(out.resets)db.prepare("UPDATE world_meta SET value='0',updated_at=? WHERE key='maintenance'").run(at);
  out.rateLimits=db.prepare('DELETE FROM interaction_rate_limits WHERE window_started_at<=?').run(at-60_000).changes;
  db.prepare("DELETE FROM interaction_receipts WHERE started_at<=? AND status IN ('COMPLETED','FAILED_TERMINAL')").run(at-7*86400_000);
  return out
 }
};
