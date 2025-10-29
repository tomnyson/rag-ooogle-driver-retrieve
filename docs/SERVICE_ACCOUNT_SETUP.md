# 🔐 Service Account Setup (Recommended)

Service Account là cách đơn giản và an toàn nhất để authenticate với Google Drive API cho automation.

## ✅ Ưu điểm của Service Account

- ✅ **Không cần OAuth flow phức tạp**
- ✅ **Không cần refresh token**
- ✅ **Tốt hơn cho automation và server-side apps**
- ✅ **Dễ quản lý và deploy**
- ✅ **Không bị expire như OAuth tokens**

## 📋 Bạn đã có Service Account!

File `service-account.json` đã được setup với credentials:
- **Email**: `servicetomnyson@b2bvegestable.iam.gserviceaccount.com`
- **Project**: `b2bvegestable`

## 🚀 Cách sử dụng

### Bước 1: Share Google Drive folders với Service Account

**QUAN TRỌNG**: Service Account cần được cấp quyền truy cập vào files/folders trên Google Drive.

#### Cách share:

1. Mở Google Drive: https://drive.google.com
2. Tìm folder bạn muốn sync
3. Click phải → **Share** (Chia sẻ)
4. Thêm email: `servicetomnyson@b2bvegestable.iam.gserviceaccount.com`
5. Chọn quyền: **Viewer** (hoặc Editor nếu cần)
6. Click **Send**

**Lưu ý**: Service Account chỉ thấy được files/folders được share với nó!

#### Lấy Folder ID:

1. Mở folder trong Google Drive
2. Copy ID từ URL:
   ```
   https://drive.google.com/drive/folders/1ABC123xyz456
                                          ^^^^^^^^^^^^^ (Folder ID)
   ```
3. Thêm vào `.env`:
   ```env
   DRIVE_FOLDER_ID=1ABC123xyz456
   ```

### Bước 2: Cấu hình .env

File `.env` đã được tạo với cấu hình Service Account:

```env
# Google Drive API - Using Service Account (đơn giản hơn!)
GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# Optional: Folder ID
DRIVE_FOLDER_ID=your_folder_id_here
```

**Chỉ cần điền**:
- ✅ `GEMINI_API_KEY`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_KEY`
- ✅ `DRIVE_FOLDER_ID` (folder đã share)

**KHÔNG CẦN**:
- ❌ `GOOGLE_CLIENT_ID`
- ❌ `GOOGLE_CLIENT_SECRET`
- ❌ `GOOGLE_REFRESH_TOKEN`
- ❌ OAuth flow phức tạp!

### Bước 3: Verify

```bash
npm run check
```

Bạn sẽ thấy:
```
✅ Google Drive: Service Account configured
✅ Service Account: servicetomnyson@b2bvegestable.iam.gserviceaccount.com
```

### Bước 4: Test Sync

```bash
npm start once
```

## 📁 Example Workflow

### Scenario 1: Sync một folder cụ thể

```bash
# 1. Tạo folder "RAG Documents" trong Google Drive
# 2. Share với: servicetomnyson@b2bvegestable.iam.gserviceaccount.com
# 3. Copy Folder ID từ URL
# 4. Thêm vào .env:
DRIVE_FOLDER_ID=1ABC123xyz456

# 5. Chạy sync
npm start once
```

### Scenario 2: Sync nhiều folders

Nếu muốn sync nhiều folders, có 2 cách:

**Option A: Share parent folder**
```
My Drive/
  └─ Company Docs/          <- Share cái này
       ├─ HR/
       ├─ Marketing/
       └─ Tech/
```

**Option B: Run multiple instances**
- Tạo nhiều `.env` files (`.env.hr`, `.env.marketing`)
- Mỗi file point đến folder khác nhau
- Chạy nhiều instances

## 🔒 Security Best Practices

### 1. Giữ service account file an toàn

```bash
# File đã được add vào .gitignore
# KHÔNG commit file này lên git!

# Check:
cat .gitignore | grep service-account
# Should show: service-account.json
```

### 2. Chỉ cấp quyền cần thiết

- Chỉ share folders cần thiết
- Dùng quyền **Viewer** (read-only)
- Không share toàn bộ Drive

### 3. Rotate keys định kỳ

Nếu cần tạo service account key mới:
1. Vào: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Chọn service account
3. Keys → Add Key → Create new key → JSON
4. Download và replace `service-account.json`

## 🆚 So sánh với OAuth2

| Feature | Service Account | OAuth2 |
|---------|----------------|--------|
| Setup | ✅ Đơn giản | ❌ Phức tạp |
| Refresh Token | ✅ Không cần | ❌ Cần manage |
| Expiration | ✅ Không expire | ⚠️ Có thể expire |
| Best for | ✅ Automation | ⚠️ User apps |
| Production | ✅ Recommended | ❌ Not recommended |

## 📊 Monitoring

### Check service account có hoạt động không:

```bash
npm start once
```

Nếu thành công, bạn sẽ thấy:
```
✅ Google Drive API initialized successfully (Service Account)
📧 Service Account: servicetomnyson@b2bvegestable.iam.gserviceaccount.com
📁 Found X files in Google Drive
```

### Common Issues

#### Issue 1: "No files found"

**Nguyên nhân**: Service account chưa được share files/folders

**Fix**:
1. Check lại đã share folder chưa
2. Verify email chính xác: `servicetomnyson@b2bvegestable.iam.gserviceaccount.com`
3. Check quyền: Viewer hoặc Editor

#### Issue 2: "Service account file not found"

**Nguyên nhân**: File path không đúng

**Fix**:
```bash
# Check file tồn tại
ls -la service-account.json

# Check path in .env
cat .env | grep GOOGLE_SERVICE_ACCOUNT_FILE
# Should show: GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json
```

#### Issue 3: "Invalid grant"

**Nguyên nhân**: Service account bị disabled hoặc project bị xóa

**Fix**:
1. Verify project còn active: https://console.cloud.google.com
2. Verify service account còn active: https://console.cloud.google.com/iam-admin/serviceaccounts
3. Tạo service account mới nếu cần

## 🎯 Quick Start Summary

```bash
# 1. Share folder với service account
# Email: servicetomnyson@b2bvegestable.iam.gserviceaccount.com

# 2. Điền .env (chỉ cần 3 thứ)
# - GEMINI_API_KEY
# - SUPABASE_URL  
# - SUPABASE_KEY

# 3. Run!
npm run check       # Verify config
npm start once      # Test sync
npm start           # Run with cron
```

Đơn giản hơn nhiều so với OAuth2! 🎉

---

**Questions?** Create an issue on GitHub!


