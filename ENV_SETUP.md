# Environment Variables Setup Guide

## ⚠️ QUAN TRỌNG: Bảo Mật API Keys

**KHÔNG BAO GIỜ** commit file `.env` lên Git! File này chứa thông tin nhạy cảm như API keys.

## Cách Setup

### 1. Tạo file `.env`

File `.env` đã được tạo tự động với các giá trị hiện tại. Nếu chưa có, tạo file `.env` trong thư mục gốc của project:

```bash
# Windows PowerShell
New-Item -Path .env -ItemType File

# Linux/Mac
touch .env
```

### 2. Điền các giá trị vào `.env`

Mở file `.env` và điền các giá trị sau:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# CORS Configuration (nếu cần thay đổi)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://frontend:3000

# Frontend URLs (nếu cần thay đổi)
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_WS_URL=ws://localhost:8000/ws
```

### 3. Lấy API Keys

#### Gemini API Key:
1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập với Google account
3. Tạo API key mới hoặc copy API key hiện có
4. Paste vào `GEMINI_API_KEY` trong `.env`

#### Cloudinary Credentials:
1. Truy cập: https://cloudinary.com/console
2. Đăng nhập hoặc đăng ký tài khoản
3. Vào Dashboard → Settings
4. Copy các giá trị:
   - Cloud name → `CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

### 4. Restart Containers

Sau khi cập nhật `.env`, restart containers:

```bash
docker-compose down
docker-compose up -d --build
```

## Kiểm Tra

### Kiểm tra environment variables đã load chưa:

```bash
# Kiểm tra backend
docker exec queue_backend python -c "from app.core.config import settings; print('GEMINI_API_KEY:', 'SET' if settings.GEMINI_API_KEY else 'NOT SET')"

# Kiểm tra frontend
docker exec queue_frontend printenv | grep REACT_APP
```

## Troubleshooting

### Lỗi: "GEMINI_API_KEY not configured"

**Nguyên nhân:** File `.env` chưa có hoặc biến chưa được set.

**Giải pháp:**
1. Kiểm tra file `.env` có tồn tại không
2. Kiểm tra giá trị `GEMINI_API_KEY` có đúng không (không có khoảng trắng thừa)
3. Restart backend: `docker-compose restart backend`

### Lỗi: "API key not valid"

**Nguyên nhân:** API key không đúng hoặc đã bị revoke.

**Giải pháp:**
1. Kiểm tra lại API key trong `.env`
2. Tạo API key mới từ Google Cloud Console
3. Cập nhật `.env` và restart backend

### Lỗi: "CORS error"

**Nguyên nhân:** `CORS_ORIGINS` không bao gồm URL frontend.

**Giải pháp:**
1. Thêm URL frontend vào `CORS_ORIGINS` trong `.env`
2. Ví dụ: `CORS_ORIGINS=http://localhost:3000,http://192.168.1.100:3000`
3. Restart backend

## Best Practices

1. **Luôn dùng `.env` cho sensitive data:**
   - ✅ API keys
   - ✅ Database passwords
   - ✅ Secret keys
   - ❌ KHÔNG hardcode trong code
   - ❌ KHÔNG commit `.env` lên Git

2. **Tạo `.env.example` cho team:**
   - File này chứa template với placeholder values
   - Có thể commit lên Git
   - Team members copy và điền giá trị thực

3. **Validation:**
   - Backend sẽ log warning nếu API keys chưa được set
   - Features sẽ bị disable nếu thiếu required keys

4. **Production:**
   - Dùng secret management service (AWS Secrets Manager, Azure Key Vault, etc.)
   - Hoặc set environment variables trực tiếp trên hosting platform
   - Không dùng file `.env` trong production

## File Structure

```
queue-management-system/
├── .env                    # ⚠️ DO NOT COMMIT - Contains real API keys
├── .env.example            # ✅ Safe to commit - Template only
├── docker-compose.yml      # ✅ Uses ${VARIABLE} from .env
└── backend/
    └── app/
        └── core/
            └── config.py   # ✅ Reads from environment variables
```

## Migration từ Hardcoded Values

Nếu bạn đang migrate từ hardcoded values trong `docker-compose.yml`:

1. **Backup giá trị hiện tại:**
   ```bash
   # Copy từ docker-compose.yml
   GEMINI_API_KEY=AIzaSyBS33D0yduetuAklMPhfL4CFA_4hYkfd3g
   ```

2. **Tạo file `.env`** với các giá trị đó

3. **Xóa hardcoded values** khỏi `docker-compose.yml` (đã được refactor)

4. **Test:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

5. **Verify:**
   ```bash
   docker-compose logs backend | grep "Gemini AI service"
   ```


