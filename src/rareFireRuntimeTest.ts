import {initDatabase} from './database/database';
import db from './database/database';
import {auditRareFireCatalog,RARE_FIRES,RecipeFireProfile} from './config/RareFireCatalog';
import {ITEMS,RECIPES,auditCatalog} from './config/GameCatalog';
import {applyFireQuality,qualityBand,resolveRareFire} from './services/RareFireResolver';
import {rareFireService} from './services/RareFireService';
import {userRepository} from './database/repositories/UserRepository';
import {inventoryRepository} from './database/repositories/InventoryRepository';
import {craftingService} from './services/CraftingService';

let passed=0;
function ok(condition:unknown,message:string){if(!condition)throw new Error(`FAIL: ${message}`);passed++}
function close(actual:number,expected:number,tolerance:number,message:string){ok(Math.abs(actual-expected)<=tolerance,`${message}: ${actual} != ${expected} ±${tolerance}`)}

function lcg(seed:number){let s=seed>>>0;return()=>((s=Math.imul(1664525,s)+1013904223>>>0)/4294967296)}
function gaussian(rand:()=>number){const u=Math.max(Number.EPSILON,rand()),v=Math.max(Number.EPSILON,rand());return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}

function simulation(){
 const rand=lcg(52047),n=100000,profiles:[string,number,number][]=[['novice',58,8],['adept',72,7],['expert',84,5]];
 const out:Record<string,{basePeak:number;matchedPeak:number;doubleJump:number}>={};
 const order=['fail','standard','fine','excellent','peak'];
 for(const [name,mean,sd] of profiles){let basePeak=0,matchedPeak=0,doubleJump=0;
  for(let i=0;i<n;i++){const base=Math.max(0,Math.min(100,mean+gaussian(rand)*sd));const before=qualityBand(base),after=qualityBand(Math.min(100,base+4));basePeak+=before==='peak'?1:0;matchedPeak+=after==='peak'?1:0;doubleJump+=order.indexOf(after)-order.indexOf(before)>1?1:0}
  out[name]={basePeak:basePeak/n,matchedPeak:matchedPeak/n,doubleJump};
 }
 close(out.expert.basePeak,.116,.012,'Expert Phàm Hỏa Peak');
 close(out.expert.matchedPeak,.345,.018,'Expert Đồng Tính Peak');
 ok(out.expert.matchedPeak<.40,'Dị Hỏa không được bảo đảm Peak');
 ok(Object.values(out).every(x=>x.doubleJump===0),'Không được nhảy quá một quality band');
 return out;
}

function run(){
 ok(auditRareFireCatalog().length===0,'Rare Fire catalog integrity');
 ok(auditCatalog().length===0,'Game catalog integrity sau khi tích hợp Dị Hỏa');
 ok(RARE_FIRES.length===6,'Có đúng sáu Dị Hỏa canon');
 ok(RECIPES.filter(r=>r.kind==='alchemy'||r.kind==='forging').every(r=>!!r.fire),'Mọi recipe Đan/Khí seed có fire profile');
 ok(!!ITEMS.hoa_tinh_tan_phien,'Hỏa Tinh Tàn Phiến tồn tại');
 ok(!Object.keys(ITEMS).some(x=>x==='material_rare_fire_shard'),'Không giữ active ID Mảnh Dị Hỏa cũ');

 const gather:RecipeFireProfile={domain:'alchemy',preferred:['tu','sinh'],allowed:['binh'],opposed:['phat'],qualityEligible:true};
 const matched=resolveRareFire('thanh_lien_tam_hoa',gather,'hop_dung');
 ok(matched.compatibility==='dong_tinh','Thanh Liên Đồng Tính với Tụ/Sinh');
 ok(matched.qualityModifier===4,'Quality sub-cap Đồng Tính là +4');
 ok(matched.specialtyBudget===10,'Hợp Dụng mở đủ specialty budget');
 const adverse=resolveRareFire('xich_duong_ly_hoa',gather,'hop_dung');
 ok(adverse.compatibility==='nghich_tinh','Xích Dương Nghịch Tính với quy trình Tụ/Sinh có Phát đối nghịch');
 ok(adverse.qualityModifier===-6,'Nghịch Tính dùng sub-cap -6');
 ok(adverse.difficultyModifier>0,'Nghịch Tính phải tăng, không được làm giảm yêu cầu kiểm soát');
 ok(!resolveRareFire('khong_ton_tai',gather).allowed,'Fire ID giả bị chặn');
 ok(applyFireQuality(89,matched).band==='peak','89 + Đồng Tính có thể chạm Peak');
 ok(applyFireQuality(50,matched).band==='standard','Dị Hỏa không nâng người dùng yếu vượt nhiều band');
 const sim=simulation();

 initDatabase();
 const uid='__rare_fire_runtime_test__';
 db.prepare('DELETE FROM users WHERE discord_id=?').run(uid);
 userRepository.create(uid,'Rare Fire Test');userRepository.update(uid,{level:550,coin_ha_pham:999999});
 const acquired=rareFireService.acquire(uid,'thanh_lien_tam_hoa','runtime:test:van_lien_khai',1700000000);ok(acquired.ok,'Acquisition hợp lệ');
 ok(!rareFireService.acquire(uid,'thanh_lien_tam_hoa','runtime:duplicate').ok,'Duplicate acquisition bị chặn');
 ok(!rareFireService.acquire(uid,'xich_duong_ly_hoa',' ').ok,'Provenance rỗng bị chặn');
 ok(!rareFireService.canUse(uid,'thanh_lien_tam_hoa'),'Chưa an trí thì không được dùng');
 ok(rareFireService.place(uid,'thanh_lien_tam_hoa','test_fire_slot').ok,'An trí Hỏa Vị thành công');
 ok(rareFireService.canUse(uid,'thanh_lien_tam_hoa'),'An trí xong được phép dùng');
 ok(rareFireService.setMastery(uid,'thanh_lien_tam_hoa','hop_dung'),'Cập nhật mastery hợp lệ');
 ok(!craftingService.craft(uid,'cook_0','thanh_lien_tam_hoa').ok,'Không thể lách Dị Hỏa vào recipe không hỗ trợ');

 const recipe=RECIPES.find(r=>r.id==='alchemy_0')!;
 for(const [id,q] of recipe.ingredients)inventoryRepository.add(uid,id,q);
 const crafted=craftingService.craft(uid,recipe.id,'thanh_lien_tam_hoa',0);ok(crafted.ok,'Crafting runtime với Dị Hỏa thành công');
 const log=db.prepare('SELECT * FROM rare_fire_process_log WHERE user_id=? ORDER BY id DESC LIMIT 1').get(uid) as any;
 ok(log?.fire_id==='thanh_lien_tam_hoa','Process log giữ provenance fire');
 ok(log?.final_score-log?.base_score<=4,'Runtime giữ Quality sub-cap');
 const output=db.prepare('SELECT * FROM crafted_outputs WHERE process_id=?').get(log.id) as any;
 ok(output?.fire_id==='thanh_lien_tam_hoa'&&output?.quality_band===log.quality_band,'Đầu ra lưu bền vững phẩm chất và provenance Dị Hỏa');
 rareFireService.unplace(uid,'thanh_lien_tam_hoa');ok(!rareFireService.canUse(uid,'thanh_lien_tam_hoa'),'Tháo Hỏa Vị không mất ownership nhưng chặn sử dụng');
 ok(rareFireService.owns(uid,'thanh_lien_tam_hoa'),'Ownership còn sau unplace');
 db.prepare('DELETE FROM users WHERE discord_id=?').run(uid);

 console.log(`✅ Dị Hỏa runtime: ${passed} assertions PASS`);
 console.log(`✅ A43: Expert Peak ${Math.round(sim.expert.basePeak*1000)/10}% → ${Math.round(sim.expert.matchedPeak*1000)/10}%; double-band jump = 0`);
}

try{run()}catch(error){console.error(error);process.exit(1)}
