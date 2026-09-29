# Thương Mang Thiên Hạ V2.5 — Restoration Coverage

Nguồn đối chiếu bắt buộc:
- `nientekou/tutienbl/src/commands/**`
- `nientekou/tutienbl/src/data/**`
- service / database / config / event liên quan của bản gốc

## Nguyên tắc
1. Không command gốc nào được phép biến mất khỏi Coverage Map.
2. Nếu command cũ lỗi: sửa và giữ chức năng.
3. Nếu command được gộp vào `/tutien`: phải có nút/menu/handler thay thế.
4. Admin economy bắt buộc kiểm tra `BOT_OWNER_ID = '724608013981450351'`.
5. Có nút nhưng không handler, có service nhưng không entry point, có item không nguồn hoặc recipe không hoàn thành đều bị audit coi là lỗi/cảnh báo.

## Pass 1 — Đã đưa vào source
- [x] Sửa type `CommandBuilder` cho Discord.js SlashCommand có options/subcommands.
- [x] Owner security layer (`src/config/permissions.ts`).
- [x] `/admin linhthach` tăng/giảm LT.
- [x] `/admin cplt` tăng/giảm CPLT.
- [x] `/admin item` tăng/giảm item theo ID.
- [x] `/admin nhatky` và bảng `admin_audit`.
- [x] Khôi phục nền tảng `creationLore.ts`: Xuất Thân, Mệnh Cách, Linh Căn, Cổ Vật, combo thiên phú, Mệnh Thư, đại cảnh mở đầu.
- [x] `/taonhanvat` lưu creation data vào database.
- [x] Hồ Sơ hiển thị Linh Căn / Cổ Vật / Thiên Phú.
- [x] Trang chính có thanh Khí Lực và separator có tiêu đề: Thông Tin / Chiến Đấu / Tu Luyện / Chế Tạo / Tứ Các.
- [x] Động Phủ có Sinh Mệnh / Tu Vi / Khí Lực bằng progress bar.
- [x] `Thiền Định` đổi thành `Bế Quan`.
- [x] Tu Vi viên mãn yêu cầu `Đột Phá` thủ công thay vì tự động nhảy cấp.
- [x] Linh Căn và Khí Linh có màn thông tin nối từ Động Phủ.

## Pass kế tiếp — Bắt buộc khôi phục hoàn chỉnh
- [ ] Tông Môn và toàn bộ sub-system liên quan.
- [ ] Bảng Phong Thần: Lực Chiến / Cảnh Giới / Tài Phú / Cống Hiến Tông Môn / PvP / Luyện Đan / Luyện Khí.
- [ ] Linh Điền.
- [ ] Chế Tạo đầy đủ; Luyện Đan; Luyện Khí; Cường Hóa.
- [ ] Khí Linh đầy đủ; Sủng Thú; Ấp Trứng; Thú Cưỡi.
- [ ] Ý Cảnh; Đạo Tâm; Đạo Quả; Huyết Mạch.
- [ ] Arena / PvP BXH / lập đội / Bí Cảnh / Bí Cảnh Song Hành / Thiên Kiếp / Thiên Khố / Vọng Tưởng / Cường Địch.
- [ ] Guild War / Sect War và các hệ chiến đấu tập thể.
- [ ] Bảng Nghĩa Vụ / Cẩm Nang / các command utility còn lại trong source gốc.
- [x] `casino.ts` được khôi phục theo dạng **RESTORED – ADAPTED**: không giới hạn số ván/ngày, chỉ dùng Casino Token riêng; không mua/đổi bằng LT/CPLT và không cash-out.
- [ ] Admin parity audit: từng subcommand trong `admin.ts` bản gốc phải có mapping.
- [ ] Full command-by-command coverage audit trước khi gắn nhãn COMPLETE.

> Lưu ý: file này là tracker. Bản chỉ được coi là hoàn chỉnh khi không còn mục bắt buộc nào chưa mapping.
