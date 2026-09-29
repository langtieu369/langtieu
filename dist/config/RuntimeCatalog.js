"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_SCHEDULE = exports.QILING_NAMES = exports.QILING_STAGES = exports.COMPANIONS = exports.DUTY_TYPES = exports.SECT_ROLES = exports.SECTS = void 0;
exports.auditRuntimeCatalog = auditRuntimeCatalog;
exports.SECTS = [
    { id: 'hoa_chan', name: 'Hoa Chân', outer: true }, { id: 'bat_vu_son', name: 'Bất Vu Sơn', outer: true }, { id: 'huyen_nguyen', name: 'Huyền Nguyên', outer: true }, { id: 'phu_do_cung', name: 'Phù Đồ Cung', outer: false }, { id: 'diem_linh_coc', name: 'Diễm Linh Cốc', outer: true }, { id: 'ma_kiem_tong', name: 'Ma Kiếm Tông', outer: true }, { id: 'van_linh', name: 'Vạn Linh', outer: false }
];
exports.SECT_ROLES = [{ id: 'ngoai_mon', name: 'Ngoại Môn', min: 0, learn: false }, { id: 'noi_mon', name: 'Nội Môn', min: 300, learn: true }, { id: 'than_truyen', name: 'Thân Truyền', min: 1200, learn: true }, { id: 'chan_truyen', name: 'Chân Truyền', min: 3500, learn: true }];
exports.DUTY_TYPES = [['tuan_tra', 'Tuần tra'], ['ho_tong', 'Hộ tống'], ['cuu_vien', 'Cứu viện'], ['dieu_tra', 'Điều tra'], ['tam_nhan', 'Tầm nhân'], ['ho_sinh', 'Hộ sinh'], ['tran_nhieu', 'Trấn nhiễu'], ['hiep_tac', 'Hiệp tác']];
exports.COMPANIONS = [{ id: 'thanh_moc_ly', name: 'Thanh Mộc Ly', kind: 'pet', element: 'Mộc', rarity: 'linh', source: 'Cơ Duyên · Mầm Cây Dưới Tro' }, { id: 'xich_vu_ung', name: 'Xích Vũ Ưng', kind: 'pet', element: 'Hỏa', rarity: 'huyen', source: 'Hung Thú Phá Giới · Mạc Lĩnh' }, { id: 'van_giac_loc', name: 'Vân Giác Lộc', kind: 'mount', element: 'Phong', rarity: 'linh', source: 'Trấn Hải Công Huân Khố' }, { id: 'huyen_lan_cau', name: 'Huyền Lan Câu', kind: 'mount', element: 'Thủy', rarity: 'huyen', source: 'Bí Cảnh · Huyền Hải' }];
exports.QILING_STAGES = ['LINH_CO', 'TRAM_TICH', 'TIEM_TANG', 'THUC_TINH'];
exports.QILING_NAMES = { LINH_CO: 'Linh Cơ', TRAM_TICH: 'Trầm Tịch', TIEM_TANG: 'Tiềm Tàng', THUC_TINH: 'Thức Tỉnh' };
exports.EVENT_SCHEDULE = [{ type: 'DAI_YEU', name: 'Đại Yêu Hoành Thế', days: [1, 2, 3, 4, 5], hour: 20, duration: 60 }, { type: 'PHA_GIOI', name: 'Hung Thú Phá Giới', days: [6], hour: 20, duration: 90 }, { type: 'QUAN_HUNG', name: 'Quần Hùng Tranh Phong', days: [0, 1, 2, 3, 4, 5, 6], hour: 16, duration: 480 }];
function auditRuntimeCatalog() { const e = []; if (exports.SECTS.length !== 7 || new Set(exports.SECTS.map(x => x.id)).size !== 7)
    e.push('Thất Đại catalog sai'); if (exports.DUTY_TYPES.length !== 8)
    e.push('Nghĩa Vụ không đủ tám loại'); if (exports.QILING_STAGES.join('>') !== 'LINH_CO>TRAM_TICH>TIEM_TANG>THUC_TINH')
    e.push('Chuỗi Khí Linh sai'); return e; }
