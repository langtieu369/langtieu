# Thương Mang Thiên Hạ V2 — Báo cáo rà soát hệ thống

## 1. Cảnh giới

Chuỗi chính thức:

Luyện Khí → Trúc Cơ → Kim Đan → Nguyên Anh → Hóa Thần → Luyện Hư → Hợp Thể → Đại Thừa → Độ Kiếp → Tiên Nhân.

Khi đạt Tiên Nhân, hồ sơ tự hiển thị danh hiệu `✨✦ Tiên Nhân ✦✨`.

## 2. Kiểm tra nguồn vật phẩm

Catalog hiện có **93 vật phẩm**. Mỗi vật phẩm sở hữu được đều phải có ít nhất một `source` hợp lệ. `auditCatalog()` chạy ngay khi bot khởi động và sẽ chặn khởi động nếu gặp:

- vật phẩm không có nguồn;
- công thức gọi nguyên liệu không tồn tại;
- thành phẩm không tồn tại;
- địa vực/bí cảnh/cường địch trả vật phẩm không tồn tại;
- nguồn hoặc công thức dùng cảnh giới ngoài bảng cảnh giới;
- vật phẩm khai báo nguồn chế tác nhưng không có công thức.

Chuỗi kinh tế hiện tại bao gồm 10 tầng khoáng liệu, 10 tầng dược liệu, 10 tầng ngọc/tinh phách, 10 tầng chiến lợi phẩm yêu thú, 10 linh ngư, 10 vũ khí, 10 pháp y, 9 đan dược, 10 linh thiện và vật phẩm đặc biệt.

## 3. Chế tác và đầu ra

Có **39 công thức**:

- 10 pháp kiếm;
- 10 pháp y;
- 9 đan dược;
- 10 linh thiện.

Nguyên liệu cấp cao không còn là vật phẩm vô nguồn. Từ Hóa Thần trở lên, rèn trang bị còn dùng `Cường Địch Tàn Tinh`, tạo đầu ra thật cho hệ thống cường địch.

`Cổ Đồ Tàn Phiến` được tiêu thụ khi dùng để dẫn đường vào bí cảnh, tăng xác suất phá cảnh. `Trấn Hải Công Lệnh` và `Xích Dực Chiến Lệnh` đều có chỗ đổi vật. CPLT có quầy đổi vật riêng, tránh trở thành tiền tệ chỉ tích mà không dùng.

## 4. Thiên Mang Sơn Hạ

Có **80 địa vực**, chia trên 8 nhánh:

- Địa Sinh Vạn Khoáng;
- Sơn Sinh Vạn Ngọc;
- Bách Thảo Linh Cốc;
- Triều Sinh Vạn Tượng;
- Tuần Thú Sơn Hà;
- Vân Du Thiên Lộ;
- Thái Cổ Di Cảnh;
- Phong Trần Tiêu Lộ.

Mỗi nhánh có địa vực từ Luyện Khí tới Tiên Nhân. Cảnh giới quyết định địa vực nào được mở và cấp vật liệu có thể thu được.

Các lệnh kiểu `/lamviec`, `/daokhoang`, `/haithuoc` không được tạo lại thành ba hệ độc lập trong V2. Chúng được hợp nhất vào `/tutien → Thiên Mang Sơn Hạ`, tránh trùng logic và trùng phần thưởng.

## 5. Xích Dực Các

Đã có luồng sử dụng thật cho:

- **Luận Võ PvP**: chọn trực tiếp một người dùng Discord trong giao diện; dùng chiến lực, xếp hạng, thắng/thua và Xích Dực Chiến Lệnh.
- **Cường Địch**: 8 cường địch toàn cục, HP dùng chung, ghi nhận người tham chiến, tái hiện sau 12 giờ và phát chiến lợi phẩm cho người đã đóng góp khi bị hạ.
- **Bí Cảnh**: 8 bí cảnh từ Trúc Cơ đến Độ Kiếp; khóa theo cảnh giới, tiêu hao Khí Lực, xét chiến lực, trả Tu Vi và nguyên liệu.

Các chức năng cũ mang ý nghĩa tương đương `bicanh`, `worldboss`, `arena`, `pvpbxh` được gom về Xích Dực Các thay vì tạo thêm slash command trùng chức năng.

## 6. Nhất Phẩm Các và Kim Vân Đài

Nhất Phẩm Các có:

- tầng vật tư bằng Linh Thạch;
- quầy đổi bằng Cực Phẩm Linh Thạch;
- Kim Vân Đài giao dịch giữa người chơi.

Kim Vân Đài có đăng bán, phí đăng, thời hạn 48 giờ, thu hồi, mua, thuế giao dịch, hoàn trả vật phẩm hết hạn và ngăn tự mua vật phẩm của mình. Vật phẩm đang trang bị không thể đem bán.

## 7. Tử Hà Các · Vạn Vật Chí

Bách khoa đọc trực tiếp cùng catalog mà gameplay sử dụng. Mỗi mục hiển thị:

- phẩm chất;
- mô tả;
- nguồn kiếm;
- cảnh giới yêu cầu;
- công dụng;
- nguyên liệu chế tác nếu là thành phẩm;
- trạng thái có thể giao dịch hay không.

Danh sách có phân trang để không vượt giới hạn component Discord.

## 8. Kiểm tra lệnh/nút và mã bị bỏ quên

V2 chủ động chỉ giữ **2 slash command**:

- `/taonhanvat` — tạo đạo hồ;
- `/tutien` — mở toàn bộ hệ thống.

Mọi gameplay còn lại đều có nút, select menu hoặc modal bên trong `/tutien`. Client sẽ báo lỗi nếu có hai file tạo cùng một slash command.

`SystemRegistry.ts` khai báo các hệ thống chính và các route giao diện. `auditSystemAccess()` chạy lúc bot sẵn sàng; nếu một hệ thống được đăng ký nhưng route của nó không tồn tại, bot sẽ dừng thay vì để lại tính năng không có cách truy cập.

Kiểm tra import graph hiện tại: **0 module TypeScript bị cô lập** (ngoài `index.ts` và hai command được nạp động đúng chủ đích).

## 9. Kết quả kiểm tra gói này

- 10 cảnh giới;
- 93 vật phẩm;
- 80 địa vực;
- 39 công thức;
- 8 cường địch;
- 8 bí cảnh;
- 0 lỗi catalog trong kiểm tra thực thi;
- 0 module TypeScript bị cô lập;
- 0 lỗi cú pháp/transpile trên toàn bộ source TypeScript.

Lưu ý: môi trường tạo gói không tải được dependency từ npm trong thời gian cho phép, vì vậy full `tsc` với type definitions của `discord.js`, Node và `better-sqlite3` chưa thể chạy tại đây. Railway/GitHub sẽ cài dependency trước khi `npm run build`; `npm run check` sẽ build rồi chạy audit runtime.
