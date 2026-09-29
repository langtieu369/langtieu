export type Rarity='pham'|'linh'|'huyen'|'dia'|'thien'|'tien';
import type {RecipeFireProfile} from './RareFireCatalog';
import {canonicalItemName,resolveItemName,auditItemNames} from './ItemNames';
import {EMOJIS,emojiText,emojiFromLegacy,auditEmojiRegistry} from './emojis';
export type SourceKind='work'|'fishing'|'combat'|'secret_realm'|'recipe'|'duty'|'shop'|'pvp'|'boss'|'dismantle'|'journey';
export type Branch='mining'|'jade'|'gathering'|'patrolling'|'adventure'|'archaeology'|'escort'|'fishing';
export type CraftKind='alchemy'|'forging'|'cooking';
export type ItemType='material'|'fish'|'food'|'pill'|'weapon'|'armor'|'special'|'storage';

export const WORLD={
  name:'Thương Mang Thiên Hạ', mortalWorld:'Thiên Mang Sơn Hạ', dutyHall:'Trấn Hải Các',
  shopRoot:'Nhất Phẩm Các', market:'Kim Vân Đài', knowledgeHall:'Tử Hà Các', combatHall:'Xích Dực Các'
} as const;

export const EMOJI={
  currency:{lt:emojiText('currency_lt'),cplt:emojiText('currency_cplt')},
  menu:{home:emojiText('home'),profile:emojiText('profile'),world:emojiText('world'),duty:emojiText('duty'),shop:emojiText('shop'),knowledge:emojiText('knowledge'),combat:emojiText('combat'),inventory:emojiText('inventory'),craft:emojiText('craft'),cultivation:emojiText('cultivation')},
  rarity:{pham:emojiText('rarity_pham'),linh:emojiText('rarity_linh'),huyen:emojiText('rarity_huyen'),dia:emojiText('rarity_dia'),thien:emojiText('rarity_thien'),tien:emojiText('rarity_tien')}
} as const;
export {EMOJIS};
export const CURRENCY={LT:{field:'coin_ha_pham',name:'Linh Thạch',short:'LT',emoji:emojiText('currency_lt')},CPLT:{field:'knb',name:'Cực Phẩm Linh Thạch',short:'CPLT',emoji:emojiText('currency_cplt')}} as const;

export const REALMS=[
  {rank:0,id:'luyen_khi',name:'Luyện Khí',minLevel:1},
  {rank:1,id:'truc_co',name:'Trúc Cơ',minLevel:20},
  {rank:2,id:'kim_dan',name:'Kim Đan',minLevel:50},
  {rank:3,id:'nguyen_anh',name:'Nguyên Anh',minLevel:90},
  {rank:4,id:'hoa_than',name:'Hóa Thần',minLevel:140},
  {rank:5,id:'luyen_hu',name:'Luyện Hư',minLevel:200},
  {rank:6,id:'hop_the',name:'Hợp Thể',minLevel:270},
  {rank:7,id:'dai_thua',name:'Đại Thừa',minLevel:350},
  {rank:8,id:'do_kiep',name:'Độ Kiếp',minLevel:440},
  {rank:9,id:'tien_nhan',name:'Tiên Nhân',minLevel:550},
] as const;
export function realmOf(level:number){return [...REALMS].reverse().find(r=>level>=r.minLevel)??REALMS[0]}
export function realmName(rank:number){return REALMS[Math.max(0,Math.min(rank,REALMS.length-1))].name}
export function realmTitle(level:number,base='Tán Tu'){return realmOf(level).id==='tien_nhan'?'✨✦ Tiên Nhân ✦✨':base}

export const RARITY_NAME:Record<Rarity,string>={pham:'Phàm',linh:'Linh',huyen:'Huyền',dia:'Địa',thien:'Thiên',tien:'Tiên'};
export function rarityName(r:Rarity){return RARITY_NAME[r]}

export interface Source{kind:SourceKind;location:string;detail:string;minRealm:number}
export interface Item{id:string;name:string;emoji:string;type:ItemType;rarity:Rarity;description:string;value:number;sources:Source[];uses:string[];stats?:Record<string,number>;tradable:boolean}
export interface Drop{item:string;min:number;max:number;weight:number}
export interface Location{id:string;parent:string;name:string;branch:Branch;description:string;minRealm:number;stamina:number;lt:[number,number];tuvi:[number,number];drops:Drop[]}
export interface Recipe{id:string;name:string;kind:CraftKind;minRealm:number;ingredients:[string,number][];output:[string,number];lt:number;description:string;fire?:RecipeFireProfile}
export interface Boss{id:string;name:string;minRealm:number;maxHp:number;power:number;stamina:number;rewardLt:number;drop:string;dropQty:[number,number];description:string}
export interface SecretRealm{id:string;name:string;minRealm:number;power:number;stamina:number;tuvi:number;drops:Drop[];description:string}
const S=(kind:SourceKind,location:string,detail:string,minRealm=0):Source=>({kind,location,detail,minRealm});
const I=(id:string,name:string,emoji:string,type:ItemType,rarity:Rarity,description:string,value:number,sources:Source[],uses:string[],stats?:Record<string,number>,tradable=true):Item=>({id,name:canonicalItemName(id,name),emoji:emojiFromLegacy(emoji),type,rarity,description,value,sources,uses,stats,tradable});

export const ITEMS:Record<string,Item>={};
function add(i:Item){ITEMS[i.id]=i}

const tierRarity:Rarity[]=['pham','linh','huyen','huyen','dia','dia','thien','thien','thien','tien'];
const ores=[
 ['thanh_van_thiet','Thanh Vân Thiết Sa','Địa Sinh Vạn Khoáng · Thanh Thạch Cốc'],['huyen_ngan','Huyền Ngân Tinh','Địa Sinh Vạn Khoáng · Hắc Nham Mạch'],['tu_kim','Tử Kim Linh Khoáng','Địa Sinh Vạn Khoáng · Tử Kim Động'],['dia_mach_tinh','Địa Mạch Huyền Tinh','Địa Sinh Vạn Khoáng · Long Mạch Uyên'],['thai_am_tuy','Thái Âm Ngân Tủy','Sơn Sinh Vạn Ngọc · Nguyệt Ẩn Nham'],['hu_khong_sa','Hư Không Tinh Sa','Sơn Sinh Vạn Ngọc · Hư Không Thạch Lâm'],['hon_nguyen_kim','Hỗn Nguyên Linh Kim','Sơn Sinh Vạn Ngọc · Hỗn Nguyên Sơn Phúc'],['cuu_thien_thiet','Cửu Thiên Tinh Thiết','Sơn Sinh Vạn Ngọc · Thiên Tinh Nham Đài'],['loi_kiep_kim','Lôi Kiếp Tiên Kim','Địa Sinh Vạn Khoáng · Lôi Vực Địa Tâm'],['tien_nguyen_thiet','Tiên Nguyên Thần Thiết','Sơn Sinh Vạn Ngọc · Tiên Quang Cổ Mạch']
] as const;
const herbs=[
 ['thanh_linh_thao','Thanh Linh Thảo','Bách Thảo Linh Cốc · Thanh Diệp Pha'],['huyet_nguyen_sam','Huyết Nguyên Sâm','Bách Thảo Linh Cốc · Dược Vụ Lâm'],['kim_tuy_chi','Kim Tủy Linh Chi','Bách Thảo Linh Cốc · Kim Chi Nhai'],['anh_hon_hoa','Anh Hồn Hoa','Bách Thảo Linh Cốc · U Hồn Dược Viên'],['hoa_than_lien','Hóa Thần Thanh Liên','Bách Thảo Linh Cốc · Thanh Liên Thiên Trì'],['hu_linh_diep','Hư Linh Diệp','Bách Thảo Linh Cốc · Hư Linh Dược Cảnh'],['hop_dao_qua','Hợp Đạo Linh Quả','Bách Thảo Linh Cốc · Hợp Đạo Cổ Lâm'],['dai_la_tu_lien','Đại La Tử Liên','Bách Thảo Linh Cốc · Tử Hà Thiên Cốc'],['cuu_kiep_lan','Cửu Kiếp Lôi Lan','Bách Thảo Linh Cốc · Kiếp Vân Lôi Cốc'],['tien_ha_chi','Tiên Hà Ngọc Chi','Bách Thảo Linh Cốc · Tiên Hà Dược Uyển']
] as const;
const jades=[
 ['bich_linh_ngoc','Bích Linh Ngọc','Sơn Sinh Vạn Ngọc · Bích Ngọc Khê'],['van_van_ngoc','Vân Văn Ngọc Tủy','Sơn Sinh Vạn Ngọc · Vân Văn Thạch Cốc'],['tu_phu_tinh','Tử Phủ Linh Tinh','Sơn Sinh Vạn Ngọc · Tử Phủ Thạch Đài'],['nguyen_anh_phach','Nguyên Anh Hồn Phách','Thái Cổ Di Cảnh · U Minh Cổ Mộ'],['than_hon_tinh','Thần Hồn Tinh Phách','Thái Cổ Di Cảnh · Thần Niệm Phế Đô'],['hu_khong_ngoc','Hư Không Ngọc Tâm','Thái Cổ Di Cảnh · Hư Thiên Tàn Điện'],['hop_the_tuy','Vạn Tượng Đạo Tủy','Thái Cổ Di Cảnh · Vạn Tượng Cổ Đài'],['dai_thua_chau','Đại Thừa Thiên Châu','Thái Cổ Di Cảnh · Đại La Thiên Khư'],['kiep_loi_tam','Kiếp Lôi Đạo Tâm','Thái Cổ Di Cảnh · Cửu Kiếp Tàn Thành'],['tien_van_ngoc','Tiên Văn Ngọc Cốt','Thái Cổ Di Cảnh · Phi Tiên Cổ Điện']
] as const;
for(let r=0;r<10;r++){
  const [oid,oname,oloc]=ores[r]; add(I(oid,oname,'⛏️','material',tierRarity[r],`Khoáng liệu ${realmName(r)} dùng trong luyện khí và chế tác.`,20+r*90,[S('work',oloc,'Khai thác khoáng mạch',r)],['Luyện khí','Rèn trang bị'],undefined,true));
  const [hid,hname,hloc]=herbs[r]; add(I(hid,hname,'🌿','material',tierRarity[r],`Dược liệu ${realmName(r)} dùng trong luyện đan và linh thiện.`,18+r*85,[S('work',hloc,'Hái lượm dược liệu',r)],['Luyện đan','Chế biến linh thiện'],undefined,true));
  const [jid,jname,jloc]=jades[r]; add(I(jid,jname,'💎','material',tierRarity[r],`Linh tài hiếm của tầng ${realmName(r)}, dùng trong pháp khí và đan đạo.`,24+r*110,[S(r<3?'work':'secret_realm',jloc,r<3?'Tầm ngọc và khảo cổ':'Thăm dò di tích cao giai',r)],['Luyện khí','Luyện đan cao giai'],undefined,true));
}

const fish=[
 ['thanh_lan_ngu','Thanh Lân Ngư','Bích Ba Hồ'],['bach_van_ngu','Bạch Vân Ngư','Thanh Khê'],['xich_vi_linh_ly','Xích Vĩ Linh Lý','Thanh Khê'],['ngoc_lan_ngu','Ngọc Lân Huyền Ngư','Huyền Hải'],['han_dam_tuyet_ngu','Hàn Đàm Tuyết Ngư','Huyền Hải'],['kim_si_long_ly','Kim Sí Long Lý','Long Triều Hải Nhãn'],['huyen_hai_long_tuy','Huyền Hải Long Tu','Vạn Trượng Hải Uyên'],['thai_hu_kinh','Thái Hư Linh Kình','Thái Hư Uyên'],['cuu_kiep_loi_ngu','Cửu Kiếp Lôi Ngư','Kiếp Hải'],['tien_ha_ngoc_kình','Tiên Hà Ngọc Kình','Phi Tiên Hải']
] as const;
for(let r=0;r<10;r++){const [id,name,loc]=fish[r];add(I(id,name,r>=5?'🐉':'🐟','fish',tierRarity[r],`Linh ngư sinh trưởng tại thủy vực ${realmName(r)}.`,25+r*120,[S('fishing',`Triều Sinh Vạn Tượng · ${loc}`,'Buông câu',r)],[`Chế biến ${realmName(r)} linh thiện`],undefined,true));}

const beastMats=['Thanh Nha Yêu Cốt','Huyết Lang Nội Đan','Kim Giác Yêu Tinh','Anh Linh Thú Hạch','Thần Hồn Yêu Tủy','Hư Thiên Yêu Phách','Vạn Tượng Thú Tâm','Đại Hoang Cổ Huyết','Cửu Kiếp Yêu Nguyên','Tiên Thú Chân Huyết'];
for(let r=0;r<10;r++) add(I(`beast_${r}`,beastMats[r],r>=7?'🐲':'🔮','material',tierRarity[r],`Chiến lợi phẩm từ yêu thú cấp ${realmName(r)}.`,30+r*140,[S('combat',`Tuần Thú Sơn Hà · ${realmName(r)} Yêu Vực`,'Tuần tra và trừ yêu',r),S('boss','Xích Dực Các · Cường Địch','Chiến lợi phẩm cường địch',r)],['Luyện đan','Luyện khí','Linh thiện'],undefined,true));

const weaponNames=Array.from({length:10},(_,r)=>canonicalItemName(`weapon_${r}`));
const armorNames=Array.from({length:10},(_,r)=>canonicalItemName(`armor_${r}`));
for(let r=0;r<10;r++){
 add(I(`weapon_${r}`,weaponNames[r],'⚔️','weapon',tierRarity[r],`Pháp khí công phạt thích hợp tu sĩ ${realmName(r)}.`,180+r*700,[S('recipe','Thiên Công Lô',`Rèn pháp khí ${realmName(r)}`,r)],['Trang bị tăng Công Kích'],{atk:25+r*45,crit:r*.005},true));
 add(I(`armor_${r}`,armorNames[r],'🛡️','armor',tierRarity[r],`Hộ thân pháp y thích hợp tu sĩ ${realmName(r)}.`,170+r*680,[S('recipe','Thiên Công Lô',`Rèn hộ giáp ${realmName(r)}`,r)],['Trang bị tăng Phòng Ngự và Sinh Lực'],{def:18+r*35,hp:80+r*140},true));
}

const pillNames=Array.from({length:9},(_,r)=>canonicalItemName(`pill_${r}`));
for(let r=0;r<9;r++) add(I(`pill_${r}`,pillNames[r],'💊','pill',tierRarity[r],`Đan dược hỗ trợ tu luyện ở ${realmName(r)}.`,90+r*500,[S('recipe','Đan Hà Cốc',`Luyện chế đan dược ${realmName(r)}`,r)],[`Nhận Tu Vi và hỗ trợ tu luyện ${realmName(r)}`],undefined,true));

const foodNames=Array.from({length:10},(_,r)=>canonicalItemName(`food_${r}`));
for(let r=0;r<10;r++) add(I(`food_${r}`,foodNames[r],'🍲','food',tierRarity[r],`Linh thiện ${realmName(r)}, tạo gia trì tạm thời sau khi dùng.`,70+r*320,[S('recipe','Ngũ Vị Linh Trù',`Chế biến linh thiện ${realmName(r)}`,r)],['Gia trì chiến đấu và tu luyện tạm thời'],undefined,true));

add(I('co_do_tan_phien','Thái Cổ Tàn Phiến','🗺️','special','huyen','Mảnh cổ đồ ghi lại dấu vết bí cảnh.',180,[S('work','Vân Du Thiên Lộ · Phong Vân Cổ Đạo','Tìm kiếm kỳ duyên',1),S('work','Phong Trần Tiêu Lộ · Thanh Hà Thương Đạo','Hộ tiêu và thăm dò thương lộ',1)],['Mở thêm cơ hội trong Bí Cảnh'],undefined,true));
add(I('tranhai_lenh','Trấn Hải Công Lệnh','📜','special','linh','Tín vật ghi nhận công tích tại Trấn Hải Các.',120,[S('duty','Trấn Hải Các','Hoàn thành nghĩa vụ ngày',0)],['Đổi vật tư tại Nhất Phẩm Các'],undefined,true));
add(I('xichduc_lenh','Xích Dực Chiến Lệnh','🪽','special','huyen','Chiến lệnh do Xích Dực Các ghi nhận sau luận võ.',160,[S('pvp','Xích Dực Các · Luận Võ Đài','Thắng luận võ',0)],['Đổi vật tư chiến đấu'],undefined,true));
add(I('boss_tan_tinh','Cường Địch Tàn Tinh','🌑','material','dia','Tinh hoa còn lại sau khi cường địch bị đánh bại.',500,[S('boss','Xích Dực Các · Cường Địch','Tham gia hạ cường địch',3)],['Luyện khí cao giai','Đổi vật tư'],undefined,true));
add(I('hoa_tinh_tan_phien','Hỏa Tinh Tàn Phiến','🔥','material','huyen','Hỏa tinh còn lại khi phân giải trang bị cao phẩm; không phải mảnh Dị Hỏa và không thể ghép thành Dị Hỏa.',320,[S('dismantle','Tác Phường · Phân Giải','Phân giải trang bị cao phẩm theo công thức hợp lệ',3)],['Phụ liệu điều hỏa','Tu bổ Hỏa Vị','Khí Phương chịu nhiệt'],undefined,true));
add(I('MAT-HAT-MUA-MUON','Hạt Mùa Muộn','🌱','material','pham','Phần hạt nông hộ Đông Lăng để lại sau Cơ Duyên; dùng gieo trồng, không sinh vật liệu hiếm.',20,[S('journey','Đông Lăng','Mùa Hoa Nở Muộn',0)],['Gieo tại Linh Điền'],undefined,true));
add(I('MAT-MANH-DEN-HOI','Mảnh Đèn Hội','🏮','material','pham','Vật liệu còn lại sau khi dọn hội Yên Tân.',18,[S('journey','Yên Tân','Ngày Hội Của Kẻ Đến Muộn',0)],['Chế tác trang trí Động Phủ'],undefined,true));
add(I('SEED-XICH-DIEP','Hạt Xích Diệp','🍂','material','linh','Hạt giống từ vườn giống được cứu sau thiên tượng.',45,[S('journey','Mạc Lĩnh','Mầm Cây Dưới Tro',0)],['Gieo phục hồi sinh thái'],undefined,false));
add(I('MAT-NHAM-TAM-THAO','Nham Tâm Thảo','🌿','material','linh','Dược thảo mọc lại trên vùng đất đã ổn định sau hỏa biến.',55,[S('journey','Mạc Lĩnh','Mầm Cây Dưới Tro',0)],['Ôn Lô Cao','Recipe chịu nhiệt'],undefined,true));
add(I('TOOL-DEN-TAM-DUNG','Đèn Tạm Dựng','🏮','special','linh','Đèn hiệu phân bổ sau ba đêm giữ trạm; có độ bền riêng trong contract Cơ Duyên.',80,[S('journey','Trấn Hải Trạm','Đèn Sáng Qua Ba Đêm',0)],['Tuần tra đêm','Hộ sinh'],undefined,false));
add(I('MAT-THANH-TI','Thanh Ti','🧵','material','pham','Sợi vật tư dùng sửa đèn hiệu và đồ trạm.',15,[S('journey','Trấn Hải Trạm','Đèn Sáng Qua Ba Đêm',0)],['Sửa đèn','Chế tác'],undefined,true));
add(I('PILL-HOI-KHI','Hồi Khí Đan','💊','pill','linh','Đan dược lấy từ tồn kho NPC có ledger; hồi khí chiến đấu, không hồi Khí Lực.',90,[S('journey','Động Phủ','Ba Lần Gõ Cửa',0)],['Hồi khí chiến đấu'],undefined,true));
add(I('gia_truyen_kiem','Bảo Kiếm Gia Truyền','🗡️','weapon','pham','Vật truyền nhập thế của người xuất thân tu chân gia tộc; mỗi thanh là một item instance có provenance và độ bền riêng.',0,[S('journey','Nhập Thế · Tu Chân Gia Tộc','Trưởng bối trao trước ngày rời nhà',0)],['Trang bị','Tu bổ','Theo dõi lịch sử truyền thừa'],{atk:12,crit:.01},false));
add(I('manh_ngoc_ho_menh','Mảnh Ngọc Hộ Mệnh','💠','special','linh','Kỷ vật nhân quả được cấp dưới dạng item instance; có thể chuyển từ Nguyên Vẹn sang Rạn Nứt khi hộ mệnh.',0,[S('journey','Nhập Thế · Kỳ Ngộ Sinh Tử','Được để lại bên người sau lần thoát nạn',0)],['Hộ mệnh một lần','Mở đầu mối nhân quả','Tĩnh dưỡng tại Động Phủ'],undefined,false));

export const STORAGE_TIERS=[
 {itemId:'bag_hanh_nang',name:canonicalItemName('bag_hanh_nang'),tier:0,capacity:12,rarity:'pham' as Rarity,minRealm:0,success:1},
 {itemId:'bag_can_khon_pham',name:canonicalItemName('bag_can_khon_pham'),tier:1,capacity:20,rarity:'pham' as Rarity,minRealm:0,success:.90},
 {itemId:'bag_can_khon_linh',name:canonicalItemName('bag_can_khon_linh'),tier:2,capacity:36,rarity:'linh' as Rarity,minRealm:1,success:.82},
 {itemId:'bag_can_khon_huyen',name:canonicalItemName('bag_can_khon_huyen'),tier:3,capacity:56,rarity:'huyen' as Rarity,minRealm:2,success:.72},
 {itemId:'bag_can_khon_dia',name:canonicalItemName('bag_can_khon_dia'),tier:4,capacity:80,rarity:'dia' as Rarity,minRealm:4,success:.62},
 {itemId:'bag_can_khon_thien',name:canonicalItemName('bag_can_khon_thien'),tier:5,capacity:120,rarity:'thien' as Rarity,minRealm:6,success:.52}
] as const;
add(I('bag_hanh_nang','Hành Nang','🎒','storage','pham','Túi vải trữ vật nhập thế, có 12 ô. Không thể làm phôi Càn Khôn Nang.',0,[S('duty','Nhập Thế','Tự động trang bị khi lập nhân vật',0)],['Trữ vật khởi đầu'],undefined,false));
for(const b of STORAGE_TIERS.slice(1))add(I(b.itemId,b.name,'🎒','storage',b.rarity,`Trữ vật ${b.capacity} ô; một stack chiếm một hoặc nhiều ô theo giới hạn chồng. Chỉ túi rỗng, không trang bị mới được làm phôi nâng phẩm.`,0,[S('recipe','Thiên Công Lô','《Càn Khôn Nang Chế Pháp》',b.minRealm)],['Trang bị vào ô Trữ Vật','Làm phôi nâng phẩm liền kề'],undefined,false));

export const BRANCHES:{id:Branch;name:string;description:string;emoji:string}[]=[
 {id:'mining',name:'Địa Sinh Vạn Khoáng',description:'Khai thác quặng và nguyên liệu khoáng từ địa mạch.',emoji:'⛏️'},
 {id:'jade',name:'Sơn Sinh Vạn Ngọc',description:'Tìm ngọc thạch, linh tinh và khoáng vật quý hiếm.',emoji:'💎'},
 {id:'gathering',name:'Bách Thảo Linh Cốc',description:'Hái lượm linh thảo, dược liệu và linh thực.',emoji:'🌿'},
 {id:'fishing',name:'Triều Sinh Vạn Tượng',description:'Câu linh ngư và thu thập nguyên liệu thủy sinh.',emoji:'🎣'},
 {id:'patrolling',name:'Tuần Thú Sơn Hà',description:'Tuần tra các địa vực và đối phó yêu thú, tai họa.',emoji:'🛡️'},
 {id:'adventure',name:'Vân Du Thiên Lộ',description:'Du hành phàm thế, ngự kiếm và tìm kiếm cơ duyên.',emoji:'☁️'},
 {id:'archaeology',name:'Thái Cổ Di Cảnh',description:'Thăm dò cổ mộ, di tích và tàn tích xa xưa.',emoji:'🏺'},
 {id:'escort',name:'Phong Trần Tiêu Lộ',description:'Hộ tống thương đội và xử lý biến cố trên thương lộ.',emoji:'🐎'},
];
const locNames={
 mining:['Thanh Thạch Cốc','Hắc Nham Mạch','Tử Kim Động','Long Mạch Uyên','Địa Tâm Huyền Quật','Hư Không Khoáng Giới','Hỗn Nguyên Địa Cung','Thiên Tinh Địa Mạch','Lôi Vực Địa Tâm','Tiên Nguyên Cổ Mạch'],
 jade:['Bích Ngọc Khê','Vân Văn Thạch Cốc','Tử Phủ Thạch Đài','Nguyên Anh Ngọc Sơn','Nguyệt Ẩn Nham','Hư Không Thạch Lâm','Hỗn Nguyên Sơn Phúc','Thiên Tinh Nham Đài','Kiếp Lôi Ngọc Sơn','Tiên Quang Cổ Mạch'],
 gathering:['Thanh Diệp Pha','Dược Vụ Lâm','Kim Chi Nhai','U Hồn Dược Viên','Thanh Liên Thiên Trì','Hư Linh Dược Cảnh','Hợp Đạo Cổ Lâm','Tử Hà Thiên Cốc','Kiếp Vân Lôi Cốc','Tiên Hà Dược Uyển'],
 fishing:['Bích Ba Hồ','Thanh Khê','Xích Hà','Huyền Hải','Hàn Đàm','Long Triều Hải Nhãn','Vạn Trượng Hải Uyên','Thái Hư Uyên','Kiếp Hải','Phi Tiên Hải'],
 patrolling:['Thanh Phong Lĩnh','Huyết Lang Sơn','Kim Giác Yêu Lâm','Anh Linh Quỷ Cốc','Thần Hồn Hoang Nguyên','Hư Thiên Yêu Vực','Vạn Tượng Thú Sơn','Đại Hoang Cổ Vực','Cửu Kiếp Yêu Địa','Tiên Thú Linh Sơn'],
 adventure:['Phong Vân Cổ Đạo','Vân Hải Thiên Kiều','Tử Khí Đông Lai Lộ','Nguyên Anh Vân Cảnh','Thần Tiêu Thiên Lộ','Hư Không Phi Độ','Vạn Tượng Thiên Môn','Đại La Vân Hải','Cửu Kiếp Thiên Quan','Phi Tiên Cổ Lộ'],
 archaeology:['Tàn Bia Hoang Địa','Vân Văn Cổ Quật','Tử Phủ Tàn Thành','U Minh Cổ Mộ','Thần Niệm Phế Đô','Hư Thiên Tàn Điện','Vạn Tượng Cổ Đài','Đại La Thiên Khư','Cửu Kiếp Tàn Thành','Phi Tiên Cổ Điện'],
 escort:['Thanh Hà Thương Đạo','Bắc Phong Cổ Lộ','Tử Kim Quan Đạo','Vạn Lý Vân Lộ','Hư Thiên Thương Tuyến','Hợp Đạo Cổ Quan','Đại Hoang Thiên Lộ','Cửu Châu Vân Lộ','Kiếp Vân Tiêu Lộ','Phi Tiên Thương Lộ']
} as const;
export const LOCATIONS:Location[]=[];
for(let r=0;r<10;r++){
 LOCATIONS.push({id:`mine_${r}`,parent:'Địa Sinh Vạn Khoáng',name:locNames.mining[r],branch:'mining',description:`Khai thác khoáng liệu cấp ${realmName(r)}.`,minRealm:r,stamina:8+r*2,lt:[18+r*10,35+r*18],tuvi:[12+r*10,24+r*16],drops:[{item:ores[r][0],min:1,max:2+(r<4?1:0),weight:100}]});
 LOCATIONS.push({id:`jade_${r}`,parent:'Sơn Sinh Vạn Ngọc',name:locNames.jade[r],branch:'jade',description:`Tìm linh ngọc và tinh thạch cấp ${realmName(r)}.`,minRealm:r,stamina:9+r*2,lt:[20+r*12,38+r*20],tuvi:[12+r*11,25+r*17],drops:[{item:jades[r][0],min:1,max:r<3?2:1,weight:100}]});
 LOCATIONS.push({id:`herb_${r}`,parent:'Bách Thảo Linh Cốc',name:locNames.gathering[r],branch:'gathering',description:`Hái dược liệu cấp ${realmName(r)}.`,minRealm:r,stamina:8+r*2,lt:[15+r*10,32+r*17],tuvi:[12+r*10,24+r*16],drops:[{item:herbs[r][0],min:1,max:2+(r<4?1:0),weight:100}]});
 LOCATIONS.push({id:`fish_${r}`,parent:'Triều Sinh Vạn Tượng',name:locNames.fishing[r],branch:'fishing',description:`Câu linh ngư cấp ${realmName(r)}.`,minRealm:r,stamina:9+r*2,lt:[16+r*11,34+r*18],tuvi:[10+r*9,20+r*15],drops:[{item:fish[r][0],min:1,max:r<3?2:1,weight:100}]});
 LOCATIONS.push({id:`patrol_${r}`,parent:'Tuần Thú Sơn Hà',name:locNames.patrolling[r],branch:'patrolling',description:`Tuần tra và trừ yêu cấp ${realmName(r)}.`,minRealm:r,stamina:11+r*2,lt:[25+r*13,48+r*22],tuvi:[18+r*12,32+r*20],drops:[{item:`beast_${r}`,min:1,max:1,weight:100}]});
 LOCATIONS.push({id:`adv_${r}`,parent:'Vân Du Thiên Lộ',name:locNames.adventure[r],branch:'adventure',description:`Du hành và tìm cơ duyên cấp ${realmName(r)}.`,minRealm:r,stamina:10+r*2,lt:[20+r*15,50+r*24],tuvi:[20+r*12,40+r*21],drops:r===1?[{item:'co_do_tan_phien',min:1,max:1,weight:25},{item:herbs[r][0],min:1,max:1,weight:75}]:[{item:herbs[r][0],min:1,max:1,weight:55},{item:jades[r][0],min:1,max:1,weight:45}]});
 LOCATIONS.push({id:`arch_${r}`,parent:'Thái Cổ Di Cảnh',name:locNames.archaeology[r],branch:'archaeology',description:`Khảo cổ và thăm dò tàn tích cấp ${realmName(r)}.`,minRealm:r,stamina:12+r*2,lt:[22+r*16,52+r*25],tuvi:[22+r*13,42+r*22],drops:[{item:jades[r][0],min:1,max:1,weight:70},{item:ores[r][0],min:1,max:1,weight:30}]});
 LOCATIONS.push({id:`escort_${r}`,parent:'Phong Trần Tiêu Lộ',name:locNames.escort[r],branch:'escort',description:`Hộ tiêu trên thương lộ cấp ${realmName(r)}.`,minRealm:r,stamina:10+r*2,lt:[35+r*18,65+r*30],tuvi:[18+r*10,35+r*18],drops:r===1?[{item:'co_do_tan_phien',min:1,max:1,weight:35},{item:ores[r][0],min:1,max:1,weight:65}]:[{item:ores[r][0],min:1,max:1,weight:50},{item:herbs[r][0],min:1,max:1,weight:50}]});
}
export const RECIPES:Recipe[]=[];
const alchemyFire=(r:number):RecipeFireProfile=>{
 const profiles:RecipeFireProfile[]=[
  {domain:'alchemy',preferred:['tu','sinh'],allowed:['binh','tran'],opposed:['phat'],qualityEligible:true},
  {domain:'alchemy',preferred:['tu','binh'],allowed:['sinh','tran'],opposed:['dong'],qualityEligible:true},
  {domain:'alchemy',preferred:['hoa','phat'],allowed:['duong','tran'],opposed:['han','liem'],qualityEligible:true},
  {domain:'alchemy',preferred:['liem','tinh'],allowed:['han','binh'],opposed:['phat'],qualityEligible:true},
  {domain:'alchemy',preferred:['tinh','sinh'],allowed:['binh','liem'],opposed:['hoa'],qualityEligible:true},
  {domain:'alchemy',preferred:['hoa','phat'],allowed:['duong','kich'],opposed:['liem'],qualityEligible:true},
  {domain:'alchemy',preferred:['tran','duong_luyen'],allowed:['binh','sinh'],opposed:['dong'],qualityEligible:true},
  {domain:'alchemy',preferred:['sinh','tinh'],allowed:['tu','duong'],opposed:['hoa'],qualityEligible:true},
  {domain:'alchemy',preferred:['loi','kich'],allowed:['phat','dong'],opposed:['liem'],qualityEligible:true}
 ];return profiles[Math.min(r,profiles.length-1)];
};
const forgingFire=(armor:boolean,r:number):RecipeFireProfile=>armor
 ?{domain:'forging',preferred:r>=5?['tran','duong_luyen']:['tran','hoa'],allowed:['binh','tinh'],opposed:['dong'],qualityEligible:true}
 :{domain:'forging',preferred:r>=5?['kich','phat']:['hoa','phat'],allowed:['tran','duong'],opposed:['liem'],qualityEligible:true};
for(let r=0;r<10;r++){
 RECIPES.push({id:`forge_weapon_${r}`,name:weaponNames[r],kind:'forging',minRealm:r,ingredients:[[ores[r][0],2+r],[jades[r][0],1],[`beast_${r}`,1],...(r>=4?[['boss_tan_tinh',1] as [string,number]]:[])],output:[`weapon_${r}`,1],lt:100+r*220,description:`Rèn pháp kiếm cấp ${realmName(r)}.`,fire:forgingFire(false,r)});
 RECIPES.push({id:`forge_armor_${r}`,name:armorNames[r],kind:'forging',minRealm:r,ingredients:[[ores[r][0],2+r],[herbs[r][0],1],[`beast_${r}`,1],...(r>=4?[['boss_tan_tinh',1] as [string,number]]:[])],output:[`armor_${r}`,1],lt:90+r*210,description:`Rèn hộ giáp cấp ${realmName(r)}.`,fire:forgingFire(true,r)});
 RECIPES.push({id:`cook_${r}`,name:foodNames[r],kind:'cooking',minRealm:r,ingredients:[[fish[r][0],1],[herbs[r][0],1]],output:[`food_${r}`,1],lt:25+r*70,description:`Chế biến linh thiện cấp ${realmName(r)}.`});
 if(r<9) RECIPES.push({id:`alchemy_${r}`,name:pillNames[r],kind:'alchemy',minRealm:r,ingredients:[[herbs[r][0],2],[jades[r][0],1],[`beast_${r}`,1]],output:[`pill_${r}`,1],lt:40+r*120,description:`Luyện đan hỗ trợ tu luyện ${realmName(r)}.`,fire:alchemyFire(r)});
}
RECIPES.push(
 {id:'storage_bag_1',name:'Khai Nang · Phàm Phẩm',kind:'forging',minRealm:0,ingredients:[['thanh_van_thiet',4],['bich_linh_ngoc',2],['thanh_linh_thao',2]],output:['bag_can_khon_pham',1],lt:800,description:'Thiên 《Càn Khôn Nang Chế Pháp》 mở không gian Phàm Phẩm; thất bại tiêu hao linh tài.',fire:forgingFire(true,0)},
 {id:'storage_bag_2',name:'Diễn Không · Linh Phẩm',kind:'forging',minRealm:1,ingredients:[['bag_can_khon_pham',1],['huyen_ngan',6],['van_van_ngoc',3],['huyet_nguyen_sam',3]],output:['bag_can_khon_linh',1],lt:4000,description:'Dùng một túi Phàm Phẩm rỗng, không trang bị làm Khí Phôi; thất bại hủy phôi.',fire:forgingFire(true,1)},
 {id:'storage_bag_3',name:'Diễn Không · Huyền Phẩm',kind:'forging',minRealm:2,ingredients:[['bag_can_khon_linh',1],['tu_kim',8],['tu_phu_tinh',4],['kim_tuy_chi',4]],output:['bag_can_khon_huyen',1],lt:14000,description:'Nâng đúng một phẩm từ Linh lên Huyền; không cho phép nhảy bậc.',fire:forgingFire(true,2)},
 {id:'storage_bag_4',name:'Diễn Không · Địa Phẩm',kind:'forging',minRealm:4,ingredients:[['bag_can_khon_huyen',1],['thai_am_tuy',10],['than_hon_tinh',5],['hoa_than_lien',5],['boss_tan_tinh',2]],output:['bag_can_khon_dia',1],lt:60000,description:'Nâng đúng một phẩm từ Huyền lên Địa; thất bại hủy Khí Phôi và phụ liệu.',fire:forgingFire(true,4)},
 {id:'storage_bag_5',name:'Diễn Không · Thiên Phẩm',kind:'forging',minRealm:6,ingredients:[['bag_can_khon_dia',1],['hon_nguyen_kim',12],['hop_the_tuy',6],['hop_dao_qua',6],['boss_tan_tinh',5]],output:['bag_can_khon_thien',1],lt:240000,description:'Nâng đúng một phẩm từ Địa lên Thiên; yêu cầu linh tài cao giai và không cho phép dùng túi đang trang bị.',fire:forgingFire(true,6)}
);

export const BOSSES:Boss[]=[
 {id:'boss_huyet_lang',name:'Huyết Nguyệt Lang Vương',minRealm:1,maxHp:12000,power:900,stamina:20,rewardLt:250,drop:'beast_1',dropQty:[1,2],description:'Lang vương thống lĩnh đàn yêu lang ở Hắc Phong sơn.'},
 {id:'boss_kim_giac',name:'Kim Giác Liệt Sơn Tê',minRealm:2,maxHp:40000,power:2200,stamina:24,rewardLt:600,drop:'beast_2',dropQty:[1,2],description:'Cự thú da như huyền kim, một sừng phá núi.'},
 {id:'boss_anh_ma',name:'U Minh Anh Ma',minRealm:3,maxHp:120000,power:5200,stamina:28,rewardLt:1400,drop:'beast_3',dropQty:[1,2],description:'Ma vật sinh từ oán niệm quanh U Minh Cổ Mộ.'},
 {id:'boss_than_tieu',name:'Thần Tiêu Lôi Bằng',minRealm:4,maxHp:320000,power:11000,stamina:32,rewardLt:3000,drop:'boss_tan_tinh',dropQty:[1,2],description:'Yêu bằng mang lôi quang, che phủ cả một vùng thiên không.'},
 {id:'boss_hu_khong',name:'Hư Không Cổ Thú',minRealm:5,maxHp:800000,power:23000,stamina:36,rewardLt:6500,drop:'beast_5',dropQty:[1,2],description:'Cổ thú xuyên qua khe hư không mà đến.'},
 {id:'boss_van_tuong',name:'Vạn Tượng Yêu Tôn',minRealm:6,maxHp:1800000,power:48000,stamina:40,rewardLt:13000,drop:'beast_6',dropQty:[1,2],description:'Yêu tôn có thể biến hóa vạn tượng.'},
 {id:'boss_dai_hoang',name:'Đại Hoang Cổ Long',minRealm:7,maxHp:4200000,power:95000,stamina:45,rewardLt:26000,drop:'beast_7',dropQty:[1,2],description:'Cổ long ngủ sâu trong Đại Hoang từ thời xa xưa.'},
 {id:'boss_cuu_kiep',name:'Cửu Kiếp Lôi Quân',minRealm:8,maxHp:9000000,power:180000,stamina:50,rewardLt:52000,drop:'beast_8',dropQty:[1,2],description:'Sinh linh kết tụ từ kiếp lôi, canh giữ con đường thành tiên.'}
];
export const SECRET_REALMS:SecretRealm[]=[];
for(let r=1;r<9;r++) SECRET_REALMS.push({id:`realm_${r}`,name:['','Thanh Vân Linh Cảnh','Kim Đan Huyền Phủ','U Minh Anh Điện','Thần Tiêu Cổ Cảnh','Hư Thiên Bí Phủ','Vạn Tượng Đạo Cung','Đại La Thiên Khư','Cửu Kiếp Tiên Môn'][r],minRealm:r,power:700*Math.pow(2,r),stamina:18+r*3,tuvi:120*r,drops:[{item:jades[r][0],min:1,max:2,weight:45},{item:ores[r][0],min:1,max:2,weight:35},{item:`beast_${r}`,min:1,max:1,weight:20}],description:`Bí cảnh dành cho tu sĩ ${realmName(r)} trở lên.`});

export const SHOP_OFFERS=[
 {item:'thanh_linh_thao',price:45},{item:'thanh_van_thiet',price:55},{item:'bich_linh_ngoc',price:70},{item:'food_0',price:180},{item:'pill_0',price:220}
] as const;
export const CPLT_OFFERS=[{item:'co_do_tan_phien',price:2},{item:'pill_2',price:5},{item:'food_3',price:4},{item:'boss_tan_tinh',price:8}] as const;
for(const o of SHOP_OFFERS) ITEMS[o.item].sources.push(S('shop','Nhất Phẩm Các · Tầng Một','Có thể mua với số lượng giới hạn; vật phẩm này vẫn có nguồn ngoài thế giới',0));

export function itemName(id:string){return ITEMS[id]?.name??id}
export function itemEmoji(id:string){return ITEMS[id]?.emoji??emojiText('special')}
export function itemByNameOrId(input:string){const id=resolveItemName(input);return id?ITEMS[id]??null:null}
export function recipeFor(itemId:string){return RECIPES.find(r=>r.output[0]===itemId)}

export function auditCatalog(){
 const errors:string[]=[...auditEmojiRegistry(),...auditItemNames(Object.keys(ITEMS))];
 const outputs=new Set(RECIPES.map(r=>r.output[0]));
 for(const i of Object.values(ITEMS)){
  if(!i.sources.length) errors.push(`${i.id}: không có nguồn`);
  if(i.sources.some(s=>s.minRealm<0||s.minRealm>=REALMS.length)) errors.push(`${i.id}: nguồn có cảnh giới không hợp lệ`);
  if(i.sources.some(s=>s.kind==='recipe')&&!outputs.has(i.id)) errors.push(`${i.id}: ghi nguồn chế tác nhưng không có công thức`);
 }
 for(const r of RECIPES){
  if(!ITEMS[r.output[0]])errors.push(`${r.id}: thành phẩm không tồn tại ${r.output[0]}`);
  for(const [x] of r.ingredients)if(!ITEMS[x])errors.push(`${r.id}: nguyên liệu không tồn tại ${x}`);
  if(r.minRealm<0||r.minRealm>=REALMS.length)errors.push(`${r.id}: cảnh giới không hợp lệ`);
  if(r.fire&&r.kind==='cooking')errors.push(`${r.id}: Linh Thiện không dùng RareFire resolver`);
  if(r.fire&&!r.fire.preferred.length)errors.push(`${r.id}: fire profile thiếu preferred trait`);
 }
 for(const [index,b] of STORAGE_TIERS.entries()){
  if(!ITEMS[b.itemId])errors.push(`storage tier ${b.tier}: item không tồn tại`);
  if(index&&STORAGE_TIERS[index-1].tier+1!==b.tier)errors.push(`storage tier ${b.tier}: chuỗi phẩm bị đứt`);
  if(index&&STORAGE_TIERS[index-1].capacity>=b.capacity)errors.push(`storage tier ${b.tier}: sức chứa không tăng`);
  if(index&&!RECIPES.some(r=>r.output[0]===b.itemId))errors.push(`storage tier ${b.tier}: thiếu Càn Khôn Nang Chế Pháp`);
 }
 for(const l of LOCATIONS){
  if(l.minRealm<0||l.minRealm>=REALMS.length)errors.push(`${l.id}: cảnh giới không hợp lệ`);
  for(const d of l.drops)if(!ITEMS[d.item])errors.push(`${l.id}: vật phẩm rơi không tồn tại ${d.item}`);
 }
 for(const b of BOSSES)if(!ITEMS[b.drop])errors.push(`${b.id}: chiến lợi phẩm không tồn tại ${b.drop}`);
 for(const s of SECRET_REALMS)for(const d of s.drops)if(!ITEMS[d.item])errors.push(`${s.id}: vật phẩm bí cảnh không tồn tại ${d.item}`);
 return errors;
}
