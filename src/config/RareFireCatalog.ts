export type FireTrait='binh'|'tu'|'sinh'|'phat'|'hoa'|'han'|'liem'|'tinh'|'loi'|'kich'|'dong'|'tran'|'duong'|'duong_luyen';
export type FireMastery='so_dan'|'thuan_hoa'|'tri_tinh'|'hop_dung';
export type FireCompatibility='dong_tinh'|'thuan_tinh'|'kha_dung'|'nghich_tinh'|'cam_dung';
export type FireDomain='alchemy'|'forging';

export interface RareFireDefinition{
 id:string;name:string;nature:FireTrait[];
 origin:{location:string;encounter:string;trigger:string;retry:string};
 specialties:{alchemy:string[];forging:string[]};
 controlCost:number;provenanceRequired:true;tradable:false;
}

export interface RecipeFireProfile{
 preferred:FireTrait[];allowed?:FireTrait[];opposed?:FireTrait[];forbidden?:FireTrait[];
 domain:FireDomain;qualityEligible?:boolean;
}

export const RARE_FIRES:readonly RareFireDefinition[]=[
 {id:'thanh_lien_tam_hoa',name:'Thanh Liên Tâm Hỏa',nature:['binh','tu','sinh'],origin:{location:'Triều Sinh Vạn Tượng · Liên Tâm Hồ',encounter:'Vạn Liên Khai',trigger:'Nhận biết Liên Tâm Hỏa Tức khi Vạn Liên Khai hoạt động.',retry:'Giữ dấu vết và ổn định ba điểm Liên Tức để dự đoán kỳ mở kế.'},specialties:{alchemy:['quality','condensation_stability','material_loss'],forging:['fine_inscription']},controlCost:0,provenanceRequired:true,tradable:false},
 {id:'xich_duong_ly_hoa',name:'Xích Dương Ly Hỏa',nature:['phat','hoa','duong'],origin:{location:'Mạc Lĩnh · Hỏa Cốc',encounter:'Ly Hỏa Phân Tầng',trigger:'Điều tra hai hỏa khẩu và phân biệt Ly Hỏa với địa hỏa.',retry:'Dùng bản ghi hỏa mạch mở lại tuyến; không đổi chiến công lấy Dị Hỏa.'},specialties:{alchemy:['potency','transformation'],forging:['hard_material','transformation']},controlCost:4,provenanceRequired:true,tradable:false},
 {id:'han_u_minh_hoa',name:'Hàn U Minh Hỏa',nature:['han','liem','tinh'],origin:{location:'Hoang Sơn',encounter:'U Tuyết Cảnh Biến',trigger:'Phân biệt Minh Hỏa đang liễm với Hàn Tức tự nhiên.',retry:'Ghi nhận Hàn Tức ở ba điều kiện thiên thời để mở nhánh nhận biết.'},specialties:{alchemy:['purification','yin_cold_stability'],forging:['cold_jade','impurity_removal']},controlCost:2,provenanceRequired:true,tradable:false},
 {id:'tu_tieu_loi_hoa',name:'Tử Tiêu Lôi Hỏa',nature:['loi','kich','phat','dong'],origin:{location:'Lôi Vực · Bát Đại Bí Cảnh',encounter:'Tam Lôi Nhãn',trigger:'Ổn định ba Lôi Nhãn theo đúng thứ tự dấu vết.',retry:'Dùng Lôi Văn tái dựng thứ tự; Lôi Văn không ghép thành Dị Hỏa.'},specialties:{alchemy:['channel_stimulation'],forging:['qi_channel_activation','lightning_array_tool']},controlCost:8,provenanceRequired:true,tradable:false},
 {id:'dia_tam_huyen_viem',name:'Địa Tâm Huyền Viêm',nature:['tran','hoa','duong_luyen'],origin:{location:'Địa Sinh Vạn Khoáng · Địa Tâm Phúc Địa',encounter:'Hỏa Khẩu Dưỡng Khoáng',trigger:'Bảo tồn cân bằng khoáng–hỏa tại hỏa khẩu.',retry:'Khôi phục ba hỏa khẩu suy yếu để mở lại Khế Hỏa.'},specialties:{alchemy:['long_process_stability'],forging:['high_grade_mineral','layered_structure']},controlCost:1,provenanceRequired:true,tradable:false},
 {id:'phu_tang_kim_diem',name:'Phù Tang Kim Diễm',nature:['duong','sinh','tinh'],origin:{location:'Đông Lăng · Cổ Thụ',encounter:'Phù Tang Cựu Tích',trigger:'Khôi phục quan hệ giữa cổ thụ, vật mang và Kim Diễm.',retry:'Mở nhánh khác bằng tri thức Cổ Vật, Đan Tu hoặc Khí Tu; không thể cưỡng đoạt.'},specialties:{alchemy:['rare_medicine_restoration'],forging:['artifact_restoration','spiritual_seed']},controlCost:5,provenanceRequired:true,tradable:false}
] as const;

export const RARE_FIRE_BY_ID:Readonly<Record<string,RareFireDefinition>>=Object.freeze(Object.fromEntries(RARE_FIRES.map(f=>[f.id,f])));

export function auditRareFireCatalog(){
 const errors:string[]=[];const ids=new Set<string>();const names=new Set<string>();
 for(const f of RARE_FIRES){
  if(ids.has(f.id))errors.push(`${f.id}: trùng id`);ids.add(f.id);
  if(names.has(f.name))errors.push(`${f.id}: trùng tên`);names.add(f.name);
  if(!f.nature.length)errors.push(`${f.id}: thiếu Bản Tính`);
  if(!f.origin.location||!f.origin.encounter||!f.origin.trigger||!f.origin.retry)errors.push(`${f.id}: acquisition chưa khép kín`);
  if(!f.specialties.alchemy.length&&!f.specialties.forging.length)errors.push(`${f.id}: không có consumer`);
  if(f.tradable!==false)errors.push(`${f.id}: Dị Hỏa không được giao dịch`);
 }
 return errors;
}
