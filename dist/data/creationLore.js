"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CREATION_PROLOGUE = exports.HEIRLOOMS = exports.COMBO_BONUSES = exports.DESTINIES = exports.BACKGROUNDS = void 0;
exports.generateLinhCan = generateLinhCan;
exports.mainLinhCan = mainLinhCan;
exports.linhCanGrade = linhCanGrade;
exports.getLinhCanFlavorText = getLinhCanFlavorText;
exports.generateHeirloom = generateHeirloom;
exports.findCombo = findCombo;
exports.generateProphecy = generateProphecy;
// Khôi phục từ creationLore.ts của bản gốc nientekou/tutienbl.
exports.BACKGROUNDS = [
    { id: 'tu_chien_gia_toc', name: 'Con Nhà Tu Chân', emoji: '🏯', description: 'Sinh ra nơi tiên gia vọng tộc, căn cơ đã được nuôi dưỡng từ thuở lọt lòng.', intro: 'Ngươi lớn lên giữa tiếng chuông sơn môn và mùi hương đan dược. Kiếm quyết được học trước cả cách cầm bút. Trước ngày rời gia môn, trưởng bối chỉ dặn: “Kẻ mang họ tộc chỉ là xuất thân. Kẻ giữ được đạo tâm mới có thể một bước đăng đồ.”', bonuses: { hp: 50, atk: 5, lt: 200 }, startingItem: { id: 'gia_truyen_kiem', name: 'Bảo Kiếm Gia Truyền', description: 'Thanh kiếm truyền qua nhiều đời, lưu lại ý chí của tổ tiên.' } },
    { id: 'phan_tran', name: 'Kẻ Phàm Trần', emoji: '🌾', description: 'Không tiên duyên, không chỗ dựa. Chỉ có một lòng nghịch mệnh.', intro: 'Ngươi sinh ra giữa khói bếp và ruộng đồng. Một ngày linh quang hiện thế, kinh mạch bừng tỉnh. Không sư môn, không gia tộc — chỉ có một con đường kéo dài đến tận cuối chân trời.', bonuses: { expRate: 10, lt: 500, crit: 2 }, startingItem: null },
    { id: 'ky_ngo_sinh_tu', name: 'Kỳ Ngộ Sinh Tử', emoji: '⚡', description: 'Một lần chết hụt, đổi lấy một đoạn nhân quả không thuộc về mình.', intro: 'Giữa ranh giới sinh tử, có người đã cứu ngươi. Khi tỉnh dậy, động phủ chỉ còn một mảnh ngọc cùng dòng chữ “Cứu ngươi vì nhân quả.” Từ đó trong người luôn tồn tại một khí tức xa lạ.', bonuses: { def: 10, lt: 1000 }, startingItem: { id: 'manh_ngoc_ho_menh', name: 'Mảnh Ngọc Hộ Mệnh', description: 'Mảnh ngọc mang nhân quả chưa rõ nguồn gốc.' } },
    { id: 'de_tu_tan_tu', name: 'Đệ Tử Tán Tu', emoji: '🍃', description: 'Theo một tán tu học đạo, lấy thiên địa làm sư, lấy nhân gian làm sách.', intro: 'Sư phụ không tông môn, cũng chẳng danh hiệu. Người dạy ngươi nhận linh thảo, nhìn thiên tượng và sống giữa trời đất. Ngày rời đi chỉ để lại một túi càn khôn cũ cùng lời dặn: “Đừng học cách thành tiên. Học cách sống giữa thiên địa.”', bonuses: { speed: 5, mp: 30, lt: 300 }, startingItem: { id: 'sach_khai_kinh', name: 'Sách Khai Kinh', description: 'Bản chép tay cũ về cách dẫn linh khí nhập mạch.' } },
];
exports.DESTINIES = [
    { id: 'sat_tinh', name: 'Sát Tinh', emoji: '⚔️', description: 'Mệnh cách chủ chiến, lấy thử thách dưỡng đạo.', line: '“Một thân kiếm ý, lấy gian nan mở một con đường tiến bước.”', bonuses: { atkPercent: 3, crit: 3 }, penalties: { hpPercent: 5 } },
    { id: 'phuc_tinh', name: 'Phúc Tinh', emoji: '🍀', description: 'Mệnh cách tụ phúc, cơ duyên thường tự tìm đến.', line: '“Thiên địa có nhân quả, phúc duyên chỉ đến với người biết chờ.”', bonuses: { expRate: 5, dropRate: 10 }, penalties: { defPercent: 3 } },
    { id: 'tho_tinh', name: 'Thọ Tinh', emoji: '🐢', description: 'Mệnh cách trường sinh, lấy thời gian thắng thiên địa.', line: '“Ngàn năm cũng chỉ là một lần hít thở với kẻ giữ được đạo tâm.”', bonuses: { hpPercent: 10, defPercent: 5 }, penalties: { atkPercent: 3 } },
];
exports.COMBO_BONUSES = [
    { backgroundId: 'tu_chien_gia_toc', element: 'Hỏa', skillName: 'Xích Viêm Kiếm Ý', skillDescription: 'Kiếm thế nhiễm Hỏa, tăng uy lực hệ Hỏa.', skillEffect: '{"type":"elemental_atk","element":"fire","bonus":0.1}' },
    { backgroundId: 'tu_chien_gia_toc', element: 'Lôi', skillName: 'Kinh Lôi Nhất Trảm', skillDescription: 'Kiếm ý mang lôi đình, có cơ hội làm đối phương chậm một nhịp.', skillEffect: '{"type":"stun","chance":0.2,"duration":1}' },
    { backgroundId: 'phan_tran', element: 'Thổ', skillName: 'Hậu Thổ Ngưng Thân', skillDescription: 'Lấy Thổ khí dưỡng thân, tăng né tránh.', skillEffect: '{"type":"stat_buff","stat":"dodge","value":0.05}' },
    { backgroundId: 'phan_tran', element: 'Mộc', skillName: 'Thanh Mộc Sinh Cơ', skillDescription: 'Mộc khí không dứt, sinh cơ tự hồi.', skillEffect: '{"type":"regen","value":0.02}' },
    { backgroundId: 'ky_ngo_sinh_tu', element: 'Thủy', skillName: 'Linh Tuyền Dưỡng Mạch', skillDescription: 'Dẫn Thủy linh khí dưỡng mạch.', skillEffect: '{"type":"regen","value":0.05}' },
    { backgroundId: 'ky_ngo_sinh_tu', element: 'Lôi', skillName: 'Thiên Lôi Hộ Mạch', skillDescription: 'Lôi ý hộ thân, phản lại một phần uy lực.', skillEffect: '{"type":"reflect","value":0.05}' },
    { backgroundId: 'de_tu_tan_tu', element: 'Thủy', skillName: 'Linh Đan Tụ Hiệu', skillDescription: 'Tinh thông dược lý, tăng hiệu quả đan dược.', skillEffect: '{"type":"potion_boost","value":0.15}' },
    { backgroundId: 'de_tu_tan_tu', element: 'Hỏa', skillName: 'Xích Hỏa Luyện Đan', skillDescription: 'Hỏa linh tương trợ đan đạo.', skillEffect: '{"type":"craft_boost","skill":"alchemy","value":0.1}' },
    { backgroundId: 'ky_ngo_sinh_tu', element: 'Phong', skillName: 'Vô Ảnh Phong Hành', skillDescription: 'Thân theo gió chuyển, tăng tốc độ.', skillEffect: '{"type":"stat_buff","stat":"speed","value":0.05}' },
    { backgroundId: 'de_tu_tan_tu', element: 'Phong', skillName: 'Ngự Phong Độn Hành', skillDescription: 'Mượn Phong khí giảm tiêu hao thể lực.', skillEffect: '{"type":"stamina_save","value":0.1}' },
];
exports.HEIRLOOMS = [
    { id: 'co_kiem_tan_van', name: 'Tàn Văn Cổ Kiếm', icon: '🗡️', description: 'Một đoạn kiếm văn cổ đã mờ, không rõ xuất xứ.', effect: '+1% ATK' },
    { id: 'ngoc_tam_vo_danh', name: 'Vô Danh Cổ Ngọc', icon: '💠', description: 'Cổ ngọc ấm lên khi linh khí tụ gần.', effect: '+1% Tu Vi' },
    { id: 'long_vu_phuong_hoang', name: 'Phượng Linh Vũ', icon: '🪶', description: 'Linh vũ lưu chuyển một tia hỏa quang nhàn nhạt.', effect: '+1% Speed' },
    { id: 'vay_rong_den', name: 'Nghịch Lân Cổ Long', icon: '🐉', description: 'Một mảnh nghịch lân lưu lại tia long tức rất nhạt.', effect: '+1% DEF' },
];
const ELEMENTS = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ', 'Lôi', 'Phong'];
function generateLinhCan() { const values = {}; for (const e of ELEMENTS)
    values[e] = Math.floor(Math.random() * 96) + 5; return values; }
function mainLinhCan(lc) { return Object.entries(lc).sort((a, b) => b[1] - a[1])[0]; }
function linhCanGrade(v) { return v >= 90 ? 'Thiên' : v >= 70 ? 'Địa' : v >= 40 ? 'Nhân' : 'Tạp'; }
function getLinhCanFlavorText(element) { const x = { Kim: ['Kim khí sắc bén, như tiếng kiếm ngân trong thức hải.'], Mộc: ['Một sợi mộc ý bén rễ trong đan điền, sinh cơ lặng lẽ nảy nở.'], Thủy: ['Linh khí chảy như thủy triều, tĩnh lặng nhưng sâu không thấy đáy.'], Hỏa: ['Hỏa linh trong đan điền bừng cháy như một vầng dương chưa mọc.'], Thổ: ['Thổ linh trầm xuống đan điền như một ngọn núi cắm rễ giữa thiên địa.'], Lôi: ['Một tiếng lôi minh vang lên trong đan điền, lôi ý khiến linh khí quanh người rung chuyển.'], Phong: ['Phong linh vô hình, từng hơi thở đều trở nên nhẹ hơn.'] }; const a = x[element] || ['Linh căn khẽ thức tỉnh trong kinh mạch.']; return a[Math.floor(Math.random() * a.length)]; }
function generateHeirloom() { return exports.HEIRLOOMS[Math.floor(Math.random() * exports.HEIRLOOMS.length)]; }
function findCombo(backgroundId, element) { return exports.COMBO_BONUSES.find(x => x.backgroundId === backgroundId && x.element === element) || null; }
function generateProphecy(backgroundId, destinyId, element) { const bg = { tu_chien_gia_toc: { phuc_tinh: 'Tiên phủ còn hưng, một mạch truyền ba đời.', sat_tinh: 'Kiếm chỉ huyết thân, gia môn gặp kiếp.', tho_tinh: 'Rời tiên phủ, giữ một đời vô danh.' }, phan_tran: { phuc_tinh: 'Cỏ dại cũng có ngày hóa linh mộc.', sat_tinh: 'Một thân phàm cốt, dám nghịch thiên mệnh.', tho_tinh: 'Đại đạo vô danh, người đời chẳng nhớ.' }, de_tu_tan_tu: { phuc_tinh: 'Trời đất rộng dài, gặp thời ắt dựng nghiệp.', sat_tinh: 'Sát khí nhập mệnh, một đời khó tránh phong ba.', tho_tinh: 'Mây bay bốn hướng, chẳng ai biết người về đâu.' }, ky_ngo_sinh_tu: { phuc_tinh: 'Nhân quả chưa dứt, hậu vận tự có cơ duyên.', sat_tinh: 'Một niệm phá cục, đường về vạn dặm xa.', tho_tinh: 'Núi sâu chẳng hỏi thế sự, một đời giữ mình tu hành.' } }; const suffix = { Kim: 'Bách luyện thành cương, một kiếm phá vạn pháp.', Mộc: 'Một hạt sinh căn, ngày sau ắt thành đại mộc.', Thủy: 'Nước theo thế mà chảy, người theo đạo mà hành.', Hỏa: 'Một đốm linh hỏa, cũng đủ soi rọi cửu thiên.', Thổ: 'Đất dày mới tải được vạn vật, đường xa mới biết căn cơ.', Lôi: 'Thiên lôi giáng thế, mệnh này khó bình phàm.', Phong: 'Gió đến chẳng báo trước, một đời khó chịu trói buộc.' }; const pool = ['Thiên mệnh đã định, lòng người chưa chắc.', 'Đường dài vạn dặm, một bước cũng phải tự mình đi.', 'Mệnh có thể định, số lại do người.', 'Một đời cầu đạo, cuối cùng cầu lại chính mình.', 'Nếu đã bước lên con đường này, hà tất hỏi ngày về.']; return `${bg[backgroundId]?.[destinyId] || 'Mệnh trời vô định, hành trình vô tận.'}\n${suffix[element] || 'Linh khí mờ ảo.'}\n${pool[Math.floor(Math.random() * pool.length)]}`; }
exports.CREATION_PROLOGUE = [
    ['Chương I · Khai Thiên', 'Thuở thiên địa chưa định, vạn vật còn chìm trong hỗn mang. Khi thanh khí hóa trời, trọc khí thành đất, Thương Mang Thiên Hạ mới thành hình. Linh khí lưu chuyển khắp sơn hà, đại đạo từ đó mở ra.'],
    ['Chương II · Dấu Mốc', 'Có một thời đại mà hậu thế chỉ còn biết qua những mảnh cổ sử. Có người lấy thân hỏi trời, mở ra con đường trước đó chưa từng tồn tại.'],
    ['Chương III · Đại Kiếp', 'Đại kiếp cuốn vạn tộc vào vòng nhân quả. Tông môn hưng rồi diệt, truyền thừa chôn vùi, linh mạch dần suy kiệt.'],
    ['Chương IV · Thương Mang Tái Khởi', 'Nay linh mạch thức tỉnh, bí cảnh và cổ địa lần lượt hiện thế. Tiên lộ một lần nữa mở ra — chương tiếp theo sẽ do chính Đạo Hữu viết nên.'],
];
