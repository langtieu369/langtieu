"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOURNEY_EDGES = exports.journeyRegistryById = exports.JOURNEY_REGISTRY = void 0;
exports.auditJourneyRegistry = auditJourneyRegistry;
const JourneyCatalog_1 = require("./JourneyCatalog");
const split = (s) => s.split(';').map(x => x.trim()).filter(Boolean);
const group = (family, prefix, titles, source = 'Cơ Duyên Master Ledger') => split(titles).map((title, i) => ({ id: `${prefix}${String(i + 1).padStart(2, '0')}`, version: 1, title, family, materialization: 'PLAYABLE', definitionRef: `${family}:${String(i + 1).padStart(2, '0')}`, source }));
const v2 = [['CD-LIFE-01', 'Một Tiếng Gọi Nhầm'], ['CD-MED-01', 'Người Ở Cuối Đường Núi'], ['CD-MED-02', 'Mắt Mờ, Tâm Tỏ'], ['CD-MED-03', 'Hai Lá Thư Về Núi'], ['CD-WARM-01', 'Mùa Hoa Nở Muộn'], ['CD-JOY-01', 'Ngày Hội Của Kẻ Đến Muộn'], ['CD-HOME-01', 'Bếp Lửa Cuối Đông'], ['CD-SAD-01', 'Chiếc Thuyền Trở Lại'], ['CD-LETTER-01', 'Một Lời Chưa Kịp Gửi'], ['CD-RESTORE-01', 'Mầm Cây Dưới Tro'], ['CD-WONDER-01', 'Tiếng Chuông Không Người Đánh'], ['CD-CHILD-01', 'Con Diều Trên Cổ Thụ'], ['CD-HISTORY-01', 'Tên Trên Bia Đã Mờ'], ['CD-COMMUNITY-01', 'Đèn Sáng Qua Ba Đêm'], ['CD-TRAVEL-01', 'Đường Về Qua Sáu Cột Mốc'], ['CD-SOCIAL-01', 'Ba Lần Gõ Cửa']];
exports.JOURNEY_REGISTRY = [
    ...group('ARTIFACT', 'ART', `Khuyết Môn Vô Đồ;Tinh Lạc Vô Phương;Hoa Tàn Hữu Tư;Nhất Tiền Lưỡng Văn;Dư Ôn Linh Vũ;Lân Hạ Cựu Minh`),
    ...group('TO_GIA_LANG_TIEU', 'TG', `Kiếm Khách Che Mắt;Bất Khí Nhất Nhân;Lục Lý Phá Thiên;Người Ta Nhớ Sai;Hóa Ra Là Ngươi;Nguyệt Chiếu Cố Nhân;Trên Mái Có Người;Bốn Nét Mực;Áo Trên Cành Lá;Không Để Tên;Tiểu Đạo Không Biết;Người Trong Gương;Một Tiếng Mẫn Chi;Xích Dực Cựu Ký;Tru Ma Dư Âm;Người Đã Chết, Người Còn Sống;Nhất Phẩm Cựu Trướng;Nhất Dạ Nguyệt Minh;Tinh Quy Hà Xứ;Thuận Đường;Cựu Phả Vô Toàn;Chiêu;Vẫn Là Lăng Tiêu;Tô Môn Cựu Sự;Xích Dực Sơ Minh;Người Muốn Gọi Cố Nhân Về;Hà Mính;Các Thành Nhân Tại;Hậu Nhân;Tiện Đường Tới Xem;Thương Mang Cựu Nhân;Tùng Hạc Vô Thư;Ta Nhớ;Ngươi Chưa Từng Nói;Tên Nào Cũng Được;Người Sau Đọc Chuyện Người Trước;Tiểu Chiêu Chiêu;Nhất Tự Chiêu;Tàng Võ Hữu Nhân;Sở Kiến Vị Tất Sở Tri;Nhất Diện Sở Kiến`, 'Cơ Duyên Production Registry · TG01–TG41'),
    { id: JourneyCatalog_1.MOON_NAME_JOURNEY_ID, version: 1, title: 'Gọi Tên Dưới Trăng', family: 'LT_LEGACY', materialization: 'PLAYABLE', definitionRef: 'JourneyCatalog:LT-LEGACY-MOON-NAME-01', source: 'Legacy Cơ Duyên restored 2026-09-27' },
    ...group('HOA_CHAN', 'HC', `Tiên Môn Sơ Phùng;Một Chiếc Dù;Sơn Trung Nhận Lộ;Kiếm Chỉ Nhất Thốn;Vân Gian Nhất Tịch;Kính Trung Phi Nhất Diện;Nhất Lô Vị Khởi;Trận Ngoại Nhất Bộ;Nhất Đại Khán Nhất Đại`),
    ...group('XICH_DUC', 'XD', `Một Trận Không Đánh;Sổ Không Ghi Hết;Người Đứng Sau Hàng Đầu;Ba Dấu Chân;Người Luôn Nói Không Sao;Một Trận Xem Lại;Ngoài Chiến Báo`),
    ...group('DIEM_LINH', 'DL', `Thanh Chi Vấn Lộ;Nhất Diệp Phi Dược;Dược Độc Nhất Niệm;Phong Trần Nhất Ngộ;Cố Cổ Tân Danh;Vạn Vật Hữu Tính;Nhất Tịch Vô Sự;Bất Tri Khả Học;Cộng Quan Nhất Vật;Cốc Trung Cựu Thoại`),
    ...group('VAN_LINH', 'VL', `Sơn Môn Hữu Khách;Nhất Nhật Công Khóa;Kinh Trung Hữu Nghi;Côn Hạ Tri Chỉ;Ngũ Chi Phi Ngũ Lộ;Chung Thanh Quá Sơn;Sơn Trung Vấn Thế`),
    ...group('LAC_TIEN_UYEN', 'LTU', `Uyên Ngoại Nhất Bi;Trận Ngoại Hữu Nhân;Nhất Uyên Lưỡng Ngôn;Uyên Trung Nhất Vấn;Cựu Vị Nhất Hương;Uyên Biên Vô Thanh`),
    ...group('BAT_VU', 'BV', `Sơn Lập Tại Ngôn;Nhất Bộ Bất Hồi;Diệp Tòng Phong Động;Phách Tòng Thân Sinh;Đao Bất Nhận Tính;Quy Đồ Hà Tại;Triều Hồi Đao Bất Hồi`),
    ...group('HUYEN_NGUYEN', 'HN', `Nhất Tâm Chúng Thế;Kỳ Động Trận Di;Khuyết Nhất Vị;Nhất Tâm Đồng Trận;Cựu Vị Vô Nhân`),
    ...group('MA_KIEM', 'MK', `Kiếm Bất Tại Danh;Hải Ngoại Hữu Sơn;Tầm Sinh Thường Nhật;Cực Phi Đế Vị;Danh Tại Cực Tiền;Tiểu Sự Phi Vô Sự;Cực Hậu Hữu Đảo;Quy Kiếm Hữu Nhật;Kiếm Vị Tại Tiên;Bạch Hồng Quá Hải;Khuyết Xứ Hữu Nhân;Nhất Kiếm Đương Quyết;Tứ Kiếm Phi Tứ Ảnh;Nhất Hạp Tứ Phong;Công Thủ Nhất Niệm;Nhất Nhật Vô Kiếm`, 'Cơ Duyên Production Registry · MK01–MK16'),
    ...group('PHU_DO', 'PD', `Nhất Thanh Phụ Tử;Hạ Vũ Miên Miên`),
    ...group('TONG_MON_TRUYEN_DUYEN', 'TM', `Khai Sơn Chi Nhật;Nhất Mộc Khai Sơn;Nhất Pháp Lưỡng Giải;Hữu Quyển Vô Nhân;Môn Tiền Hữu Lộ;Nền Đá Cũ;Nhất Khí Bất Thành Đan;Khô Mộc Sinh Nha;Hữu Hình Vô Sinh`),
    ...group('QILING_THANH_MINH', 'QM', `Thanh Âm Trong Gió;Nhất Thanh Hồi Đáp;Thanh Minh Sơ Tỉnh`),
    ...group('HE_TU_THUC_NGHE', 'HT', `Kình Qua Bất Lưu;Thạch Trung Hữu Tức;Vân Hành Bất Trú;Tứ Thời Đồng Quan;Khí Vô Định Chủ;Lô Trung Tam Biến;Nhất Lô Bất Đồng;Nhất Vị Nhân Gian;Hai Bát Cơm`),
    ...group('BI_CANH_KHAM_PHA', 'BC', `Thanh Khư Sơ Hành;Kính Trung Phi Ngã;Nhất Mộc Nhất Sinh;Mạch Hạ Hữu Thanh;Ngọc Tàng Phi Thạch;Thảo Mộc Hữu Thời;Triều Lai Triều Khứ;Hà Khởi Thiên Biến;Tinh Tán Hà Phương;Tinh Tòng Thiên Lạc`),
    ...group('ENGINE_AUTHORED', 'EA', `Nhật Mộ Độ Khẩu;Nhất Chén Trà;Hạ Đi, Thu Hàn;Vạn Năm Tinh Quang;Dưới Bóng Cây`),
    ...v2.map(([id, title]) => ({ id, version: 1, title, family: 'CATALOG_V2', materialization: 'PLAYABLE', definitionRef: `MasterLedger:${id}`, source: 'Cơ Duyên Master Ledger · Catalog V2' }))
];
const journeyRegistryById = (id) => exports.JOURNEY_REGISTRY.find(x => x.id === id);
exports.journeyRegistryById = journeyRegistryById;
const edges = (from, to, condition = 'canonical next', kind = 'OR') => to.split('/').filter(Boolean).map(x => ({ from, to: x, kind, condition }));
exports.JOURNEY_EDGES = [
    ...edges('TG01', 'TG05/TG14/TG15'), ...edges('TG02', 'TG13/TG17'), ...edges('TG03', 'TG14/TG16'), ...edges('TG04', 'TG25/TG32'), ...edges('TG05', 'TG06/TG17/TG24'), ...edges('TG06', 'TG26/TG30'), ...edges('TG07', 'TG23'), ...edges('TG08', 'TG21/TG31'), ...edges('TG09', 'TG23/TG29'), ...edges('TG10', 'TG12/TG14/TG25'), ...edges('TG11', 'TG23/TG40'), ...edges('TG12', 'TG16/TG24'), ...edges('TG13', 'TG27/TG30/TG38'), ...edges('TG14', 'TG15/TG20'), ...edges('TG15', 'TG16/TG24'), ...edges('TG16', 'TG22/TG30'), ...edges('TG17', 'TG18/TG28/TG31'), ...edges('TG18', 'TG19/TG33'), ...edges('TG19', 'TG23/TG34'), ...edges('TG20', 'TG29'), ...edges('TG21', 'TG31/TG34'), ...edges('TG22', 'TG27/TG35'), ...edges('TG23', 'TG40/TG41'), ...edges('TG24', 'TG31/TG34'), ...edges('TG25', 'TG14/TG15'), ...edges('TG26', 'TG27/TG30'), ...edges('TG27', 'TG22/TG35/TG37'), ...edges('TG28', 'TG29/TG31'), ...edges('TG29', 'TG40/TG41'), ...edges('TG30', 'TG23/TG40'), ...edges('TG31', 'TG34/TG41'), ...edges('TG32', 'TG21/TG31'), ...edges('TG33', 'TG23/TG40'), ...edges('TG34', 'TG36/TG40'), ...edges('TG35', 'TG41'), ...edges('TG36', 'TG41'), ...edges('TG37', 'TG22/TG35'), ...edges('TG38', 'TG22/TG36'), ...edges('TG39', 'TG24/TG36'), ...edges('TG40', 'TG41'),
    ...edges('MK01', 'MK04/MK09/MK10/MK11/MK12/MK15'), ...edges('MK04', 'MK05/MK06'), ...edges('MK05', 'MK07'), ...edges('MK06', 'MK07'), ...edges('MK07', 'MK08'), ...edges('MK09', 'MK13'), ...edges('MK10', 'MK13'), ...edges('MK11', 'MK13'), ...edges('MK12', 'MK13'), ...edges('MK13', 'MK14'), ...edges('QM01', 'QM02', 'stage receipt', 'SEQUENCE'), ...edges('QM02', 'QM03', 'three valid Linh Tích', 'SEQUENCE'), ...edges('CD-MED-01', 'CD-MED-02/CD-MED-03', 'relationship and world-state', 'OPTIONAL')
];
function auditJourneyRegistry() { const errors = []; const ids = new Set(), titles = new Set(); for (const e of exports.JOURNEY_REGISTRY) {
    if (ids.has(e.id))
        errors.push(`duplicate registry id ${e.id}`);
    if (titles.has(e.title))
        errors.push(`duplicate registry title ${e.title}`);
    ids.add(e.id);
    titles.add(e.title);
    if (!e.definitionRef || !e.source)
        errors.push(`missing provenance ${e.id}`);
} if (exports.JOURNEY_REGISTRY.length !== 169)
    errors.push(`expected 169 journeys, got ${exports.JOURNEY_REGISTRY.length}`); for (let i = 1; i <= 41; i++)
    if (!ids.has(`TG${String(i).padStart(2, '0')}`))
        errors.push(`missing TG${i}`); for (let i = 1; i <= 16; i++)
    if (!ids.has(`MK${String(i).padStart(2, '0')}`))
        errors.push(`missing MK${i}`); for (const e of exports.JOURNEY_EDGES) {
    if (!ids.has(e.from))
        errors.push(`edge unknown from ${e.from}`);
    if (!ids.has(e.to))
        errors.push(`edge unknown to ${e.to}`);
} return errors; }
