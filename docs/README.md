# RAG Google Drive to Supabase Vector Storage

🚀 Tự động đồng bộ và lưu trữ các file từ Google Drive vào Supabase với vector embeddings sử dụng Gemini AI.

## ✨ Tính năng

- 📁 Tự động đọc tất cả file PDF và Word từ Google Drive
- 🤖 Sử dụng Gemini AI để tạo embeddings và tóm tắt văn bản
- 💾 Lưu trữ vào Supabase với khả năng tìm kiếm vector similarity
- ⏰ Cron job tự động đồng bộ theo lịch
- 🔄 Chỉ cập nhật file đã thay đổi (incremental sync)
- 📊 Thống kê chi tiết sau mỗi lần sync

## 📋 Yêu cầu

- Node.js >= 18.x
- Tài khoản Google Cloud với Drive API enabled
- Tài khoản Gemini AI (Google AI Studio)
- Tài khoản Supabase

## 🔧 Cài đặt

### 1. Clone và cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình Google Drive API

#### 2.1. Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable **Google Drive API**:
   - Vào "APIs & Services" > "Library"
   - Tìm "Google Drive API" và click Enable

#### 2.2. Tạo OAuth2 Credentials

1. Vào "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Chọn application type: **Desktop app** hoặc **Web application**
4. Nếu chọn Web application, thêm redirect URI: `http://localhost:3000/oauth2callback`
5. Download credentials hoặc copy Client ID và Client Secret

#### 2.3. Lấy Refresh Token

Tạo file `.env` từ `env.sample`:

```bash
cp env.sample .env
```

Điền `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` vào file `.env`, sau đó chạy:

```bash
node setup-oauth.js
```

Làm theo hướng dẫn:
1. Mở link được hiển thị trong trình duyệt
2. Đăng nhập và cho phép quyền truy cập
3. Copy authorization code từ URL
4. Paste vào terminal
5. Copy `GOOGLE_REFRESH_TOKEN` vào file `.env`

### 3. Cấu hình Gemini AI

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Tạo API key mới
3. Copy API key vào file `.env` (`GEMINI_API_KEY`)

### 4. Cấu hình Supabase

#### 4.1. Tạo Supabase Project

1. Truy cập [Supabase](https://supabase.com/)
2. Tạo project mới
3. Lấy Project URL và anon key từ Settings > API

#### 4.2. Setup Database

**Nếu bạn đã có table `knowledge_base`**: Không cần làm gì, code đã được cấu hình để sử dụng table hiện tại của bạn.

**Nếu chưa có table**: 
1. Vào SQL Editor trong Supabase dashboard
2. Copy toàn bộ nội dung file `supabase-setup-knowledge-base.sql`
3. Paste và chạy SQL script
4. Verify rằng table `knowledge_base` đã được tạo

#### 4.3. Cấu hình .env

Điền thông tin Supabase vào `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

### 5. File .env hoàn chỉnh

File `.env` của bạn sẽ trông như thế này:

```env
# Google Drive API
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
GOOGLE_REFRESH_TOKEN=your_refresh_token

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key

# Cron Schedule (mặc định: 2 giờ sáng mỗi ngày)
CRON_SCHEDULE=0 2 * * *

# Optional: Google Drive folder ID (để sync một folder cụ thể)
DRIVE_FOLDER_ID=

# Optional: Teacher ID và User ID cho knowledge_base table
TEACHER_ID=
USER_ID=
```

## 🚀 Sử dụng

### Chạy sync một lần

```bash
npm start once
```

### Chạy cron job (tự động sync theo lịch)

```bash
npm start
```

Cron job sẽ:
- Chạy sync ngay lập tức khi khởi động
- Tự động chạy theo lịch đã cấu hình trong `CRON_SCHEDULE`

### Development mode (auto-reload)

```bash
npm run dev
```

## ⏰ Cấu hình Cron Schedule

Format: `minute hour day month weekday`

Ví dụ:
- `0 2 * * *` - Chạy lúc 2 giờ sáng mỗi ngày
- `0 */6 * * *` - Chạy mỗi 6 giờ
- `0 9 * * 1` - Chạy lúc 9 giờ sáng thứ 2 hàng tuần
- `*/30 * * * *` - Chạy mỗi 30 phút

## 📁 Cấu trúc project

```
rag-google-driver/
├── src/
│   ├── config/
│   │   └── index.js           # Configuration management
│   ├── services/
│   │   ├── googleDrive.js     # Google Drive API integration
│   │   ├── gemini.js          # Gemini AI integration
│   │   ├── supabase.js        # Supabase client
│   │   └── fileProcessor.js   # PDF & Word processing
│   └── sync.js                # Main sync logic
├── index.js                   # Entry point with cron scheduler
├── setup-oauth.js             # OAuth2 setup helper
├── supabase-setup.sql         # Database schema
├── package.json
├── .env                       # Environment variables (create this)
├── env.sample                 # Environment template
└── README.md
```

## 🔍 Tìm kiếm Vector Similarity

Sau khi sync xong, bạn có thể tìm kiếm documents tương tự bằng script có sẵn:

```bash
npm run search "your search query"
```

Ví dụ:
```bash
npm run search "machine learning algorithms"
npm run search "hợp đồng thuê nhà"
```

Hoặc sử dụng trực tiếp trong code (xem `search-example.js` để biết chi tiết).

## 📊 Database Schema

Table `knowledge_base`:
- `id` (uuid) - Primary key
- `teacher_id` (uuid) - ID của giáo viên (optional, foreign key to auth.users)
- `user_id` (uuid) - ID của user (optional)
- `title` (text) - Tiêu đề document
- `content` (text) - Nội dung văn bản đầy đủ
- `file_name` (text) - Tên file gốc
- `file_path` (text) - Đường dẫn file (optional)
- `file_url` (text) - Link xem file trên Google Drive
- `file_type` (text) - Loại file (pdf, docx, doc, google-doc)
- `embedding` (jsonb[]) - Vector embeddings (768 dimensions)
- `metadata` (jsonb) - Metadata bổ sung (size, mimeType, etc.)
- `chunk_index` (numeric) - Index của chunk (mặc định 0)
- `created_at` (timestamp) - Thời gian tạo trong DB
- `updated_at` (timestamp) - Thời gian cập nhật

## 🎯 Các file được hỗ trợ

- ✅ PDF (`.pdf`)
- ✅ Word Document (`.docx`)
- ✅ Word Document Legacy (`.doc`)
- ✅ Google Docs

## 🐛 Troubleshooting

### Lỗi authentication Google Drive

```bash
# Xóa token cũ và tạo lại
rm token.json
node setup-oauth.js
```

### Lỗi rate limiting

- Gemini API có giới hạn requests. Script đã có delay giữa các requests
- Nếu cần, tăng delay trong `src/sync.js`

### Lỗi Supabase connection

- Kiểm tra SUPABASE_URL và SUPABASE_KEY
- Verify rằng bạn đã chạy SQL setup script
- Kiểm tra RLS policies nếu bật Row Level Security

### File không có text

- Một số PDF scan hoặc file ảnh không thể extract text
- File sẽ bị skip tự động

## 🔐 Bảo mật

- ⚠️ **KHÔNG** commit file `.env` vào git
- Sử dụng Supabase RLS (Row Level Security) cho production
- Rotate API keys định kỳ
- Giới hạn OAuth scopes chỉ read-only

## 📈 Performance Tips

1. **Batch Processing**: Script xử lý từng file một để tránh rate limits
2. **Incremental Sync**: Chỉ sync file đã thay đổi
3. **Caching**: File đã sync sẽ không sync lại trừ khi có thay đổi
4. **Chunk Size**: Adjust chunk size trong `gemini.js` nếu cần

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - xem file LICENSE để biết thêm chi tiết

## 🆘 Support

Nếu gặp vấn đề, hãy tạo issue trên GitHub hoặc liên hệ.

## 🎉 Credits

- [Google Drive API](https://developers.google.com/drive)
- [Google Gemini AI](https://ai.google.dev/)
- [Supabase](https://supabase.com/)
- [pgvector](https://github.com/pgvector/pgvector)

---

Made with ❤️ for RAG applications

