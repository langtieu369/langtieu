"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANOMALIES = exports.RARE_DUTIES = void 0;
exports.auditActivityCatalog = auditActivityCatalog;
const GameCatalog_1 = require("./GameCatalog");
exports.RARE_DUTIES = [
    { id: 'vo_danh_cuu_an', title: 'Vô Danh Cựu Án', trigger: c => c.confirmedFacts >= 2 && c.investigationClears >= 1, evidence: { required: 4, groups: { ho_so: 'Tàng thư Trấn Hải · hồ sơ niêm phong', nhan_chung: 'Hà Thượng Ngôn hoặc nhân chứng còn sống', di_vat: 'Vật chứng từ encounter cũ', dia_diem: 'Khảo sát hiện trường trên Thiên Hạ Đồ', doi_chieu: 'Tử Hà Các giám định chéo', thu_but: 'Cơ Duyên mở thư bút thất lạc' } }, reward: { lt: 12000, tuvi: 1800, cplt: 2, item: 'boss_tan_tinh' }, nodes: ['TIEP_NHAN', 'THU_THAP', 'DOI_CHIEU', 'KET_LUAN'] },
    { id: 'mach_nuoc_nguoc_dong', title: 'Mạch Nước Ngược Dòng', trigger: c => c.anomalyClears >= 1 && c.dutyTypes >= 4, reward: { lt: 9000, tuvi: 1400, cplt: 1, item: 'thai_am_tuy' }, nodes: ['DANH_DAU', 'TRUY_NGUON', 'TRAN_NHIEU', 'RESOLVED'] },
    { id: 'duoc_dien_khong_bong', title: 'Dược Điền Không Bóng', trigger: c => c.farmHarvests >= 10 && c.knowsDiemLinh, reward: { lt: 7500, tuvi: 1200, cplt: 0, item: 'hoa_than_lien' }, nodes: ['KIEM_THO', 'HO_SINH', 'TIM_CAN', 'RESOLVED'] },
    { id: 'tieng_chuong_duoi_dat', title: 'Tiếng Chuông Dưới Đất', trigger: c => c.secretRealmClears >= 3 && c.realmRank >= 3, reward: { lt: 11000, tuvi: 1700, cplt: 2, item: 'than_hon_tinh' }, nodes: ['LANG_NGHE', 'MO_LOI', 'CUU_VIEN', 'RESOLVED'] },
    { id: 'nguoi_gac_tram_cu', title: 'Người Gác Trạm Cũ', trigger: c => c.travelEntries >= 8 && c.sharedMemories >= 2, reward: { lt: 8200, tuvi: 1300, cplt: 0, item: 'hu_khong_sa' }, nodes: ['GAP_GO', 'HO_TONG', 'TRAO_THU', 'RESOLVED'] },
    { id: 'o_thu_khong_no', title: 'Ổ Thú Không Nở', trigger: c => c.hoSinhDone >= 3 && c.companionMet, reward: { lt: 9500, tuvi: 1500, cplt: 1, item: 'beast_4' }, nodes: ['QUAN_SAT', 'BAO_VE', 'TIM_THUOC', 'RESOLVED'] },
    { id: 'tam_tran_lac_vi', title: 'Tâm Trận Lạc Vị', trigger: c => c.tranNhieuDone >= 3 && c.craftLevel >= 2, reward: { lt: 10000, tuvi: 1600, cplt: 1, item: 'tu_phu_tinh' }, nodes: ['DO_TRUC', 'HIEP_TAC', 'HOAN_VI', 'RESOLVED'] },
    { id: 'thuyen_den_khong_nguoi', title: 'Thuyền Đèn Không Người', trigger: c => c.tamNhanDone >= 2 && c.worldEventContrib >= 2, reward: { lt: 13000, tuvi: 1900, cplt: 2, item: 'huyen_hai_long_tuy' }, nodes: ['THEO_DEN', 'TAM_NHAN', 'CHON_BEN', 'RESOLVED'] }
];
exports.ANOMALIES = [
    { id: 'loi_tich_son_dao', name: 'Lôi Tích Sơn Đạo', objective: 'tran_nhieu', reward: { lt: 2600, tuvi: 520, cplt: 1, item: 'cuu_kiep_loi_ngu' }, worldMerit: 1, encounters: ['Cột dẫn lôi lệch mạch', 'Tử Điện Báo mắc trong vòng sét', 'Khoáng tầng nứt sáng'] },
    { id: 'hoa_coc_ly_quang', name: 'Hỏa Cốc Ly Quang', objective: 'cuu_vien', reward: { lt: 2400, tuvi: 480, cplt: 1, item: 'hoa_tinh_tan_phien' }, worldMerit: 1, encounters: ['Dược đội kẹt giữa hỏa triều', 'Ly Hỏa tràn khỏi thạch khe', 'Ổ linh thú bị chia cắt'] },
    { id: 'vu_lien_nghich_trieu', name: 'Vụ Liên Nghịch Triều', objective: 'ho_tong', reward: { lt: 2200, tuvi: 450, cplt: 0, item: 'thai_am_tuy' }, worldMerit: 1, encounters: ['Sương triều đảo hướng', 'Thuyền dược mất mốc', 'Linh đăng bị nuốt sáng'] },
    { id: 'moc_mach_hoi_sinh', name: 'Mộc Mạch Hồi Sinh', objective: 'ho_sinh', reward: { lt: 2300, tuvi: 500, cplt: 0, item: 'hop_dao_qua' }, worldMerit: 1, encounters: ['Rễ cổ thụ đội đất', 'Bầy non rời ổ', 'Linh điền sinh trưởng quá mức'] }
];
for (const d of exports.RARE_DUTIES) {
    const item = d.reward.item && GameCatalog_1.ITEMS[d.reward.item], location = `Nghĩa vụ cực hiếm · ${d.title}`;
    if (item && !item.sources.some(x => x.kind === 'duty' && x.location === location))
        item.sources.push({ kind: 'duty', location, detail: 'Thưởng trực tiếp sau settlement có receipt; không rơi ngẫu nhiên ngoài nghĩa vụ.', minRealm: 0 });
}
for (const a of exports.ANOMALIES) {
    const item = GameCatalog_1.ITEMS[a.reward.item], location = `Dị Tượng · ${a.name}`;
    if (item && !item.sources.some(x => x.kind === 'duty' && x.location === location))
        item.sources.push({ kind: 'duty', location, detail: 'Hoàn thành đủ ba phân đoạn authored và quyết toán một lần.', minRealm: 0 });
}
function auditActivityCatalog() { const e = []; if (exports.RARE_DUTIES.length !== 8)
    e.push('rare duties != 8'); if (exports.ANOMALIES.length !== 4)
    e.push('anomalies != 4'); for (const d of exports.RARE_DUTIES) {
    if (!d.nodes.length || !d.reward.item)
        e.push(`${d.id}: incomplete`);
    if (d.reward.item && !GameCatalog_1.ITEMS[d.reward.item])
        e.push(`${d.id}: missing reward item ${d.reward.item}`);
} for (const a of exports.ANOMALIES)
    if (!GameCatalog_1.ITEMS[a.reward.item])
        e.push(`${a.id}: missing reward item ${a.reward.item}`); return e; }
