# GHI CHÚ BÀI TEST

## Phạm vi đã hoàn thành

Tôi hoàn thiện luồng core đến **mốc 4** và mở rộng thêm một lát cắt nhỏ của **mốc 5** theo kiểu on-demand. Tôi không coi mốc 5 là hoàn thành: ảnh hiện phục vụ preview cho một brief được chọn, chưa có batch generation hay lifecycle asset đầy đủ.

### Mốc 1 — Đề xuất ý tưởng

- Hoàn thiện `/studio/de-xuat` với mặc định 10 ý tưởng mỗi lượt.
- Ý tưởng chỉ được neo vào `content_pillars` và `personas` có thật trong workspace; tên mô hình bịa ra bị hạ về `null` và loại trước khi lưu.
- Tên canonical trong seed có thể không dấu; UI được phép giữ nhãn tiếng Việt có dấu khi sau normalization vẫn khớp đúng entity canonical. Không dùng fuzzy/semantic matching.
- Phân bổ theo `ti_le_muc_tieu` bằng largest remainder; phần khám phá được cap ở 20% mà không phá quota trụ cột.
- `beMat` của kết quả luôn lấy từ request phía server, không tin model tự đổi bề mặt.
- Đọc insight, sản phẩm, lịch sử bài đã đăng của kênh mình và dữ liệu kênh đang follow.
- Với kênh follow, bài gốc chỉ được dùng ở bước bóc công thức. Prompt đề xuất chỉ nhận topic/công thức kể chuyện, không nhận nguyên văn bài người khác.
- Nếu một ý tưởng thực sự dùng nguồn tham khảo, lưu đúng `trendSignalId` và hiển thị link nguồn tương ứng.
- Mỗi ý tưởng có summary để scan nhanh và `briefChiTiet` khoảng 900–1100 ký tự để writer có thể triển khai tiếp mà chưa biến thành full post.
- Mỗi brief có art direction có cấu trúc (`moTa`, `boCuc`, `phongCach`, `prompt`) và vẫn tuân thủ fact-safety, không tự bịa số liệu/case study/logo.
- Ý tưởng sinh ra được persist để dùng tiếp ở bước biên soạn. Các field brief/art-direction hiện là enrichment của response Mốc 1, chưa mở rộng schema persistence chỉ để phục vụ preview.

### Mốc 2 — Biên soạn bài đăng

- Hoàn thiện `/studio/bien-soan`.
- Chọn một ý tưởng đã lưu -> gọi `chayNhiemVu('viet-bai')` -> persist thành `contents` với trạng thái `ban_nhap` -> reload từ DB.
- Prompt nhận brand profile, trụ cột, persona, danh sách sản phẩm, insight và lịch sử góc/hook gần đây.
- Prompt yêu cầu fail-safe về facts: không tự bịa giá, kết quả, feedback, case study, tính năng hay ưu đãi ngoài dữ liệu.
- Word range theo từng bề mặt được lấy từ `KHOANG_TU_BE_MAT` và kiểm lại bằng code sau generation; output sai range không được persist.
- Headline do model sinh được đặt trong chính draft editable, nên không mất sau redirect/reload và không cần thêm schema chỉ để giữ UI state.
- User có thể chỉnh nội dung trong textarea rồi lưu lại; server chỉ cho sửa content thuộc workspace hiện tại, trạng thái `ban_nhap`, dạng bài chữ.
- Generation tương tác dùng `khoaChongTrung: null` để mỗi lần user chủ động bấm có thể tạo một candidate mới thay vì bị reuse job cũ theo hash.

### Mốc 3 — Kịch bản quay video

- Hoàn thiện `/studio/kich-ban` và thêm entry `Kịch bản quay` trong sidebar.
- Chọn một idea đã lưu -> gọi đúng task `chayNhiemVu('viet-kich-ban')` -> nhận `tieuDe` + mảng `phanCanh` có `thoiLuongGiay`, `hinhAnh`, `loiThoai`.
- Prompt buộc output là phân cảnh thay vì đoạn văn: 4–7 cảnh, mục tiêu 20–60 giây, cảnh đầu đi thẳng vào hook và cảnh cuối chỉ có một CTA.
- Prompt chỉ dùng idea + brand profile + pillar + persona + sản phẩm + insight làm facts. Không tự bịa giá, phần trăm, kết quả, feedback, case study, tính năng hay ưu đãi.
- Parser ở tầng code kiểm lại cấu trúc trước persistence: 3–8 cảnh, mỗi cảnh có thời lượng/hình ảnh/lời thoại, thời lượng từng cảnh 1–30 giây và tổng 10–120 giây. Output sai không được lưu.
- Kịch bản được persist vào `contents` với `dang_bai = kich_ban_quay`, `trang_thai = ban_nhap`; không thêm schema riêng chỉ để giữ một JSON phân cảnh đã có chỗ lưu phù hợp.
- UI hiển thị timeline cảnh, tổng thời lượng và cho sửa trực tiếp thời lượng, hướng hình ảnh, lời thoại rồi lưu lại.
- Server chỉ cho sửa content thuộc workspace hiện tại, trạng thái `ban_nhap` và đúng `dang_bai = kich_ban_quay`.

### Mốc 4 — Sinh hàng loạt 10 bài/ngày

- Hoàn thiện `/studio/hang-loat` với mặc định 10 bài và giới hạn tối đa 10 bài mỗi lượt.
- Batch ưu tiên các idea chưa dùng mới nhất đúng bề mặt user chọn. Nếu thiếu idea, hệ thống gọi lại `deXuatYTuong()` để tự bù phần thiếu rồi mới bắt đầu viết.
- Mỗi bài vẫn đi qua `bienSoanBai()` riêng thay vì có một prompt batch mới, nên giữ nguyên fact-safety, word-range validation, provenance và workspace isolation của Mốc 2.
- Các job được enqueue đồng thời, còn giới hạn thực thi model vẫn do worker-model hiện có quản lý; không tạo thêm một concurrency mechanism thứ hai trong UI/business layer.
- Output sai JSON/word range được retry đúng một lần ở orchestration layer. Lỗi provider/queue/timeout không bị retry nóng vì queue đã có backoff riêng.
- Batch dùng partial-success semantics: bài thành công được persist và giữ lại, bài lỗi không được persist. Một bài lỗi không rollback chín bài hợp lệ khác.
- UI hiển thị số bài thành công, số bài chưa đạt, số idea tự bù và link mở từng draft sang `/studio/bien-soan` để chỉnh tiếp.
- Query `content` sau batch chỉ được resolve lại qua `createRepo(workspaceId)`, nên ID từ workspace khác không thể được dùng để hiển thị draft chéo tenant.

### Mốc 5 — lát cắt sinh ảnh on-demand

- Mỗi brief có nút `Tạo ảnh minh hoạ`; không sinh 10 ảnh cùng lúc để tránh biến latency/quota ảnh thành dependency của Mốc 1.
- Server dùng `GEMINI_API_KEY` và image model riêng, độc lập với `AI_MODEL` text.
- Ảnh trả về được lưu trong kho media theo prefix workspace và chỉ đọc lại qua route `/api/media/...` đã kiểm session/workspace/path traversal.
- Prompt ảnh được bọc thêm guard: không chèn logo, phần trăm, số liệu hay bằng chứng kinh doanh không có thật.
- Nếu image API lỗi/quota hết, 10 idea và brief vẫn còn nguyên; lỗi ảnh chỉ nằm ở card được bấm.

## Quyết định kỹ thuật đáng chú ý

### 1. Không thêm API trend/competitor bên ngoài

Brief đã seed sẵn insight, persona, lịch sử bài và `trend_signals`. Tôi coi đây là source of truth của bài test và không thêm SerpApi/Tavily/Google Trends vì sẽ tăng dependency, latency và scope nhưng không tăng điểm cho requirement hiện tại.

### 2. Không đưa nguyên văn bài của kênh follow vào prompt sinh ý tưởng

Tôi tách hai bước:

`raw followed post -> bóc công thức/chủ đề -> idea generation`

Nhờ vậy model học cách kể/chủ đề nhưng không có raw text để vô tình sao chép. Provenance được giữ bằng ID nguồn thật, không dựa vào model tự kể tên nguồn.

### 3. Workspace isolation nằm ở data-access

Studio chỉ đọc/ghi business data thông qua `createRepo(workspaceId)` / `trongGiaoDich(workspaceId)`. Ảnh sinh on-demand dùng kho media workspace-scoped và route đọc media tự kiểm workspace của session.

### 4. Persistence của title và exploration flag

Schema gốc ghi rõ phần core đã frozen, trong khi mốc 1 cần lưu đủ `tieuDe` và `khamPha`. Tôi thêm migration `0009_studio_idea_persistence.sql` và giữ read/write của hai field bổ sung trong `lib/data-access/ideas.ts`, thay vì để UI/business layer biết tên cột vật lý.

### 5. Không tin prompt cho invariant đo được bằng code

Độ dài bài đăng và cấu trúc kịch bản là invariant deterministic nên được kiểm sau khi model trả về. Nếu output ngoài contract, hệ thống fail explicit và không persist candidate sai. Với content brief ~1000 ký tự, tôi dùng target mềm trong prompt vì đây là enrichment cho writer, không phải publishing contract.

### 6. Kịch bản dùng `contents` thay vì thêm bảng riêng

`contents` đã có `dang_bai = kich_ban_quay`, `idea_id`, trạng thái draft và các trường provenance nghiệp vụ. Tôi lưu JSON phân cảnh có version vào `noi_dung` thay vì thêm bảng/schema chỉ để đi qua Mốc 3. UI luôn parse/validate lại trước khi render và trước khi save, nên vẫn giữ được cấu trúc mà không nhân đôi persistence model.

### 7. Mốc 4 là orchestration, không phải một model contract mới

Tôi không tạo một prompt “hãy viết 10 bài” vì như vậy validation của Mốc 2 sẽ khó áp riêng cho từng item và một output lỗi có thể làm hỏng cả batch. Mốc 4 chỉ điều phối Mốc 1 + Mốc 2: top-up idea khi thiếu, enqueue từng bài, giữ worker concurrency hiện có và thu kết quả theo partial-success. Cách này ít code mới hơn nhưng giữ được các invariant đã chứng minh ở single-item flow.

### 8. Sinh ảnh theo yêu cầu thay vì eager batch

Một lượt idea có 10 brief. Nếu đồng thời gọi 10 image requests, Mốc 1 sẽ chậm, tốn quota và fail theo provider ảnh dù phần idea đã đúng. Vì vậy ảnh chỉ sinh khi user chọn một brief cần xem visual. Đây là trade-off cố ý để core flow vẫn độc lập với image provider.

## Phần chưa làm và lý do

- **Mốc 5 — sinh ảnh đầy đủ:** chưa hoàn thành. Đã có on-demand preview + storage workspace-scoped, nhưng chưa persist quan hệ ảnh ↔ idea/content, chưa có regenerate history, moderation/review workflow, batch image generation hay cleanup policy cho asset cũ.

## Kiểm trước khi nộp

Chạy lại đúng ba lệnh trong README trên môi trường nộp bài:

```bash
npx tsc --noEmit
node --test tests/
npm run build
```

Sau đó chạy một lượt Gemini thật cho các vertical slice chính: sinh idea, biên soạn bài, tạo một kịch bản quay và chạy `/studio/hang-loat` với một batch nhỏ trước khi thử đủ 10 bài. Ảnh là best-effort vì phụ thuộc quota riêng của image model.

Không hard-code API key hoặc secret vào repository.
