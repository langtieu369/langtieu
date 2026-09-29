import {ChatInputCommandInteraction,SlashCommandBuilder} from 'discord.js';
import {Command} from '../../structures/Command';
import {TuTienClient} from '../../client/TuTienClient';
import {userRepository} from '../../database/repositories/UserRepository';
import {BACKGROUNDS,DESTINIES,CREATION_PROLOGUE,findCombo,generateHeirloom,generateLinhCan,generateProphecy,getLinhCanFlavorText,linhCanGrade,mainLinhCan} from '../../data/creationLore';
import {itemInstanceService} from '../../services/ItemInstanceService';
import {ownerControlService} from '../../services/OwnerControlService';

function validImageUrl(value:string|null){if(!value)return '';try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.toString():''}catch{return ''}}
const DEFAULT_THUMBNAIL='https://cdn.discordapp.com/attachments/1554068055989026826/1554068450614448178/tb.jfif';

export default class TaoNhanVat extends Command{
 constructor(){super(new SlashCommandBuilder()
  .setName('taonhanvat').setDescription('Lập đạo hồ và bước vào Thương Mang Thiên Hạ')
  .addStringOption(o=>o.setName('dao_hieu').setDescription('Đạo hiệu của bạn').setRequired(true))
  .addStringOption(o=>o.setName('xuat_than').setDescription('Xuất thân trước khi nhập đạo').setRequired(true).addChoices(...BACKGROUNDS.map(x=>({name:`${x.emoji} ${x.name}`,value:x.id}))))
  .addStringOption(o=>o.setName('menh_cach').setDescription('Mệnh cách của đạo hữu').setRequired(true).addChoices(...DESTINIES.map(x=>({name:`${x.emoji} ${x.name}`,value:x.id}))))
  .addStringOption(o=>o.setName('dien_mao').setDescription('Diện mạo của nhân vật · nhập link ảnh').setRequired(false)))}
 async execute(_:TuTienClient,i:ChatInputCommandInteraction){
  if(ownerControlService.maintenanceLocked())return i.editReply('Thiên hạ đang trong maintenance để xác nhận reset; tạm thời chưa thể nhập thế.');
  if(userRepository.get(i.user.id))return i.editReply('Đạo danh đã lập, không thể nhập thế lần nữa.');
  const n=i.options.getString('dao_hieu',true).trim().slice(0,32);if(n.length<2)return i.editReply('Đạo hiệu cần ít nhất 2 ký tự.');
  const bg=BACKGROUNDS.find(x=>x.id===i.options.getString('xuat_than',true))!;const destiny=DESTINIES.find(x=>x.id===i.options.getString('menh_cach',true))!;
  const rawAvatar=i.options.getString('dien_mao');const avatar=validImageUrl(rawAvatar)||i.user.displayAvatarURL({extension:'png',size:256});const thumbnail=DEFAULT_THUMBNAIL;
  if(rawAvatar&&!validImageUrl(rawAvatar))return i.editReply('❌ Link **diện mạo** không hợp lệ. Hãy dùng `http://` hoặc `https://`.');
  const lc=generateLinhCan();const [element,value]=mainLinhCan(lc);const grade=linhCanGrade(value);const heirloom=generateHeirloom();const combo=findCombo(bg.id,element);const prophecy=generateProphecy(bg.id,destiny.id,element);
  const hpPct=(destiny.bonuses.hpPercent||0)-(destiny.penalties.hpPercent||0),atkPct=(destiny.bonuses.atkPercent||0)-(destiny.penalties.atkPercent||0),defPct=(destiny.bonuses.defPercent||0)-(destiny.penalties.defPercent||0);
  const baseHp=100+(bg.bonuses.hp||0),baseAtk=15+(bg.bonuses.atk||0),baseDef=10+(bg.bonuses.def||0);
  userRepository.create(i.user.id,n,avatar,thumbnail,{backgroundId:bg.id,destinyId:destiny.id,linhCanJson:JSON.stringify(lc),linhCanMain:element,linhCanGrade:grade,heirloomId:heirloom.id,heirloomName:heirloom.name,prophecy,innateSkill:combo?.skillName||'',hpBonus:Math.round(baseHp*hpPct/100)+(bg.bonuses.hp||0),atkBonus:Math.round(baseAtk*atkPct/100)+(bg.bonuses.atk||0),defBonus:Math.round(baseDef*defPct/100)+(bg.bonuses.def||0),mpBonus:bg.bonuses.mp||0,speedBonus:bg.bonuses.speed||0,ltBonus:bg.bonuses.lt||0,knbBonus:bg.bonuses.knb||0});
  itemInstanceService.grantCreation(i.user.id,bg.id,heirloom);
  const prologue=CREATION_PROLOGUE.map(([t,x])=>`**${t}**\n${x}`).join('\n\n');
  const itemLine=bg.startingItem?`\n🎁 **Vật truyền khởi đầu:** ${bg.startingItem.name}`:'';
  return i.editReply(`${prologue}\n\n━━━━━━━━━━━━━━━━━━\n# ${n} · Nhập Thế\n${bg.emoji} **Xuất thân:** ${bg.name}\n${destiny.emoji} **Mệnh cách:** ${destiny.name}\n🌌 **Linh căn:** ${grade} · ${element} ${value}%\n> ${getLinhCanFlavorText(element)}\n🏺 **Cổ vật:** ${heirloom.icon} ${heirloom.name} — ${heirloom.effect}${itemLine}\n${combo?`✨ **Thiên phú cộng hưởng:** ${combo.skillName}\n${combo.skillDescription}\n`:''}\n📜 **Mệnh thư**\n${prophecy}\n\nDùng **/tutien** để mở Tiên Lộ Tổng Bảng.\n— Tô Cảnh Huyền`);
 }
}
