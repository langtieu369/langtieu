import http,{Server} from 'http';import fs from 'fs';import path from 'path';import {config} from '../config';import db from '../database/database';
type Phase='STARTING'|'READY'|'STOPPING';
let phase:Phase='STARTING',server:Server|null=null,snapshotRunning=false;
function vnDay(at:number){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at))}
function json(level:string,event:string,data:Record<string,unknown>={}){console.log(JSON.stringify({ts:new Date().toISOString(),level,event,...data}))}
export const deploymentRuntime={
 log:json,
 phase:()=>phase,
 validateStorage(){const dir=path.dirname(config.dbPath);fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(config.snapshotDir,{recursive:true});const probe=path.join(dir,`.write-probe-${process.pid}`);fs.writeFileSync(probe,'ok',{flag:'wx'});fs.unlinkSync(probe);return{dbPath:path.resolve(config.dbPath),snapshotDir:path.resolve(config.snapshotDir)}},
 startHealthServer(port=config.port){if(server)return server;server=http.createServer((req,res)=>{const known=req.url==='/healthz'||req.url==='/readyz';res.setHeader('content-type','application/json; charset=utf-8');if(!known){res.statusCode=404;res.end(JSON.stringify({ok:false,error:'NOT_FOUND'}));return}const ready=phase==='READY';res.statusCode=ready?200:503;res.end(JSON.stringify({ok:ready,phase,uptime_s:Math.floor(process.uptime())}))});server.listen(port,'0.0.0.0',()=>json('info','health.listen',{port:(server!.address() as any)?.port,phase}));return server},
 markReady(){phase='READY';json('info','runtime.ready')},
 markStopping(){phase='STOPPING';json('info','runtime.stopping')},
 async stopHealthServer(){const s=server;server=null;if(!s)return;await new Promise<void>(resolve=>s.close(()=>resolve()))},
 async snapshotIfDue(at=Date.now()){if(snapshotRunning)return{created:false,reason:'IN_PROGRESS'};const day=vnDay(at),target=path.join(config.snapshotDir,`daily-${day}.sqlite`);if(fs.existsSync(target))return{created:false,reason:'EXISTS',file:target};snapshotRunning=true;try{fs.mkdirSync(config.snapshotDir,{recursive:true});const temp=`${target}.${process.pid}.tmp`;await db.backup(temp);if(!fs.statSync(temp).size)throw new Error('SNAPSHOT_EMPTY');fs.renameSync(temp,target);const files=fs.readdirSync(config.snapshotDir).filter(x=>/^daily-\d{4}-\d{2}-\d{2}\.sqlite$/.test(x)).sort().reverse();for(const old of files.slice(config.snapshotRetention))fs.unlinkSync(path.join(config.snapshotDir,old));json('info','snapshot.created',{file:path.basename(target),retained:Math.min(files.length,config.snapshotRetention)});return{created:true,file:target}}finally{snapshotRunning=false}},
 checkpoint(){try{db.pragma('wal_checkpoint(TRUNCATE)');return true}catch{return false}}
};
