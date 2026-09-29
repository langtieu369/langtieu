export interface Background {
  id: string;
  name: string;
  emoji: string;
  description: string;
  intro: string;
  bonuses: Partial<{hp:number;atk:number;def:number;mp:number;crit:number;expRate:number;dropRate:number;speed:number;lt:number;knb:number}>;
  startingItem: {id:string;name:string;description:string}|null;
}
export interface Destiny {
  id:string; name:string; emoji:string; description:string; line:string;
  bonuses:Partial<{atkPercent:number;defPercent:number;hpPercent:number;crit:number;expRate:number;dropRate:number}>;
  penalties:Partial<{atkPercent:number;defPercent:number;hpPercent:number;crit:number}>;
}
export interface Heirloom {id:string;name:string;icon:string;description:string;effect:string}
export interface ComboBonus {backgroundId:string;element:string;skillName:string;skillDescription:string;skillEffect:string}

// Khôi phục từ creationLore.ts của bản gốc nientekou/tutienbl.
export const BACKGROUNDS:Background[]=[
 {id:'tu_chien_gia_toc',name:'Con Nhà Tu Chân',emoji:'🏯',description:'Sinh ra nơi tiên gia vọng tộc, căn cơ đã được nuôi dưỡng từ thuở lọt lòng.',intro:`Ngươi lớn lên giữa tiếng chuông sơn môn và mùi hương đan dược. Trong tiên phủ, kiếm quyết được học trước cả cách cầm bút, linh khí đã thấm vào từng hơi thở từ thuở còn thơ.
Trước ngày rời gia môn, phụ thân chỉ nói một câu:
"Kẻ mang họ tộc chỉ là xuất thân. Kẻ giữ được đạo tâm mới có thể một bước đăng đồ."
Mang theo thanh kiếm gia truyền, ngươi bước khỏi tiên phủ. Thiên địa mênh mang phía trước, từ hôm nay đều phải tự mình đi qua.`,bonuses:{hp:50,atk:5,lt:200},startingItem:{id:'gia_truyen_kiem',name:'Bảo Kiếm Gia Truyền',description:'Thanh kiếm đã theo 3 đời gia chủ. Tuy không phải thần khí, nhưng chứa đựng ý chí của tổ tiên.'}},
 {id:'phan_tran',name:'Kẻ Phàm Trần',emoji:'🌾',description:'Không tiên duyên, không chỗ dựa. Chỉ có một lòng nghịch mệnh.',intro:`Ngươi sinh ra giữa khói bếp và ruộng đồng, cả đời chưa từng chạm đến linh khí.
Cho đến một ngày, bầu trời xuất hiện linh quang, kinh mạch trong ngươi bừng tỉnh.
Người đời gọi đó là cơ duyên.
Ngươi gọi đó là lần đầu tiên số mệnh chịu mở mắt nhìn mình.
Không có sư môn, không có gia tộc. Chỉ có một con đường kéo dài đến tận cuối chân trời.`,bonuses:{expRate:10,lt:500,crit:2},startingItem:null},
 {id:'ky_ngo_sinh_tu',name:'Kỳ Ngộ Sinh Tử',emoji:'⚡',description:'Một lần chết hụt, đổi lấy một đoạn nhân quả không thuộc về mình.',intro:`Giữa ranh giới sinh tử, có người đã cứu ngươi.
Khi tỉnh dậy, động phủ chỉ còn một mảnh ngọc và một dòng chữ đã phai:
"Cứu ngươi vì nhân quả."
Linh căn tưởng đã tan vỡ lại được nối liền bằng một nguồn linh lực xa lạ.
Từ ngày ấy, trong người ngươi luôn tồn tại một khí tức không thuộc về chính mình.`,bonuses:{def:10,lt:1000},startingItem:{id:'manh_ngoc_ho_menh',name:'Mảnh Ngọc Hộ Mệnh',description:'Khi HP về 0, tự động hồi 50% HP. Hiệu ứng 1 lần.'}},
 {id:'de_tu_tan_tu',name:'Đệ Tử Tán Tu',emoji:'🍃',description:'Theo một tán tu học đạo, lấy thiên địa làm sư, lấy nhân gian làm sách.',intro:`Sư phụ chẳng có tông môn, cũng chẳng có danh hiệu.
Ông dạy ngươi nhận biết linh thảo trong khe núi, nhìn thiên tượng đoán linh triều, luyện một nồi đan còn quan trọng hơn thuộc một cuốn kiếm phổ.
Ngày ông rời đi, chỉ để lại một túi càn khôn cũ cùng một câu nói:
"Đừng học cách thành tiên. Học cách sống giữa thiên địa."
Thế là ngươi lên đường.`,bonuses:{speed:5,mp:30,lt:300},startingItem:{id:'sach_khai_kinh',name:'Sách Khai Kinh',description:'Dùng 1 lần: nhân đôi EXP nhận được trong 30 phút.'}},
];
export const DESTINIES:Destiny[]=[
 {id:'sat_tinh',name:'Sát Tinh',emoji:'⚔️',description:'Mệnh cách chủ sát, lấy chiến dưỡng đạo.',line:'“Một thân kiếm ý, lấy sát phạt mở một con đường tiến bước.”',bonuses:{atkPercent:3,crit:3},penalties:{hpPercent:5}},
 {id:'phuc_tinh',name:'Phúc Tinh',emoji:'🍀',description:'Mệnh cách tụ phúc, cơ duyên thường tự tìm đến',line:'“Thiên địa có nhân quả, phúc duyên chỉ đến với người biết chờ.”',bonuses:{expRate:5,dropRate:10},penalties:{defPercent:3}},
 {id:'tho_tinh',name:'Thọ Tinh',emoji:'🐢',description:'Mệnh cách trường sinh, lấy thời gian thắng thiên địa.',line:'“Ngàn năm cũng chỉ là một lần hít thở với kẻ giữ được đạo tâm.”',bonuses:{hpPercent:10,defPercent:5},penalties:{atkPercent:3}},
];
export const COMBO_BONUSES:ComboBonus[]=[
 {backgroundId:'tu_chien_gia_toc',element:'Hỏa',skillName:'Xích Viêm Kiếm Ý',skillDescription:'Kiếm thế nhiễm Hỏa, tăng uy lực hệ Hỏa.',skillEffect:'{"type":"elemental_atk","element":"fire","bonus":0.1}'},
 {backgroundId:'tu_chien_gia_toc',element:'Lôi',skillName:'Kinh Lôi Nhất Trảm',skillDescription:'Kiếm ý mang lôi đình, có cơ hội làm đối phương chậm một nhịp.',skillEffect:'{"type":"stun","chance":0.2,"duration":1}'},
 {backgroundId:'phan_tran',element:'Thổ',skillName:'Hậu Thổ Ngưng Thân',skillDescription:'Lấy Thổ khí dưỡng thân, tăng né tránh.',skillEffect:'{"type":"stat_buff","stat":"dodge","value":0.05}'},
 {backgroundId:'phan_tran',element:'Mộc',skillName:'Thanh Mộc Sinh Cơ',skillDescription:'Mộc khí không dứt, sinh cơ tự hồi.',skillEffect:'{"type":"regen","value":0.02}'},
 {backgroundId:'ky_ngo_sinh_tu',element:'Thủy',skillName:'Linh Tuyền Dưỡng Mạch',skillDescription:'Dẫn Thủy linh khí dưỡng mạch.',skillEffect:'{"type":"regen","value":0.05}'},
 {backgroundId:'ky_ngo_sinh_tu',element:'Lôi',skillName:'Thiên Lôi Hộ Mạch',skillDescription:'Lôi ý hộ thân, phản lại một phần uy lực.',skillEffect:'{"type":"reflect","value":0.05}'},
 {backgroundId:'de_tu_tan_tu',element:'Thủy',skillName:'Linh Đan Tụ Hiệu',skillDescription:'Tinh thông dược lý, tăng hiệu quả đan dược.',skillEffect:'{"type":"potion_boost","value":0.15}'},
 {backgroundId:'de_tu_tan_tu',element:'Hỏa',skillName:'Xích Hỏa Luyện Đan',skillDescription:'Hỏa linh tương trợ đan đạo.',skillEffect:'{"type":"craft_boost","skill":"alchemy","value":0.1}'},
 {backgroundId:'ky_ngo_sinh_tu',element:'Phong',skillName:'Vô Ảnh Phong Hành',skillDescription:'Thân theo gió chuyển, tăng tốc độ.',skillEffect:'{"type":"stat_buff","stat":"speed","value":0.05}'},
 {backgroundId:'de_tu_tan_tu',element:'Phong',skillName:'Ngự Phong Độn Hành',skillDescription:'Mượn Phong khí giảm tiêu hao thể lực.',skillEffect:'{"type":"stamina_save","value":0.1}'},
];
export const HEIRLOOMS:Heirloom[]=[
 {id:'co_kiem_tan_van',name:'Tàn Văn Cổ Kiếm',icon:'🗡️',description:'Một đoạn kiếm văn cổ đã mờ, không rõ xuất xứ.',effect:'+1% ATK'},
 {id:'ngoc_tam_vo_danh',name:'Vô Danh Cổ Ngọc',icon:'💠',description:'Cổ ngọc ấm lên khi linh khí tụ gần.',effect:'+1% Tu Vi'},
 {id:'long_vu_phuong_hoang',name:'Phượng Linh Vũ',icon:'🪶',description:'Linh vũ lưu chuyển một tia hỏa quang nhàn nhạt.',effect:'+1% Speed'},
 {id:'vay_rong_den',name:'Nghịch Lân Cổ Long',icon:'🐉',description:'Một mảnh nghịch lân lưu lại tia long tức rất nhạt.',effect:'+1% DEF'},
];
const ELEMENTS=['Kim','Mộc','Thủy','Hỏa','Thổ','Lôi','Phong'] as const;
export function generateLinhCan(){const values:Record<string,number>={};for(const e of ELEMENTS)values[e]=Math.floor(Math.random()*96)+5;return values}
export function mainLinhCan(lc:Record<string,number>){return Object.entries(lc).sort((a,b)=>b[1]-a[1])[0]}
export function linhCanGrade(v:number){return v>=90?'Thiên':v>=70?'Địa':v>=40?'Nhân':'Tạp'}
export function getLinhCanFlavorText(element:string,percent?:number){
 const flavors:Record<string,string[]>={
  Kim:['Kim khí sắc bén, như tiếng kiếm ngân trong thức hải.','Một luồng Kim linh men theo kinh mạch, lạnh và sắc như phong mang vừa rời vỏ.','Kim ý tụ lại trong đan điền, phảng phất tiếng kim thiết va nhau giữa tĩnh lặng.'],
  Hỏa:['Hỏa linh trong đan điền bừng cháy như một vầng dương chưa mọc.','Kinh mạch nóng rực, linh khí hệ Hỏa tựa dung nham chảy qua huyết mạch.','Một tia hỏa ý vừa thức tỉnh, dường như chỉ chờ ngày thiêu rụi cửu tiêu.'],
  Thủy:['Linh khí chảy như thủy triều, tĩnh lặng nhưng sâu không thấy đáy.','Trong cơ thể vang lên tiếng nước nhỏ giọt từ vực sâu xa xăm.','Thủy linh ôn hòa bao phủ kinh mạch, tựa biển lớn nuôi dưỡng vạn vật.'],
  Mộc:['Một sợi mộc ý bén rễ trong đan điền, tựa mầm non xuyên qua đá cứng.','Linh khí Mộc lan dọc kinh mạch, mang theo hơi thở của cổ lâm ngàn năm.','Trong huyết mạch phảng phất mùi cỏ cây sau cơn mưa, sinh cơ lặng lẽ nảy nở.'],
  Thổ:['Thổ linh trầm xuống đan điền như một ngọn núi cắm rễ giữa thiên địa.','Linh khí Thổ dày nặng mà ôn hòa, từng tấc kinh mạch đều trở nên vững chãi.','Ngươi cảm nhận được nhịp thở của đại địa, tựa khoáng mạch ngủ yên dưới Hoang Sơn.'],
  Lôi:['Một tiếng lôi minh vang lên trong đan điền.','Lôi ý chưa thành hình nhưng đã khiến linh khí quanh người rung chuyển.','Từng tia điện tím lướt qua kinh mạch, như thiên kiếp còn sót lại.'],
  Phong:['Phong linh vô hình, nhưng từng hơi thở đều trở nên nhẹ hơn.','Gió luồn qua kinh mạch, mang theo cảm giác tự do khó nắm bắt.','Linh khí hệ Phong tựa mây trôi, không hình không tướng.']
 };
 const options=flavors[element]||['Linh căn của ngươi chứa một nguồn năng lượng bí ẩn.'];
 return options[Math.floor(Math.random()*options.length)];
}
export function generateHeirloom(){return HEIRLOOMS[Math.floor(Math.random()*HEIRLOOMS.length)]}
export function findCombo(backgroundId:string,element:string){return COMBO_BONUSES.find(x=>x.backgroundId===backgroundId&&x.element===element)||null}
export function generateProphecy(backgroundId:string,destinyId:string,element:string){const bg:Record<string,Record<string,string>>={tu_chien_gia_toc:{phuc_tinh:'Tiên phủ còn hưng, một mạch truyền ba đời.',sat_tinh:'Kiếm chỉ huyết thân, gia môn gặp kiếp.',tho_tinh:'Rời tiên phủ, giữ một đời vô danh.'},phan_tran:{phuc_tinh:'Cỏ dại cũng có ngày hóa linh mộc.',sat_tinh:'Một thân phàm cốt, dám nghịch thiên mệnh.',tho_tinh:'Đại đạo vô danh, người đời chẳng nhớ.'},de_tu_tan_tu:{phuc_tinh:'Trời đất rộng dài, gặp thời ắt dựng nghiệp.',sat_tinh:'Sát khí nhập mệnh, một đời khó tránh phong ba.',tho_tinh:'Mây bay bốn hướng, chẳng ai biết người về đâu.'},ky_ngo_sinh_tu:{phuc_tinh:'Nhân quả chưa dứt, hậu vận tự có cơ duyên.',sat_tinh:'Một niệm phá cục, đường về vạn dặm xa.',tho_tinh:'Núi sâu chẳng hỏi thế sự, một đời giữ mình tu hành.'}};const suffix:Record<string,string>={Kim:'Bách luyện thành cương, một kiếm phá vạn pháp.',Mộc:'Một hạt sinh căn, ngày sau ắt thành đại mộc.',Thủy:'Nước theo thế mà chảy, người theo đạo mà hành.',Hỏa:'Một đốm linh hỏa, cũng đủ soi rọi cửu thiên.',Thổ:'Đất dày mới tải được vạn vật, đường xa mới biết căn cơ.',Lôi:'Thiên lôi giáng thế, mệnh này khó bình phàm.',Phong:'Gió đến chẳng báo trước, một đời khó chịu trói buộc.'};const pool=['Thiên mệnh đã định, lòng người chưa chắc.','Đường dài vạn dặm, một bước cũng phải tự mình đi.','Mệnh có thể định, số lại do người.','Một đời cầu đạo, cuối cùng cầu lại chính mình.','Nếu đã bước lên con đường này, hà tất hỏi ngày về.'];return `${bg[backgroundId]?.[destinyId]||'Mệnh trời vô định, hành trình vô tận.'}\n${suffix[element]||'Linh khí mờ ảo.'}\n${pool[Math.floor(Math.random()*pool.length)]}`}
