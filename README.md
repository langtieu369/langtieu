# Thương Mang Thiên Hạ V2

Bot Discord Components V2 theo phong cách tiên hiệp. Bản này là một nền độc lập, tập trung toàn bộ gameplay vào `/tutien` để tránh hàng loạt slash command trùng chức năng.

## Cảnh giới

**Luyện Khí → Trúc Cơ → Kim Đan → Nguyên Anh → Hóa Thần → Luyện Hư → Hợp Thể → Đại Thừa → Độ Kiếp → Tiên Nhân**.

Sau Độ Kiếp, khi đạt Tiên Nhân, hồ sơ tự nhận danh hiệu lấp lánh **✨✦ Tiên Nhân ✦✨**.

## Những hệ thống đã nối với nhau

- **Thiên Mang Sơn Hạ**: 8 nhánh, 80 địa vực khóa theo cảnh giới.
- **Trấn Hải Các**: nghĩa vụ, tiến độ và công thưởng.
- **Nhất Phẩm Các**: vật tư, đổi CPLT và **Kim Vân Đài** giao dịch người chơi.
- **Tử Hà Các · Vạn Vật Chí**: tra nguồn vật phẩm, công dụng, công thức và cảnh giới yêu cầu.
- **Xích Dực Các**: PvP Luận Võ, Cường Địch toàn cục, Bí Cảnh khóa cảnh giới.
- **Bách Nghệ**: Đan Hà Cốc, Thiên Công Lô, Ngũ Vị Linh Trù.
- **Tu Luyện**: thiền định, nhận Tu Vi, tự thăng cấp/cảnh giới.
- **Trang bị / đan dược / linh thiện**: có công dụng thật trong chỉ số và gameplay.

Catalog hiện có **93 vật phẩm**, **39 công thức**, **8 cường địch** và **8 bí cảnh**. Bot chạy audit nguồn vật phẩm khi khởi động.

## Lệnh

Chỉ có hai slash command chủ đạo:

- `/taonhanvat dao_hieu:<tên>`
- `/tutien`

Các chức năng như khai khoáng, hái thuốc, câu cá, bí cảnh, boss, PvP, shop, giao dịch, luyện đan, luyện khí… đều đi qua giao diện `/tutien`.

## Chạy local

```bash
npm install
npm run check
npm start
```

Tạo `.env`:

```env
DISCORD_TOKEN=token_bot_cua_ban
DB_PATH=./data/tutien.db
```

## Railway

Đặt biến:

```text
DISCORD_TOKEN=<bot token>
DB_PATH=/app/data/tutien.db
```

Gắn Railway Volume tại `/app/data` để SQLite được lưu bền vững.

Build: `npm run build`  
Start: `npm start`

Xem chi tiết kiểm toán trong `AUDIT_REPORT.md`.
