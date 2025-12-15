# Database Cleanup Report

## 📋 Tổng Quan

Báo cáo này phân tích database schema và codebase để xác định các vấn đề cần cleanup.

---

## 🔴 Vấn Đề Nghiêm Trọng

### 1. **Schedule Tables Thiếu Trong Schema**

**Vấn đề:** Models có trong `models/schedule.py` nhưng **KHÔNG có tables trong `schema.sql`**:
- `shifts` ❌
- `staff_schedules` ❌
- `leave_requests` ❌
- `shift_exchanges` ❌
- `staff_checkins` ❌
- `staff_attendance` ❌

**Ảnh hưởng:** 
- Schedule features sẽ **KHÔNG hoạt động** khi chạy schema.sql
- Code đang dùng các models này nhưng database không có tables

**Giải pháp:** Thêm CREATE TABLE statements cho các schedule tables vào `schema.sql`

---

### 2. **Models Trùng Lặp và Không Đồng Bộ**

**Vấn đề:** Có **3 nơi định nghĩa models**:
1. `app/models.py` (file cũ, 521 dòng)
2. `app/models/` (package mới, đang dùng)
3. `app/domains/*/models.py` (cũ, không dùng)

**Models trùng lặp:**
- `User` - có trong cả 3 nơi
- `Department` - có trong cả 3 nơi
- `Service` - có trong cả 3 nơi
- `Shift`, `StaffSchedule`, etc. - có trong `models.py` và `models/schedule.py`

**Ảnh hưởng:**
- Dễ gây confusion
- Khó maintain
- Có thể gây import conflicts

**Giải pháp:** Xóa `app/models.py` và `app/domains/*/models.py`, chỉ giữ `app/models/`

---

## ⚠️ Vấn Đề Trung Bình

### 3. **Tables Trong Schema Nhưng Không Có Models**

Các tables này có trong `schema.sql` nhưng **KHÔNG có model trong `models/` package**:

#### a. `counters`
- **Status:** Có trong `models.py` (line 129) nhưng KHÔNG có trong `models/` package
- **Usage:** Được dùng trong raw SQL và relationships
- **Action:** Tạo `models/counter.py` hoặc xóa nếu không cần

#### b. `staff_performance`
- **Status:** KHÔNG có model, chỉ dùng raw SQL
- **Usage:** Được query trong `staff.py` và `roles/staff.py`
- **Action:** Tạo `models/staff_performance.py` hoặc tiếp tục dùng raw SQL

#### c. `service_form_fields`
- **Status:** Có trong `models.py` (line 109) nhưng KHÔNG có trong `models/` package
- **Usage:** Có relationship với Service
- **Action:** Tạo `models/service_form_field.py` hoặc xóa nếu không dùng

#### d. `activity_logs`
- **Status:** KHÔNG có model nào cả
- **Usage:** Có thể không được dùng
- **Action:** Tạo model hoặc xóa table nếu không cần

#### e. `staff_settings`
- **Status:** KHÔNG có model, chỉ dùng raw SQL
- **Usage:** Được query trong `staff.py` và `roles/staff.py`
- **Action:** Tạo `models/staff_setting.py` hoặc tiếp tục dùng raw SQL

#### f. `announcements`
- **Status:** Có trong `models.py` (line 275) nhưng KHÔNG có trong `models/` package
- **Usage:** Có thể không được dùng
- **Action:** Tạo `models/announcement.py` hoặc xóa nếu không dùng

---

### 4. **Code Dead/Unused**

#### `app/models/__init__.py` - Function `_import_models_from_file()`
- **Status:** Function phức tạp (200+ dòng) nhưng **KHÔNG được dùng**
- **Code:** Line 25-217
- **Action:** Xóa function này, chỉ giữ direct imports

---

## ✅ Đã Đúng

### Models Có Đầy Đủ:
- ✅ `User` → `users`
- ✅ `Department` → `departments`
- ✅ `Service` → `services`
- ✅ `QueueTicket` → `queue_tickets`
- ✅ `TicketComplaint` → `ticket_complaints`
- ✅ `Feedback` → `feedback`
- ✅ `StaffNotification` → `staff_notifications`
- ✅ `DailyLoginLog` → `daily_login_logs`
- ✅ `AIConversation` → `ai_conversations`
- ✅ `KnowledgeBaseCategory` → `knowledge_base_categories`
- ✅ `KnowledgeBaseArticle` → `knowledge_base_articles`
- ✅ `KnowledgeBaseAttachment` → `knowledge_base_attachments`
- ✅ `QRCode` → `qr_codes`
- ✅ `ServiceSession` → `service_sessions`

---

## 📝 Khuyến Nghị Cleanup

### Priority 1 (Quan Trọng - Phải Làm Ngay)

1. **Thêm Schedule Tables vào schema.sql**
   ```sql
   -- Thêm CREATE TABLE cho:
   - shifts
   - staff_schedules
   - leave_requests
   - shift_exchanges
   - staff_checkins
   - staff_attendance
   ```

2. **Xóa file `app/models.py`**
   - Tất cả models đã được chuyển sang `app/models/` package
   - File này chỉ gây confusion

3. **Xóa `app/domains/*/models.py`**
   - Không được dùng trong code hiện tại
   - Chỉ giữ `app/models/` package

### Priority 2 (Nên Làm)

4. **Tạo models cho tables thiếu:**
   - `models/counter.py` (nếu cần)
   - `models/staff_performance.py` (nếu muốn dùng ORM thay vì raw SQL)
   - `models/service_form_field.py` (nếu cần)
   - `models/activity_log.py` (nếu cần logging)
   - `models/staff_setting.py` (nếu muốn dùng ORM)
   - `models/announcement.py` (nếu cần)

5. **Cleanup `app/models/__init__.py`**
   - Xóa function `_import_models_from_file()` (200+ dòng không dùng)
   - Xóa `__getattr__` nếu không cần lazy loading

### Priority 3 (Có Thể Làm Sau)

6. **Kiểm tra và xóa unused tables:**
   - `activity_logs` - nếu không dùng logging
   - `announcements` - nếu không dùng feature này

7. **Standardize imports:**
   - Đảm bảo tất cả imports đều từ `app.models` package
   - Không import từ `app.models.py` nữa

---

## 🔧 Script Cleanup

### 1. Tạo Schedule Tables Migration

Tạo file `database/migrations/add_schedule_tables.sql`:

```sql
-- Add schedule tables to schema
-- Copy từ models/schedule.py definitions
```

### 2. Cleanup Models

```bash
# Xóa file cũ
rm app/models.py

# Xóa domains models (nếu không dùng)
rm -rf app/domains/*/models.py

# Cleanup __init__.py
# Xóa _import_models_from_file() function
```

---

## 📊 Tóm Tắt

| Loại | Số Lượng | Status |
|------|----------|--------|
| Models đúng | 15 | ✅ OK |
| Models thiếu | 6 | ⚠️ Cần tạo |
| Tables thiếu | 6 (schedule) | 🔴 Nghiêm trọng |
| Files trùng lặp | 3 locations | ⚠️ Cần cleanup |
| Dead code | 1 function | ⚠️ Cần xóa |

---

## ✅ Checklist Cleanup

- [ ] Thêm schedule tables vào schema.sql
- [ ] Xóa `app/models.py`
- [ ] Xóa `app/domains/*/models.py`
- [ ] Tạo models cho counters, staff_performance, etc. (nếu cần)
- [ ] Cleanup `app/models/__init__.py`
- [ ] Test lại toàn bộ imports
- [ ] Test database migration
- [ ] Update documentation

---

## 📌 Lưu Ý

- **Backup database** trước khi chạy migrations
- **Test kỹ** sau mỗi bước cleanup
- **Commit từng bước** để dễ rollback nếu cần

