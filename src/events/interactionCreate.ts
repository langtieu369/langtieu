import {Interaction,MessageFlags} from 'discord.js';import {TuTienClient} from '../client/TuTienClient';import {safeUpdate,sellModal} from '../utils/ui';import {userRepository} from '../database/repositories/UserRepository';
import {homeView,profileView,inventoryView,worldView,branchView,craftView,recipesView,dutyView,knowledgeView,encyListView,encyEntryView,shopView,combatView,cultivationView,npcShopView,cpltShopView,marketView,bossesView,realmsView,pvpView} from '../services/TuTienUIService';
import {worldService} from '../services/WorldService';import {craftingService} from '../services/CraftingService';import {dutyService} from '../services/DutyService';import {equipmentService} from '../services/EquipmentService';import {consumableService} from '../services/ConsumableService';import {cultivationService} from '../services/CultivationService';import {marketService} from '../services/MarketService';import {combatService} from '../services/CombatService';import {Branch,LOCATIONS,RECIPES} from '../config/GameCatalog';
function parse(customId:string){const k=customId.lastIndexOf('_');const left=customId.slice(0,k),uid=customId.slice(k+1);const p=left.slice(2).split(':');return{action:p.shift()||'',extra:p.join(':'),uid}}
export async function onInteraction(client:TuTienClient,i:Interaction){
 if(i.isChatInputCommand()){if(!i.deferred&&!i.replied)await i.deferReply({flags:MessageFlags.Ephemeral});const c=client.commands.get(i.commandName);if(c)await c.execute(client,i);else await i.editReply('Lệnh này chưa được đăng ký.');return}
 if(i.isModalSubmit()&&i.customId.startsWith('ttmarketsellmodal_')){const uid=i.customId.slice('ttmarketsellmodal_'.length);if(i.user.id!==uid){await i.reply({content:'Đây không phải giao diện của đạo hữu.',flags:MessageFlags.Ephemeral});return}const qty=Number(i.fields.getTextInputValue('qty')),price=Number(i.fields.getTextInputValue('price')),item=i.fields.getTextInputValue('item');const r=marketService.create(uid,item,qty,price);await i.reply({content:r.message,flags:MessageFlags.Ephemeral});return}
 if(i.isUserSelectMenu()&&i.customId.startsWith('ttpvpselect')){const {uid}=parse(i.customId);if(i.user.id!==uid){await i.reply({content:'Đây không phải ngọc giản của đạo hữu.',flags:MessageFlags.Ephemeral});return}const r=combatService.pvp(uid,i.values[0]);await safeUpdate(i,pvpView(uid));await i.followUp({content:r.message,flags:MessageFlags.Ephemeral});return}
 if(!i.isButton()||!i.customId.startsWith('tt'))return;
 const {action,extra,uid}=parse(i.customId);if(i.user.id!==uid){await i.reply({content:'Đây không phải ngọc giản của đạo hữu.',flags:MessageFlags.Ephemeral});return}if(!userRepository.get(uid)){await i.reply({content:'Đạo hữu chưa nhập thế. Hãy dùng /taonhanvat trước.',flags:MessageFlags.Ephemeral});return}
 if(action==='marketsell'){await i.showModal(sellModal(uid));return}
 let view:any,notice='';
 switch(action){
  case'home':view=homeView(uid);break;case'profile':view=profileView(uid);break;case'inventory':view=inventoryView(uid);break;
  case'cultivation':view=cultivationView(uid);break;case'meditate':notice=cultivationService.meditate(uid).message;view=cultivationView(uid);break;
  case'world':view=worldView(uid);break;case'branch':view=branchView(uid,extra as Branch);break;
  case'act':{const r=worldService.act(uid,extra);notice=r.message;const loc=LOCATIONS.find(x=>x.id===extra);view=loc?branchView(uid,loc.branch):worldView(uid);break}
  case'craft':view=craftView(uid);break;case'recipes':view=recipesView(uid,extra as any);break;
  case'craftdo':{const r=craftingService.craft(uid,extra);notice=r.message;const rec=RECIPES.find(x=>x.id===extra);view=rec?recipesView(uid,rec.kind):craftView(uid);break}
  case'equip':notice=equipmentService.equip(uid,extra).message;view=inventoryView(uid);break;case'use':notice=consumableService.use(uid,extra).message;view=inventoryView(uid);break;
  case'duty':view=dutyView(uid);break;case'dutyclaim':notice=dutyService.claim(uid).message;view=dutyView(uid);break;case'dutyexchange':notice=marketService.exchangeToken(uid,'tranhai_lenh').message;view=dutyView(uid);break;
  case'knowledge':view=knowledgeView(uid);break;case'encycat':{const [t,p='0']=extra.split(':');view=encyListView(uid,t,Number(p)||0);break}case'ency':view=encyEntryView(uid,extra);break;
  case'shop':view=shopView(uid);break;case'npcshop':view=npcShopView(uid);break;case'npcbuy':notice=marketService.buyNpc(uid,extra).message;view=npcShopView(uid);break;case'cpltshop':view=cpltShopView(uid);break;case'cpltbuy':notice=marketService.buyCplt(uid,extra).message;view=cpltShopView(uid);break;
  case'market':view=marketView(uid);break;case'marketbuy':notice=marketService.buy(uid,Number(extra)).message;view=marketView(uid);break;case'marketcancel':notice=marketService.cancel(uid,Number(extra)).message;view=marketView(uid);break;
  case'combat':view=combatView(uid);break;case'combatexchange':notice=marketService.exchangeToken(uid,'xichduc_lenh').message;view=combatView(uid);break;case'bosses':view=bossesView(uid);break;case'bossattack':notice=combatService.attackBoss(uid,extra).message;view=bossesView(uid);break;case'realms':view=realmsView(uid);break;case'realmenter':notice=combatService.secretRealm(uid,extra).message;view=realmsView(uid);break;case'pvp':view=pvpView(uid);break;
  default:view=homeView(uid)
 }
 await safeUpdate(i,view);if(notice)await i.followUp({content:notice,flags:MessageFlags.Ephemeral})
}
