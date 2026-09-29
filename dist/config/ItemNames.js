"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITEM_NAMES = void 0;
exports.canonicalItemName = canonicalItemName;
exports.resolveItemName = resolveItemName;
exports.auditItemNames = auditItemNames;
/**
 * Nguồn duy nhất cho tên hiển thị của vật phẩm.
 * Đổi tên tại đây sẽ cập nhật shop, hành trang, reward, recipe, combat log và UI.
 * ID vật phẩm là khóa dữ liệu bất biến; tuyệt đối không dùng tên làm foreign key.
 */
exports.ITEM_NAMES = {
    thanh_van_thiet: 'Thanh Vân Thiết Sa', thanh_linh_thao: 'Thanh Linh Thảo', bich_linh_ngoc: 'Bích Linh Ngọc',
    huyen_ngan: 'Huyền Ngân Tinh', huyet_nguyen_sam: 'Huyết Nguyên Sâm', van_van_ngoc: 'Vân Văn Ngọc Tủy',
    tu_kim: 'Tử Kim Linh Khoáng', kim_tuy_chi: 'Kim Tủy Linh Chi', tu_phu_tinh: 'Tử Phủ Linh Tinh',
    dia_mach_tinh: 'Địa Mạch Huyền Tinh', anh_hon_hoa: 'Anh Hồn Hoa', nguyen_anh_phach: 'Nguyên Anh Hồn Phách',
    thai_am_tuy: 'Thái Âm Ngân Tủy', hoa_than_lien: 'Hóa Thần Thanh Liên', than_hon_tinh: 'Thần Hồn Tinh Phách',
    hu_khong_sa: 'Hư Không Tinh Sa', hu_linh_diep: 'Hư Linh Diệp', hu_khong_ngoc: 'Hư Không Ngọc Tâm',
    hon_nguyen_kim: 'Hỗn Nguyên Linh Kim', hop_dao_qua: 'Hợp Đạo Linh Quả', hop_the_tuy: 'Vạn Tượng Đạo Tủy',
    cuu_thien_thiet: 'Cửu Thiên Tinh Thiết', dai_la_tu_lien: 'Đại La Tử Liên', dai_thua_chau: 'Đại Thừa Thiên Châu',
    loi_kiep_kim: 'Lôi Kiếp Tiên Kim', cuu_kiep_lan: 'Cửu Kiếp Lôi Lan', kiep_loi_tam: 'Kiếp Lôi Đạo Tâm',
    tien_nguyen_thiet: 'Tiên Nguyên Thần Thiết', tien_ha_chi: 'Tiên Hà Ngọc Chi', tien_van_ngoc: 'Tiên Văn Ngọc Cốt',
    thanh_lan_ngu: 'Thanh Lân Ngư', bach_van_ngu: 'Bạch Vân Ngư', xich_vi_linh_ly: 'Xích Vĩ Linh Lý',
    ngoc_lan_ngu: 'Ngọc Lân Huyền Ngư', han_dam_tuyet_ngu: 'Hàn Đàm Tuyết Ngư', kim_si_long_ly: 'Kim Sí Long Lý',
    huyen_hai_long_tuy: 'Huyền Hải Long Tu', thai_hu_kinh: 'Thái Hư Linh Kình', cuu_kiep_loi_ngu: 'Cửu Kiếp Lôi Ngư',
    'tien_ha_ngoc_kình': 'Tiên Hà Ngọc Kình',
    beast_0: 'Thanh Nha Yêu Cốt', beast_1: 'Huyết Lang Nội Đan', beast_2: 'Kim Giác Yêu Tinh', beast_3: 'Anh Linh Thú Hạch',
    beast_4: 'Thần Hồn Yêu Tủy', beast_5: 'Hư Thiên Yêu Phách', beast_6: 'Vạn Tượng Thú Tâm', beast_7: 'Đại Hoang Cổ Huyết',
    beast_8: 'Cửu Kiếp Yêu Nguyên', beast_9: 'Tiên Thú Chân Huyết',
    weapon_0: 'Thanh Phong Linh Kiếm', weapon_1: 'Tử Vân Trúc Cơ Kiếm', weapon_2: 'Kim Đan Huyền Quang Kiếm',
    weapon_3: 'Anh Hồn Tàng Phong Kiếm', weapon_4: 'Thần Tiêu Hóa Thần Kiếm', weapon_5: 'Hư Thiên Đoạn Không Kiếm',
    weapon_6: 'Vạn Tượng Hợp Đạo Kiếm', weapon_7: 'Đại La Trấn Thiên Kiếm', weapon_8: 'Cửu Kiếp Vấn Thiên Kiếm', weapon_9: 'Phi Tiên Vô Cực Kiếm',
    armor_0: 'Thanh Vân Linh Y', armor_1: 'Huyền Ngân Trúc Cơ Bào', armor_2: 'Kim Tủy Huyền Giáp', armor_3: 'Anh Linh Hộ Hồn Y',
    armor_4: 'Thần Quang Hóa Hư Giáp', armor_5: 'Hư Thiên Vô Trần Bào', armor_6: 'Vạn Tượng Hợp Đạo Giáp',
    armor_7: 'Đại La Thiên Cương Y', armor_8: 'Cửu Kiếp Bất Diệt Giáp', armor_9: 'Phi Tiên Vô Cấu Tiên Y',
    pill_0: 'Thanh Linh Tụ Khí Đan', pill_1: 'Trúc Cơ Cố Nguyên Đan', pill_2: 'Kim Đan Ngưng Mạch Đan',
    pill_3: 'Nguyên Anh Dưỡng Hồn Đan', pill_4: 'Hóa Thần Tĩnh Tâm Đan', pill_5: 'Luyện Hư Phá Chướng Đan',
    pill_6: 'Hợp Thể Quy Nhất Đan', pill_7: 'Đại Thừa Thiên Cơ Đan', pill_8: 'Độ Kiếp Cửu Lôi Đan',
    food_0: 'Thanh Lân Dưỡng Khí Canh', food_1: 'Bạch Vân Linh Ngư Hấp', food_2: 'Xích Vĩ Hỏa Thiêu',
    food_3: 'Ngọc Lân Huyền Thiện', food_4: 'Hàn Đàm Ngưng Thần Canh', food_5: 'Kim Sí Long Lý Yến',
    food_6: 'Huyền Hải Long Tu Thiện', food_7: 'Thái Hư Kình Tủy Canh', food_8: 'Cửu Kiếp Lôi Ngư Yến', food_9: 'Tiên Hà Ngọc Kình Tiên Thiện',
    co_do_tan_phien: 'Thái Cổ Tàn Phiến', tranhai_lenh: 'Trấn Hải Công Lệnh', xichduc_lenh: 'Xích Dực Chiến Lệnh',
    boss_tan_tinh: 'Cường Địch Tàn Tinh', hoa_tinh_tan_phien: 'Hỏa Tinh Tàn Phiến',
    'MAT-HAT-MUA-MUON': 'Hạt Mùa Muộn', 'MAT-MANH-DEN-HOI': 'Mảnh Đèn Hội', 'SEED-XICH-DIEP': 'Hạt Xích Diệp',
    'MAT-NHAM-TAM-THAO': 'Nham Tâm Thảo', 'TOOL-DEN-TAM-DUNG': 'Đèn Tạm Dựng', 'MAT-THANH-TI': 'Thanh Ti',
    'PILL-HOI-KHI': 'Hồi Khí Đan', gia_truyen_kiem: 'Bảo Kiếm Gia Truyền', manh_ngoc_ho_menh: 'Mảnh Ngọc Hộ Mệnh',
    bag_hanh_nang: 'Hành Nang', bag_can_khon_pham: 'Túi Càn Khôn · Phàm Phẩm', bag_can_khon_linh: 'Túi Càn Khôn · Linh Phẩm',
    bag_can_khon_huyen: 'Túi Càn Khôn · Huyền Phẩm', bag_can_khon_dia: 'Túi Càn Khôn · Địa Phẩm', bag_can_khon_thien: 'Túi Càn Khôn · Thiên Phẩm',
};
function canonicalItemName(id, fallback) {
    return exports.ITEM_NAMES[id] ?? fallback ?? id;
}
const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('vi').trim();
const ALIASES = new Map();
for (const [id, name] of Object.entries(exports.ITEM_NAMES)) {
    ALIASES.set(normalize(id), id);
    ALIASES.set(normalize(name), id);
}
function resolveItemName(input) { return ALIASES.get(normalize(input)) ?? null; }
function auditItemNames(catalogIds) {
    const expected = new Set(catalogIds), actual = new Set(Object.keys(exports.ITEM_NAMES));
    const errors = [];
    for (const id of expected)
        if (!actual.has(id))
            errors.push(`${id}: thiếu tên trong ItemNames.ts`);
    for (const id of actual)
        if (!expected.has(id))
            errors.push(`${id}: tên mồ côi, không có item trong catalog`);
    const names = new Map();
    for (const [id, name] of Object.entries(exports.ITEM_NAMES)) {
        const key = normalize(name), prior = names.get(key);
        if (prior)
            errors.push(`${id}: trùng tên chuẩn hóa với ${prior}`);
        else
            names.set(key, id);
    }
    return errors;
}
