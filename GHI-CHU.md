# GHI CHÚ BÀI TEST

## Phạm vi đã hoàn thành

Tôi hoàn thiện **Mốc 1–4** theo đúng thứ tự của đề và hoàn thiện thêm hai route trong full scope là **`/studio/chuoi-bai`** và **`/studio/so-giong`**. Mốc 5 (sinh ảnh) **không được claim là hoàn thành**: API key dùng cho môi trường demo chỉ chạy được text model và image endpoint trả lỗi quota/quyền. Tôi bỏ nút gọi image provider bị hỏng thay vì để một feature luôn báo lỗi; content brief vẫn giữ art direction dạng text.

### Mốc 1 — Đề xuất ý tưởng

- `/studio/de-xuat` sinh mặc định 10 ý tưởng mỗi lượt.
- Ý tưởng chỉ neo vào `content_pillars` và `personas` có thật; tên model bịa ra bị hạ về `null` và loại trước persistence.
- Tên canonical không dấu trong seed được match accent-insensitive nhưng không fuzzy/semantic matching; UI có thể hiển thị nhãn tiếng Việt có dấu.
- Phân bổ theo `ti_le_muc_tieu` bằng largest remainder; exploration cap 20%.
- `beMat` luôn lấy từ request phía server, không tin model tự đổi.
- Dữ liệu kênh follow đi qua `raw post -> bóc công thức/chủ đề -> idea generation`; prompt idea không nhận raw text bài gốc.
- Ý tưởng dùng tham khảo lưu đúng `trendSignalId` để mở lại nguồn.
- Mỗi idea có summary, content brief chi tiết và art direction text.

### Mốc 2 — Biên soạn bài đăng

- `/studio/bien-soan`: idea -> `chayNhiemVu('viet-bai')` -> validate -> persist `contents` trạng thái `ban_nhap` -> chỉnh sửa/lưu lại.
- Prompt chỉ dùng profile/pillar/persona/product/insight/history làm facts; cấm bịa giá, kết quả, feedback, case study, tính năng và ưu đãi.
- Word range theo từng bề mặt lấy từ cùng source of truth `KHOANG_TU_BE_MAT` và được kiểm lại bằng code trước persistence.
- Core sinh bài được tách thành `sinhBanVietTuIdea()` để M2, chuỗi bài và so bốn giọng dùng chung parser/fact-safety/word-range thay vì copy logic.

### Mốc 3 — Kịch bản quay video

- `/studio/kich-ban`: một idea -> kịch bản `phanCanh[]` gồm `thoiLuongGiay`, `hinhAnh`, `loiThoai`.
- Prompt yêu cầu 4–7 cảnh, mục tiêu 20–60 giây, hook ở đầu và một CTA cuối.
- Parser kiểm lại structure/time trước persistence; output sai không được lưu.
- Kịch bản lưu vào `contents` với `dang_bai = kich_ban_quay`, `trang_thai = ban_nhap` dưới dạng JSON versioned; UI sửa từng cảnh và lưu lại.

### Mốc 4 — Sinh hàng loạt 10 bài/ngày

- `/studio/hang-loat` mặc định 10 bài, hard cap 10 mỗi lượt.
- Ưu tiên idea chưa dùng đúng bề mặt; thiếu thì top-up qua chính `deXuatYTuong()`.
- Mỗi item đi qua `bienSoanBai()` riêng, nên giữ nguyên fact-safety, word-range, workspace isolation và persistence contract của M2.
- Enqueue song song nhưng worker-model vẫn là nơi giữ concurrency cap; không tạo concurrency mechanism thứ hai.
- Batch dùng partial-success semantics: bài tốt được giữ, bài lỗi không persist và không rollback các bài tốt khác.

### Full scope — Chuỗi bài

- `/studio/chuoi-bai` sinh 2–5 bài từ một idea.
- Model calls chạy **tuần tự có chủ ý**: bài N nhận tiêu đề + tóm tắt các bài 1…N-1 qua `mach`, vì vậy có thể nối ý và tránh lặp hook/nội dung.
- Chỉ khi toàn chuỗi qua parse + word-range mới persist trong một transaction.
- Các bài dùng cùng `chuoi_id` + `thu_tu_trong_chuoi`; không lạm dụng `parent_content_id` vì cột đó mang nghĩa “cùng nội dung trên nhiều bề mặt”.
- `contents.listTheoChuoi()` luôn scope bằng `workspace_id` và trả đúng thứ tự.

### Full scope — So bốn giọng

- `/studio/so-giong` giữ nguyên một idea + facts rồi sinh bốn biến thể Fanpage / hồ sơ cá nhân / TikTok / Zalo.
- Chỉ thay `bienThe` và word range của system prompt; không mutate/persist idea, nên màn này thực sự so “khác bề mặt” chứ không so bốn chủ đề khác nhau.
- Mỗi biến thể vẫn đi qua `sinhBanVietTuIdea()` và validation như M2; một biến thể lỗi được hiển thị riêng thay vì làm mất các biến thể còn lại.

## Quyết định kỹ thuật đáng chú ý

### 1. Không đưa nguyên văn bài của kênh follow vào prompt sinh ý tưởng

Tôi tách `raw followed post -> formula/topic -> idea generation`. Model học cách kể nhưng không có raw text để vô tình sao chép; provenance giữ bằng ID nguồn thật.

### 2. Workspace isolation nằm ở data-access

Studio chỉ đọc/ghi business data qua `createRepo(workspaceId)` / `trongGiaoDich(workspaceId)`. Các route mới không import `db/client` và không tự viết SQL ngoài `lib/data-access/`.

### 3. Không tin prompt cho invariant deterministic

Pillar/persona, surface, word range, scene shape/duration đều được kiểm bằng code. Prompt định hướng model; code mới là cửa cuối trước persistence.

### 4. Mốc 4 là orchestration, không phải model contract mới

Không dùng prompt “hãy viết 10 bài”. Batch reuse M1 + M2 để mỗi item vẫn có validation riêng và một item lỗi không phá cả lượt.

### 5. Chuỗi bài sinh tuần tự thay vì `Promise.all`

Nếu chạy song song thì bài sau không thể biết bài trước vừa nói gì. Chi phí latency được chấp nhận để đổi lấy đúng requirement “nối mạch, không lặp ý bài trước”.

### 6. Không ship image generation không chạy được

Mốc 5 yêu cầu sinh ảnh thật. API key dùng để demo không có quota/quyền image generation, nên tôi không coi placeholder/art-direction là hoàn thành Mốc 5. Path gọi image provider và nút luôn báo lỗi được loại khỏi bản nộp; art direction text vẫn ở brief vì nó hữu ích và không phụ thuộc provider.

## Phần chưa làm và lý do

- **Mốc 5 — sinh ảnh:** chưa làm trong bản nộp cuối vì provider credential của môi trường demo không hỗ trợ image generation. Đây là giới hạn external dependency, không được che bằng mock/fake image trong video.

## Kiểm trước khi nộp

Chạy đúng ba gate:

```bash
npx tsc --noEmit
node --test tests/
npm run build
```

Sau đó smoke-test bằng Gemini text thật: idea -> biên soạn -> kịch bản -> batch nhỏ -> chuỗi 2–3 bài -> so 4 giọng. Mốc ảnh được trình bày rõ là chưa hoàn thành.

Không hard-code API key hoặc secret vào repository.
