# GHI CHÚ BÀI TEST

## Phạm vi đã hoàn thành

Tôi chủ động dừng ở **mốc 2** để ưu tiên độ chắc chắn của luồng core thay vì chạm nhiều mốc nhưng không hoàn thiện.

### Mốc 1 — Đề xuất ý tưởng

- Hoàn thiện `/studio/de-xuat` với mặc định 10 ý tưởng mỗi lượt.
- Ý tưởng chỉ được neo vào `content_pillars` và `personas` có thật trong workspace; tên mô hình bịa ra bị hạ về `null` và loại trước khi lưu.
- Phân bổ theo `ti_le_muc_tieu` bằng largest remainder; phần khám phá được cap ở 20% mà không phá quota trụ cột.
- Đọc insight, sản phẩm, lịch sử bài đã đăng của kênh mình và dữ liệu kênh đang follow.
- Với kênh follow, bài gốc chỉ được dùng ở bước bóc công thức. Prompt đề xuất chỉ nhận topic/công thức kể chuyện, không nhận nguyên văn bài người khác.
- Nếu một ý tưởng thực sự dùng nguồn tham khảo, lưu đúng `trendSignalId` và hiển thị link nguồn tương ứng.
- Ý tưởng sinh ra được persist để dùng tiếp ở bước biên soạn.

### Mốc 2 — Biên soạn bài đăng

- Hoàn thiện `/studio/bien-soan`.
- Chọn một ý tưởng đã lưu -> gọi `chayNhiemVu('viet-bai')` -> persist thành `contents` với trạng thái `ban_nhap` -> reload từ DB.
- Prompt nhận brand profile, trụ cột, persona, danh sách sản phẩm, insight và lịch sử góc/hook gần đây.
- Prompt yêu cầu fail-safe về facts: không tự bịa giá, kết quả, feedback, case study, tính năng hay ưu đãi ngoài dữ liệu.
- User có thể chỉnh nội dung trong textarea rồi lưu lại; server chỉ cho sửa content thuộc workspace hiện tại, trạng thái `ban_nhap`, dạng bài chữ.
- Generation tương tác dùng `khoaChongTrung: null` để mỗi lần user chủ động bấm có thể tạo một candidate mới thay vì bị reuse job cũ theo hash.

## Quyết định kỹ thuật đáng chú ý

### 1. Không thêm API trend/competitor bên ngoài

Brief đã seed sẵn insight, persona, lịch sử bài và `trend_signals`. Tôi coi đây là source of truth của bài test và không thêm SerpApi/Tavily/Google Trends vì sẽ tăng dependency, latency và scope nhưng không tăng điểm cho requirement hiện tại.

### 2. Không đưa nguyên văn bài của kênh follow vào prompt sinh ý tưởng

Tôi tách hai bước:

`raw followed post -> bóc công thức/chủ đề -> idea generation`

Nhờ vậy model học cách kể/chủ đề nhưng không có raw text để vô tình sao chép. Provenance được giữ bằng ID nguồn thật, không dựa vào model tự kể tên nguồn.

### 3. Workspace isolation nằm ở data-access

Studio chỉ đọc/ghi thông qua `createRepo(workspaceId)` / `trongGiaoDich(workspaceId)`. Không có query DB trực tiếp từ page/server action.

### 4. Persistence của title và exploration flag

Schema gốc ghi rõ phần core đã frozen, trong khi mốc 1 cần lưu đủ `tieuDe` và `khamPha`. Tôi thêm migration `0009_studio_idea_persistence.sql` và giữ read/write của hai field bổ sung trong `lib/data-access/ideas.ts`, thay vì để UI/business layer biết tên cột vật lý.

## Phần chưa làm và lý do

- **Mốc 3 — kịch bản quay:** chưa làm. Tôi ưu tiên mốc 1–2 chạy xuyên suốt trước, đúng tinh thần brief: dừng ở mốc 2 chắc chắn tốt hơn chạm cả 5 mốc nhưng không cái nào hoàn thiện.
- **Mốc 4 — sinh hàng loạt 10 bài/ngày:** chưa làm. Đây là orchestration trên core mốc 1–2; chỉ nên thêm sau khi single-item flow đã được chạy thật ổn định.
- **Mốc 5 — sinh ảnh:** chưa làm. Có thêm API/cost/storage/error handling riêng, không phải dependency để chứng minh core flow.
- Chưa thêm deterministic post-generation word-count repair; hiện word range được ép ở prompt theo bề mặt. Nếu có thêm thời gian, tôi sẽ validate số từ sau generation và retry/repair có giới hạn thay vì tin prompt tuyệt đối.

## Kiểm trước khi nộp

Chạy lại đúng ba lệnh trong README trên môi trường nộp bài:

```bash
npx tsc --noEmit
node --test tests/
npm run build
```

Không hard-code API key hoặc secret vào repository.
