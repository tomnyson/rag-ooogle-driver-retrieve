# 🚀 Step-by-Step Setup Guide

Hướng dẫn chi tiết để setup project từ đầu.

## Bước 1: Cài đặt dependencies ✅

```bash
npm install
# hoặc
yarn install
```

## Bước 2: Tạo file .env ✅

File `.env` đã được tạo từ template. Bây giờ bạn cần điền thông tin:

```bash
# File đã tồn tại tại: .env
# Mở file và điền thông tin theo hướng dẫn dưới
```

## Bước 3: Setup Google Cloud Credentials 🔐

### 3.1. Tạo Google Cloud Project

1. Truy cập: https://console.cloud.google.com/
2. Click **Select a project** → **NEW PROJECT**
3. Đặt tên project (ví dụ: "RAG Google Drive")
4. Click **CREATE**

### 3.2. Enable Google Drive API

1. Vào **APIs & Services** → **Library**
2. Tìm "Google Drive API"
3. Click **ENABLE**

### 3.3. Tạo OAuth 2.0 Credentials

1. Vào **APIs & Services** → **Credentials**
2. Click **CREATE CREDENTIALS** → **OAuth client ID**
3. Nếu chưa có OAuth consent screen:
   - Click **CONFIGURE CONSENT SCREEN**
   - Chọn **External** → **CREATE**
   - Điền tên app: "RAG Google Drive"
   - Điền email support
   - Click **SAVE AND CONTINUE**
   - Scopes: bỏ qua, click **SAVE AND CONTINUE**
   - Test users: thêm email của bạn
   - Click **SAVE AND CONTINUE**
4. Quay lại **Credentials** → **CREATE CREDENTIALS** → **OAuth client ID**
5. Chọn **Application type**: **Desktop app**
6. Đặt tên: "RAG Desktop Client"
7. Click **CREATE**
8. **QUAN TRỌNG**: Copy **Client ID** và **Client Secret**

### 3.4. Điền vào .env

Mở file `.env` và điền:

```env
GOOGLE_CLIENT_ID=your_client_id_here_paste_from_step_3.3
GOOGLE_CLIENT_SECRET=your_client_secret_here_paste_from_step_3.3
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
GOOGLE_REFRESH_TOKEN=                    # Sẽ lấy ở bước sau
```

### 3.5. Lấy Refresh Token

Sau khi đã điền Client ID và Secret:

```bash
npm run setup
```

Làm theo hướng dẫn:
1. Copy URL hiển thị trong terminal
2. Mở URL trong trình duyệt
3. Đăng nhập Google account
4. Click **Allow** (cho phép quyền truy cập)
5. Bạn sẽ thấy error page (bình thường!)
6. **QUAN TRỌNG**: Copy đoạn code từ URL
   - URL sẽ có dạng: `http://localhost:3000/oauth2callback?code=4/0AbCD...`
   - Copy phần sau `code=` (toàn bộ đoạn dài)
7. Paste vào terminal
8. Copy **GOOGLE_REFRESH_TOKEN** hiển thị
9. Paste vào file `.env`

## Bước 4: Setup Gemini AI API 🤖

### 4.1. Lấy API Key

1. Truy cập: https://makersuite.google.com/app/apikey
2. Click **Create API Key**
3. Chọn project (hoặc tạo mới)
4. Copy API key

### 4.2. Điền vào .env

```env
GEMINI_API_KEY=your_gemini_api_key_here_paste_from_step_4.1
```

## Bước 5: Setup Supabase 💾

### 5.1. Tạo Supabase Project

1. Truy cập: https://supabase.com/
2. Click **New Project**
3. Chọn Organization (hoặc tạo mới)
4. Điền thông tin:
   - Name: "RAG Google Drive"
   - Database Password: Tạo password mạnh (lưu lại!)
   - Region: Chọn gần bạn nhất (Singapore hoặc Tokyo cho VN)
5. Click **Create new project**
6. Đợi ~2 phút để project được tạo

### 5.2. Lấy Credentials

1. Vào **Settings** (biểu tượng ⚙️) → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: dãy key dài

### 5.3. Điền vào .env

```env
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_KEY=your_anon_key_here
```

### 5.4. Setup Database

**Nếu bạn đã có table `knowledge_base`**: Bỏ qua bước này.

**Nếu chưa có**:

1. Trong Supabase dashboard, vào **SQL Editor**
2. Mở file `supabase-setup-knowledge-base.sql` trong project
3. Copy toàn bộ nội dung
4. Paste vào SQL Editor
5. Click **RUN** (hoặc Ctrl+Enter)
6. Verify: Vào **Table Editor**, bạn sẽ thấy table `knowledge_base`

## Bước 6: Verify Configuration ✓

Chạy script kiểm tra:

```bash
npm run check
```

Bạn sẽ thấy:
- ✅ nếu variable đã được set đúng
- ❌ nếu còn thiếu hoặc chưa đúng

**Tất cả phải ✅ trước khi tiếp tục!**

## Bước 7: Test Sync 🧪

### 7.1. Sync lần đầu

```bash
npm start once
```

Bạn sẽ thấy:
```
🚀 Initializing services...
✅ Google Drive API initialized successfully
✅ Gemini AI initialized successfully
✅ Supabase client initialized successfully
📊 Starting sync process...
📁 Processing X files...
```

Nếu có lỗi, xem phần **Common Errors** bên dưới.

### 7.2. Kiểm tra data trong Supabase

1. Vào Supabase dashboard → **Table Editor**
2. Chọn table `knowledge_base`
3. Bạn sẽ thấy các documents đã được sync

## Bước 8: Test Search 🔍

```bash
npm run search "your test query"
```

Ví dụ:
```bash
npm run search "machine learning"
```

## Bước 9: Setup Cron Job (Optional) ⏰

Để chạy tự động:

```bash
npm start
```

Cron job sẽ:
- Chạy sync ngay lập tức
- Lên lịch chạy định kỳ (mặc định: 2h sáng mỗi ngày)

Để thay đổi lịch, sửa trong `.env`:
```env
# Chạy mỗi 6 tiếng
CRON_SCHEDULE=0 */6 * * *

# Chạy lúc 9h sáng thứ 2-6
CRON_SCHEDULE=0 9 * * 1-5
```

## ✅ Setup Complete!

Giờ bạn có thể:
- ✅ Sync files từ Google Drive
- ✅ Tìm kiếm bằng vector similarity
- ✅ Chạy tự động theo lịch

---

## 🐛 Common Errors

### Error: invalid_client

**Nguyên nhân**: Google OAuth credentials không đúng

**Fix**:
1. Check lại `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` trong `.env`
2. Đảm bảo copy đúng từ Google Cloud Console
3. Không có khoảng trắng thừa
4. Chạy lại `npm run setup` để lấy refresh token mới

### Error: API key not valid

**Nguyên nhân**: Gemini API key không đúng hoặc hết hạn

**Fix**:
1. Kiểm tra lại `GEMINI_API_KEY` trong `.env`
2. Tạo API key mới tại: https://makersuite.google.com/app/apikey
3. Copy và paste lại vào `.env`

### Error: relation "knowledge_base" does not exist

**Nguyên nhân**: Table chưa được tạo trong Supabase

**Fix**:
1. Vào Supabase SQL Editor
2. Chạy script trong `supabase-setup-knowledge-base.sql`
3. Verify table đã được tạo

### Error: insufficient_scope

**Nguyên nhân**: Refresh token không có đủ quyền

**Fix**:
1. Revoke access: https://myaccount.google.com/permissions
2. Chạy lại `npm run setup`
3. Đảm bảo click "Allow" cho tất cả permissions

### No files found

**Nguyên nhân**: Không có file PDF/Word trong Google Drive

**Fix**:
1. Upload vài file PDF hoặc Word vào Google Drive
2. Hoặc set `DRIVE_FOLDER_ID` để sync một folder cụ thể
3. Chạy lại sync

---

## 💡 Tips

### Sync một folder cụ thể

Để chỉ sync một folder thay vì toàn bộ Drive:

1. Mở folder trong Google Drive
2. Copy ID từ URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
3. Thêm vào `.env`:
```env
DRIVE_FOLDER_ID=your_folder_id
```

### Test với ít files trước

Nên tạo một test folder với 2-3 files PDF/Word để test trước khi sync toàn bộ.

### Set teacher_id và user_id

Nếu app có nhiều users:

```env
TEACHER_ID=uuid-of-teacher
USER_ID=uuid-of-user
```

---

## 📚 Next Steps

- 📖 Đọc [README.md](README.md) để hiểu đầy đủ tính năng
- 🏗️ Xem [ARCHITECTURE.md](ARCHITECTURE.md) để hiểu cách hoạt động
- 🚀 Đọc [DEPLOYMENT.md](DEPLOYMENT.md) để deploy production
- ⚡ Xem [MIGRATION.md](MIGRATION.md) để nâng cấp performance với pgvector

---

**Cần giúp đỡ?** Tạo issue trên GitHub hoặc liên hệ support.

Chúc bạn setup thành công! 🎉


