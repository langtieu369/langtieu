import {Client,Collection,GatewayIntentBits} from 'discord.js';import {Command} from '../structures/Command';import path from 'path';import fs from 'fs';
export class TuTienClient extends Client{commands=new Collection<string,Command>();constructor(){super({intents:[GatewayIntentBits.Guilds]})}
 async start(token:string){const dir=path.join(__dirname,'../commands/general'),retired=new Set(['admin.js','admin.ts','casino.js','casino.ts']);for(const f of fs.readdirSync(dir).filter(x=>(x.endsWith('.js')||x.endsWith('.ts'))&&!retired.has(x))){const m=require(path.join(dir,f));const C=m.default;if(typeof C==='function'){const c=new C();if(this.commands.has(c.data.name))throw new Error(`Trùng slash command: /${c.data.name}`);this.commands.set(c.data.name,c)}}await this.login(token)}
}
