# 🚀 Quick Start Guide

Hướng dẫn nhanh để bắt đầu trong 5 phút!

## Bước 1: Cài đặt dependencies

```bash
npm install
```

## Bước 2: Setup file .env

```bash
cp env.sample .env
```

Mở file `.env` và điền thông tin:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
GOOGLE_REFRESH_TOKEN=                    # Sẽ lấy ở bước 3

GEMINI_API_KEY=your_gemini_api_key

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key

CRON_SCHEDULE=0 2 * * *
DRIVE_FOLDER_ID=
```

## Bước 3: Lấy Google OAuth Tokens

### 3.1. Tạo Google Cloud Credentials

1. Vào https://console.cloud.google.com/
2. Tạo project mới (hoặc chọn project có sẵn)
3. Enable **Google Drive API**
4. Tạo **OAuth 2.0 Client ID** (Desktop app)
5. Copy Client ID và Client Secret vào `.env`

### 3.2. Lấy Refresh Token

```bash
npm run setup
```

Làm theo hướng dẫn trên terminal:
1. Mở URL trong trình duyệt
2. Login Google và cho phép quyền truy cập
3. Copy authorization code
4. Paste vào terminal
5. Copy `GOOGLE_REFRESH_TOKEN` vào file `.env`

## Bước 4: Setup Supabase

### 4.1. Tạo Project

1. Vào https://supabase.com/
2. Tạo project mới
3. Copy URL và anon key vào `.env`

### 4.2. Setup Database

1. Vào **SQL Editor** trong Supabase dashboard
2. Copy toàn bộ nội dung file `supabase-setup.sql`
3. Paste và click **Run**

✅ Done! Bảng `documents` đã được tạo.

## Bước 5: Lấy Gemini API Key

1. Vào https://makersuite.google.com/app/apikey
2. Click **Create API key**
3. Copy API key vào `.env`

## Bước 6: Chạy thử

### Sync một lần

```bash
npm start once
```

### Chạy cron job

```bash
npm start
```

## Bước 7: Test tìm kiếm

```bash
npm run search "your search query"
```

Ví dụ:
```bash
npm run search "machine learning"
npm run search "hợp đồng thuê nhà"
```

---

## ✅ Checklist

- [ ] Node.js đã cài đặt (>= 18.x)
- [ ] Đã chạy `npm install`
- [ ] File `.env` đã được tạo và điền đầy đủ thông tin
- [ ] Google Drive API đã được enable
- [ ] OAuth credentials đã được tạo
- [ ] Refresh token đã được lấy
- [ ] Supabase project đã được tạo
- [ ] Database table đã được setup (chạy SQL)
- [ ] Gemini API key đã được lấy
- [ ] Đã test chạy `npm start once`
- [ ] Có file trên Google Drive để test

## 🎯 Cấu trúc File Google Drive

Script sẽ đọc tất cả file trong Google Drive của bạn (hoặc folder cụ thể nếu set `DRIVE_FOLDER_ID`):

Các file được hỗ trợ:
- ✅ PDF (`.pdf`)
- ✅ Word (`.docx`, `.doc`)
- ✅ Google Docs

## 💡 Tips

### Test với folder cụ thể

Nếu bạn có nhiều file, nên test với 1 folder trước:

1. Tạo folder test trên Google Drive
2. Copy ID của folder từ URL (phần sau `/folders/`)
3. Set `DRIVE_FOLDER_ID` trong `.env`

Ví dụ URL: `https://drive.google.com/drive/folders/1ABC123xyz`
→ Folder ID: `1ABC123xyz`

### Cron Schedule Examples

```env
# Mỗi 30 phút
CRON_SCHEDULE=*/30 * * * *

# Mỗi 6 giờ
CRON_SCHEDULE=0 */6 * * *

# 2 giờ sáng mỗi ngày
CRON_SCHEDULE=0 2 * * *

# 9 giờ sáng thứ 2-6
CRON_SCHEDULE=0 9 * * 1-5
```

## 🐛 Common Issues

### Error: Missing required environment variables

→ Check file `.env` có đầy đủ biến chưa

### Error: Invalid credentials

→ Check lại Client ID, Secret, và Refresh Token

### Error: pgvector extension not found

→ Chạy lại SQL setup script trong Supabase

### No files found

→ Check quyền truy cập Google Drive và DRIVE_FOLDER_ID

## 📚 Đọc thêm

- [README.md](README.md) - Hướng dẫn đầy đủ
- [DEPLOYMENT.md](DEPLOYMENT.md) - Hướng dẫn deploy production

## 🆘 Cần giúp đỡ?

Tạo issue trên GitHub hoặc check phần Troubleshooting trong README.md

---

**Chúc bạn thành công! 🎉**


