const [dbPath,receiptKey,userId]=process.argv.slice(2);process.env.DB_PATH=dbPath;
const {initDatabase}=require('./database/database'),db=require('./database/database').default,{runtimeKernel}=require('./services/RuntimeKernelService');
initDatabase();try{const r=runtimeKernel.execute(receiptKey,'CONCURRENCY',userId,'CREDIT_ONE',()=>{db.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham+1 WHERE discord_id=?').run(userId);return{credited:1}});process.stdout.write(r.replayed?'R':'C')}catch(e:any){process.stderr.write(String(e?.message||e));process.exit(2)}
