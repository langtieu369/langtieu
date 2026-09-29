# Triển khai Railway · RC1

## 1. Tạo dịch vụ

1. Đưa toàn bộ mã nguồn lên một repository riêng tư.
2. Tạo Railway Project từ repository đó.
3. Tạo một **Volume** và mount chính xác tại `/app/data`.

Không triển khai hai service bot cùng trỏ vào hai volume khác nhau. Scheduler có khóa chống chạy trùng, nhưng toàn bộ instance phải nhìn thấy cùng một database nếu chạy nhiều replica.

## 2. Biến môi trường

```env
DISCORD_TOKEN=token_bot_discord
DB_PATH=/app/data/tutien.db
SNAPSHOT_DIR=/app/data/snapshots
SNAPSHOT_RETENTION=7
```

`PORT` do Railway tự cấp; khi chạy local có thể đặt `PORT=3000`.

## 3. Build và health check

Railway tự đọc `railway.json`:

- Build: `npm run build`
- Start: `npm start`
- Health: `/healthz`
- Restart: chỉ khi tiến trình thất bại, tối đa 10 lần

Health trả `503 STARTING` trước khi Discord, audit và scheduler sẵn sàng; trả `200 READY` khi bot đã hoạt động; trở lại `503 STOPPING` khi Railway đang dừng service.

## 4. Dữ liệu và snapshot

- Database chính: `/app/data/tutien.db`
- WAL/SHM: cùng thư mục với database
- Snapshot tự động: một bản mỗi ngày theo ngày Việt Nam
- Retention mặc định: 7 bản gần nhất
- Snapshot thủ công: `/thienthu` → Hệ Thống → Snapshot

Trước khi thay đổi lớn, tải một snapshot khỏi Volume. Không copy riêng file `.db` trong lúc bot đang ghi nếu chưa checkpoint; ưu tiên snapshot do bot tạo.

## 5. Smoke test sau deploy

1. Railway báo health `200` và log có `runtime.ready`.
2. Discord chỉ đăng ký `/taonhanvat`, `/tutien`, `/thienthu`.
3. Tài khoản thường không mở được `/thienthu`.
4. Tạo một nhân vật thử, mở `/tutien`, Vân Du một lượt và kiểm tra Hành Trang.
5. Dùng Owner test account từ `/thienthu`; xác nhận tài khoản không xuất hiện trên BXH.
6. Restart service; xác nhận nhân vật, vật phẩm và trạng thái vẫn còn.
7. Kiểm tra thư mục snapshot trên Volume sau lần khởi động đầu.

## 6. Điều kiện phát hành

RC chỉ được nâng thành bản phát hành sau khi live smoke test bằng một Owner test account và ít nhất hai tài khoản người chơi thật vượt qua các luồng: tạo nhân vật, UI ownership, tổ đội Bí Cảnh, combat, nhận thưởng, restart và scheduler.
