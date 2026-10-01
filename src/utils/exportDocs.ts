import { TeacherMaterial } from '../types';

/**
 * Triggers a file download in the browser given content, mimeType, and filename.
 */
function downloadFile(content: string, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a beautifully formatted Microsoft Word (.doc) Worksheet
 * for Grade 5 Vietnamese students based strictly on the Unit's learning materials.
 */
export function exportUnitToWord(unit: TeacherMaterial) {
  const branchesHtml = (unit.mindmap?.branches || [])
    .map(
      (b) => `
    <tr>
      <td style="border:1px solid #cbd5e1; padding:8px; font-weight:bold; background-color:#f1f5f9; width:30%;">
        ${b.title}
      </td>
      <td style="border:1px solid #cbd5e1; padding:8px;">
        <div><strong>Từ & Cụm từ:</strong> ${b.items?.join(', ') || 'N/A'}</div>
        ${b.simpleExplanation ? `<div style="font-size:11px; color:#64748b; margin-top:4px;"><em>Giải thích:</em> ${b.simpleExplanation}</div>` : ''}
      </td>
    </tr>`
    )
    .join('');

  const s1QuestionsHtml = (unit.section1Questions || [])
    .map(
      (q, idx) => `
    <div style="margin-bottom:12px;">
      <p style="margin:0; font-weight:bold; color:#1e293b;">
        Câu ${idx + 1}: ${q.question}
      </p>
      <p style="margin:2px 0 6px 0; font-size:12px; color:#64748b;">
        <em>Gợi ý: ${q.expectedHint}</em>
      </p>
      <div style="border-bottom:1px dotted #94a3b8; height:24px; margin-bottom:4px;"></div>
      <div style="border-bottom:1px dotted #94a3b8; height:24px;"></div>
    </div>`
    )
    .join('');

  const expressionsHtml = (unit.usefulExpressions || [])
    .map(
      (exp, idx) => `
    <tr>
      <td style="border:1px solid #cbd5e1; padding:6px 10px; width:45px; text-align:center; font-weight:bold; color:#7c3aed;">
        ${idx + 1}
      </td>
      <td style="border:1px solid #cbd5e1; padding:6px 10px; font-weight:bold; color:#0f172a;">
        ${exp.english}
      </td>
      <td style="border:1px solid #cbd5e1; padding:6px 10px; color:#475569; font-size:12px;">
        ${exp.vietnameseGuide || 'Luyện tập phát âm trôi chảy'}
      </td>
      <td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center; width:80px; font-size:12px; color:#059669;">
        [  ] Đã đọc
      </td>
    </tr>`
    )
    .join('');

  const practiceHtml = (unit.practiceLevels || [])
    .map(
      (p) => `
    <div style="margin-bottom:12px; padding:10px; background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:6px;">
      <div style="font-weight:bold; color:#2563eb; font-size:13px;">
        Level ${p.levelNumber}: ${p.badgeTitle} (${p.levelName})
      </div>
      <p style="margin:4px 0; color:#1e293b;"><strong>🤖 AI Buddy hỏi:</strong> "${p.buddyPrompt}"</p>
      <p style="margin:2px 0; color:#059669; font-size:12px;"><strong>🗣️ Gợi ý câu trả lời của em:</strong> "${p.sampleStudentAnswer}"</p>
      <div style="border-bottom:1px dotted #94a3b8; height:22px; margin-top:6px;"></div>
    </div>`
    )
    .join('');

  const wordContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Phiếu Bài Tập Rèn Nói Tiếng Anh - ${unit.unitNumber}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Times New Roman', 'Arial', sans-serif;
      font-size: 13pt;
      line-height: 1.4;
      color: #000;
      margin: 20px;
    }
    h1, h2, h3, h4 {
      font-family: 'Arial', sans-serif;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    .header-table td {
      vertical-align: top;
      padding: 4px;
    }
    .rubric-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .rubric-table th, .rubric-table td {
      border: 1px solid #333;
      padding: 6px 8px;
      font-size: 11pt;
    }
    .rubric-table th {
      background-color: #f1f5f9;
      text-align: center;
    }
    .badge {
      background-color: #ec4899;
      color: #fff;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10pt;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <!-- Top School & Student Info Header -->
  <table class="header-table">
    <tr>
      <td style="width:55%;">
        <div style="font-weight:bold; font-size:12pt; text-transform:uppercase;">TRƯỜNG TIỂU HỌC: ....................................................</div>
        <div style="font-size:11pt; color:#475569;">Tổ Chuyên Môn Tiếng Anh Lớp 5</div>
        <div style="font-size:10pt; color:#6b21a8; font-weight:bold; margin-top:2px;">Designed by Tím • E-SMART ENGLISH KIDS</div>
      </td>
      <td style="width:45%; text-align:right;">
        <div style="font-weight:bold; font-size:12pt;">Họ và tên: ....................................................</div>
        <div style="font-size:11pt;">Lớp: 5...... &nbsp;&nbsp;&nbsp;&nbsp; Ngày: ...... / ...... / 202...</div>
        <div style="font-size:10pt; color:#059669; font-weight:bold; margin-top:2px;">Phiếu Rèn Luyện Kỹ Năng Nói</div>
      </td>
    </tr>
  </table>

  <hr style="border:1px solid #7c3aed; margin-bottom:15px;" />

  <!-- Main Worksheet Title -->
  <div style="text-align:center; margin-bottom:20px;">
    <div style="font-size:11pt; font-weight:bold; color:#6b21a8; text-transform:uppercase; letter-spacing:1px;">
      ${unit.curriculumInfo || 'Tiếng Anh 5 Global Success (Chương trình GDPT 2018)'}
    </div>
    <h1 style="color:#1e1b4b; margin:6px 0; font-size:18pt; text-transform:uppercase;">
      ${unit.unitNumber}: ${unit.unitTitle}
    </h1>
    <p style="font-style:italic; font-size:11pt; color:#475569; margin:0;">
      Chủ đề bài học: "${unit.knowledgeContent || unit.video?.caption || 'Luyện tập kỹ năng nói tiếng Anh theo sơ đồ tư duy'}"
    </p>
  </div>

  <!-- SECTION 1 -->
  <div style="background-color:#f8fafc; border-left:4px solid #3b82f6; padding:8px 12px; margin-bottom:10px;">
    <h3 style="margin:0; color:#1e3a8a; font-size:13pt;">
      PHẦN 1: TÌM HIỂU VIDEO MẪU & KHỞI ĐỘNG (WATCH & COMPREHEND)
    </h3>
  </div>
  <p style="font-size:11pt; margin-bottom:10px; color:#334155;">
    <em>Em hãy xem video/nghe bài nói mẫu và trả lời các câu hỏi sau bằng câu hoàn chỉnh:</em>
  </p>
  ${s1QuestionsHtml}

  <!-- SECTION 2 -->
  <div style="background-color:#f8fafc; border-left:4px solid #10b981; padding:8px 12px; margin:20px 0 10px 0;">
    <h3 style="margin:0; color:#064e3b; font-size:13pt;">
      PHẦN 2: TỪ VỰNG TRỌNG TÂM & SƠ ĐỒ TƯ DUY (MINDMAP KEYWORDS)
    </h3>
  </div>
  <p style="font-size:11pt; margin-bottom:10px; color:#334155;">
    <em>Ghi nhớ và liên kết các từ vựng theo các nhánh của sơ đồ tư duy:</em>
  </p>
  <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
    <thead>
      <tr style="background-color:#e2e8f0;">
        <th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">Nhánh Chủ Đề</th>
        <th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">Từ Vựng & Ý Chính Cần Nói</th>
      </tr>
    </thead>
    <tbody>
      ${branchesHtml}
    </tbody>
  </table>

  <!-- SECTION 3 -->
  <div style="background-color:#f8fafc; border-left:4px solid #8b5cf6; padding:8px 12px; margin:20px 0 10px 0;">
    <h3 style="margin:0; color:#4c1d95; font-size:13pt;">
      PHẦN 3: HỘP CÔNG CỤ MẪU CÂU GIAO TIẾP (USEFUL EXPRESSIONS)
    </h3>
  </div>
  <p style="font-size:11pt; margin-bottom:10px; color:#334155;">
    <em>Luyện đọc to các mẫu câu sau từ 3-5 lần trước khi làm bài nói:</em>
  </p>
  <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
    <thead>
      <tr style="background-color:#f3e8ff;">
        <th style="border:1px solid #cbd5e1; padding:6px; width:45px;">STT</th>
        <th style="border:1px solid #cbd5e1; padding:6px;">Mẫu câu tiếng Anh (English Sentence)</th>
        <th style="border:1px solid #cbd5e1; padding:6px;">Ý nghĩa / Hướng dẫn</th>
        <th style="border:1px solid #cbd5e1; padding:6px; width:80px;">Tự Đánh Giá</th>
      </tr>
    </thead>
    <tbody>
      ${expressionsHtml}
    </tbody>
  </table>

  <!-- SECTION 4 -->
  <div style="background-color:#f8fafc; border-left:4px solid #f59e0b; padding:8px 12px; margin:20px 0 10px 0;">
    <h3 style="margin:0; color:#78350f; font-size:13pt;">
      PHẦN 4: LUYỆN NÓI TƯƠNG TÁC THEO TỪNG CẤP ĐỘ (STEP-BY-STEP DIALOGUE)
    </h3>
  </div>
  ${practiceHtml}

  <!-- SECTION 5 & 6 (PAGE BREAK FOR PRINTING CLEANLINESS) -->
  <div class="page-break"></div>

  <!-- Top Page 2 Header -->
  <div style="display:flex; justify-content:space-between; font-size:10pt; color:#64748b; margin-bottom:15px;">
    <span>E-SMART ENGLISH KIDS • ${unit.unitNumber}: ${unit.unitTitle}</span>
    <span>Designed by Tím</span>
  </div>

  <div style="background-color:#f8fafc; border-left:4px solid #ec4899; padding:8px 12px; margin-bottom:10px;">
    <h3 style="margin:0; color:#831843; font-size:13pt;">
      PHẦN 5: THỬ THÁCH BÀI NÓI HOÀN CHỈNH 30 - 60 GIÂY (SPEAKING CHALLENGE)
    </h3>
  </div>

  <div style="border:2px dashed #ec4899; border-radius:8px; padding:12px; background-color:#fff1f2; margin-bottom:15px;">
    <div style="font-weight:bold; color:#9d174d; font-size:12pt; margin-bottom:6px;">
      🎤 Nhiệm vụ của em (Challenge Task):
    </div>
    <p style="margin:0 0 8px 0; font-size:11pt; color:#1e293b;">
      Dựa vào các từ vựng trong sơ đồ tư duy và các mẫu câu đã học ở Phần 2 và Phần 3, em hãy chuẩn bị và ghi âm một bài nói hoàn chỉnh từ 30 đến 60 giây về chủ đề <strong>"${unit.unitTitle}"</strong>.
    </p>
    <div style="font-size:11pt; color:#475569;">
      <strong>Dàn ý gợi ý (Outline):</strong>
      <ol style="margin:4px 0 0 20px; padding:0;">
        <li><strong>Opening:</strong> Chào hỏi và giới thiệu chủ đề bài nói.</li>
        <li><strong>Body:</strong> Trình bày ít nhất 2 đến 3 ý chính từ các nhánh sơ đồ tư duy (nghề nghiệp, nơi làm việc, lý do yêu thích...).</li>
        <li><strong>Closing:</strong> Nêu cảm nghĩ hoặc câu kết thúc ấn tượng.</li>
      </ol>
    </div>
  </div>

  <!-- Space for student drafting -->
  <div style="margin-bottom:20px;">
    <div style="font-weight:bold; color:#1e293b; font-size:11pt; margin-bottom:6px;">
      ✏️ Phần viết nháp bài nói của học sinh (Student's Draft Outline / Notes):
    </div>
    <div style="border-bottom:1px dotted #94a3b8; height:24px;"></div>
    <div style="border-bottom:1px dotted #94a3b8; height:24px;"></div>
    <div style="border-bottom:1px dotted #94a3b8; height:24px;"></div>
    <div style="border-bottom:1px dotted #94a3b8; height:24px;"></div>
    <div style="border-bottom:1px dotted #94a3b8; height:24px;"></div>
    <div style="border-bottom:1px dotted #94a3b8; height:24px;"></div>
  </div>

  <!-- Model Answer Reference -->
  <div style="background-color:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; margin-bottom:20px;">
    <div style="font-weight:bold; color:#1d4ed8; font-size:11pt; margin-bottom:4px;">
      ⭐ Bài Nói Mẫu Tham Khảo (Teacher Model Presentation):
    </div>
    <p style="margin:0; font-style:italic; font-size:11pt; color:#1e293b; line-height:1.5;">
      "${unit.modelAnswer}"
    </p>
  </div>

  <!-- SECTION 6: RUBRIC EVALUATION TABLE FOR TEACHER -->
  <div style="background-color:#f8fafc; border-left:4px solid #6366f1; padding:8px 12px; margin-bottom:10px;">
    <h3 style="margin:0; color:#312e81; font-size:13pt;">
      PHẦN 6: BẢNG TIÊU CHÍ ĐÁNH GIÁ CỦA GIÁO VIÊN (SPEAKING RUBRIC - 5 CRITERIA)
    </h3>
  </div>

  <table class="rubric-table">
    <thead>
      <tr>
        <th style="width:30px;">STT</th>
        <th style="width:160px;">Tiêu chí đánh giá</th>
        <th>Yêu cầu cần đạt (Chương trình GDPT 2018 Lớp 5)</th>
        <th style="width:80px;">Điểm (1-5)</th>
        <th style="width:180px;">Nhận xét của Giáo viên</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align:center; font-weight:bold;">1</td>
        <td><strong>Pronunciation</strong><br/><span style="font-size:10pt; color:#64748b;">(Phát âm)</span></td>
        <td>Phát âm rõ ràng các âm cơ bản, phụ âm cuối (/s/, /t/, /d/) và trọng âm từ quen thuộc.</td>
        <td style="text-align:center; font-weight:bold;">/ 5</td>
        <td></td>
      </tr>
      <tr>
        <td style="text-align:center; font-weight:bold;">2</td>
        <td><strong>Fluency</strong><br/><span style="font-size:10pt; color:#64748b;">(Độ trôi chảy)</span></td>
        <td>Nói tự nhiên, không ngập ngừng quá lâu; tốc độ nói vừa phải, có ngắt nghỉ đúng câu.</td>
        <td style="text-align:center; font-weight:bold;">/ 5</td>
        <td></td>
      </tr>
      <tr>
        <td style="text-align:center; font-weight:bold;">3</td>
        <td><strong>Vocabulary</strong><br/><span style="font-size:10pt; color:#64748b;">(Từ vựng)</span></td>
        <td>Sử dụng chính xác các từ vựng thuộc chủ đề bài học theo sơ đồ tư duy.</td>
        <td style="text-align:center; font-weight:bold;">/ 5</td>
        <td></td>
      </tr>
      <tr>
        <td style="text-align:center; font-weight:bold;">4</td>
        <td><strong>Grammar</strong><br/><span style="font-size:10pt; color:#64748b;">(Ngữ pháp)</span></td>
        <td>Dùng đúng cấu trúc câu đơn, câu ghép đơn giản (because, and) và thì phù hợp.</td>
        <td style="text-align:center; font-weight:bold;">/ 5</td>
        <td></td>
      </tr>
      <tr>
        <td style="text-align:center; font-weight:bold;">5</td>
        <td><strong>Content Development</strong><br/><span style="font-size:10pt; color:#64748b;">(Phát triển ý)</span></td>
        <td>Trình bày đủ 3 phần (Mở bài, Thân bài, Kết bài); bám sát ý tưởng mindmap và nêu được suy nghĩ cá nhân.</td>
        <td style="text-align:center; font-weight:bold;">/ 5</td>
        <td></td>
      </tr>
      <tr style="background-color:#f8fafc;">
        <td colspan="3" style="text-align:right; font-weight:bold; padding:8px;">
          TỔNG ĐIỂM (TOTAL SCORE):
        </td>
        <td style="text-align:center; font-weight:bold; font-size:12pt; color:#7c3aed;">
          / 25
        </td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <!-- Teacher signature and feedback -->
  <table style="width:100%; margin-top:25px; border-collapse:collapse;">
    <tr>
      <td style="width:60%; vertical-align:top;">
        <div style="font-weight:bold; font-size:11pt; color:#1e293b;">Lời động viên chung của Thầy / Cô:</div>
        <div style="border-bottom:1px dotted #94a3b8; height:24px; margin-top:4px;"></div>
        <div style="border-bottom:1px dotted #94a3b8; height:24px;"></div>
        <div style="border-bottom:1px dotted #94a3b8; height:24px;"></div>
      </td>
      <td style="width:40%; text-align:center; vertical-align:top;">
        <div style="font-size:11pt; color:#475569;">Ngày ...... tháng ...... năm 202...</div>
        <div style="font-weight:bold; font-size:11pt; margin-top:4px;">GIÁO VIÊN CHẤM BÀI</div>
        <div style="font-size:10pt; color:#64748b; font-style:italic; margin-top:2px;">(Ký và ghi rõ họ tên)</div>
      </td>
    </tr>
  </table>

  <div style="text-align:center; margin-top:30px; font-size:10pt; color:#94a3b8;">
    E-SMART ENGLISH KIDS • Powered by AI Interactive Speaking Framework • Designed by Tím
  </div>

</body>
</html>`;

  const filename = `${unit.unitNumber.replace(/\s+/g, '_')}_Speaking_Worksheet.doc`;
  downloadFile(wordContent, 'application/msword;charset=utf-8', filename);
}

/**
 * Generates and downloads an interactive classroom presentation slide deck (.ppt / html slides)
 * formatted for classroom projectors, interactive touchscreens, or Microsoft PowerPoint.
 */
export function exportUnitToPowerPoint(unit: TeacherMaterial) {
  const branchesSlide = (unit.mindmap?.branches || [])
    .map(
      (b) => `
      <div style="background:white; border-radius:16px; padding:16px; border:2px solid #e2e8f0; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
        <h3 style="margin:0 0 8px 0; color:#6b21a8; font-size:18px;">💡 ${b.title}</h3>
        <p style="margin:0; font-size:15px; color:#1e293b; font-weight:600;">${b.items?.join(' • ') || ''}</p>
        ${b.simpleExplanation ? `<p style="margin:6px 0 0 0; font-size:12px; color:#64748b; font-style:italic;">${b.simpleExplanation}</p>` : ''}
      </div>`
    )
    .join('');

  const expressionsSlide = (unit.usefulExpressions || [])
    .slice(0, 6)
    .map(
      (exp, idx) => `
      <div style="background:white; border-radius:12px; padding:12px 16px; border-left:6px solid #7c3aed; box-shadow:0 2px 4px rgba(0,0,0,0.05); display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:17px; font-weight:bold; color:#1e1b4b;">${idx + 1}. "${exp.english}"</span>
        <span style="font-size:13px; color:#6b21a8; font-weight:600;">${exp.vietnameseGuide || ''}</span>
      </div>`
    )
    .join('');

  const questionsSlide = (unit.section1Questions || [])
    .map(
      (q, idx) => `
      <div style="background:white; border-radius:14px; padding:16px; border:2px solid #93c5fd; margin-bottom:12px;">
        <div style="font-size:18px; font-weight:bold; color:#1e3a8a;">Question ${idx + 1}: ${q.question}</div>
        <div style="font-size:14px; color:#059669; font-weight:600; margin-top:6px;">👉 Hint: ${q.expectedHint}</div>
      </div>`
    )
    .join('');

  const pptHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:p='urn:schemas-microsoft-com:office:powerpoint' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${unit.unitNumber}: ${unit.unitTitle} - Slide Presentation</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #0f172a;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1e293b;
    }
    .slide {
      width: 960px;
      height: 540px;
      margin: 20px auto;
      background: linear-gradient(135deg, #fdfbf7 0%, #f5f3ff 100%);
      border-radius: 20px;
      padding: 40px 50px;
      box-sizing: border-box;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 12px;
    }
    .slide-badge {
      background: #7c3aed;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .designer-tag {
      background: #ec4899;
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
    }
  </style>
</head>
<body>

  <!-- SLIDE 1: TITLE SLIDE -->
  <div class="slide" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%); color:white;">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span style="background:rgba(255,255,255,0.2); padding:6px 16px; border-radius:20px; font-weight:bold; font-size:14px;">
        🎓 E-SMART ENGLISH KIDS
      </span>
      <span class="designer-tag">Designed by Tím</span>
    </div>

    <div style="text-align:center; padding:30px 0;">
      <div style="background:#fbbf24; color:#78350f; display:inline-block; padding:6px 20px; border-radius:14px; font-weight:900; font-size:18px; margin-bottom:15px; letter-spacing:1px;">
        ${unit.unitNumber}
      </div>
      <h1 style="font-size:42px; margin:0 0 15px 0; font-weight:900; line-height:1.2;">
        ${unit.unitTitle}
      </h1>
      <p style="font-size:18px; color:#e0e7ff; max-width:700px; margin:0 auto; font-weight:500;">
        ${unit.curriculumInfo || 'Tiếng Anh 5 Global Success (Chương trình GDPT 2018)'}
      </p>
    </div>

    <div class="slide-footer" style="border-top-color:rgba(255,255,255,0.2); color:#c7d2fe;">
      <span>Grade 5 Interactive Speaking Challenge</span>
      <span>Click or press PageDown for Next Slide ➡️</span>
    </div>
  </div>

  <!-- SLIDE 2: VIDEO COMPREHENSION -->
  <div class="slide">
    <div class="slide-header">
      <span class="slide-badge">Step 1: Watch & Comprehend</span>
      <span class="designer-tag">Designed by Tím</span>
    </div>

    <div>
      <h2 style="font-size:26px; color:#1e1b4b; margin:15px 0 10px 0;">🎬 Warm-up Comprehension Questions</h2>
      <p style="color:#64748b; font-size:14px; margin-bottom:20px;">Watch the presentation and discuss the following questions with your classmates:</p>
      ${questionsSlide}
    </div>

    <div class="slide-footer">
      <span>${unit.unitNumber}: ${unit.unitTitle}</span>
      <span>Slide 2 / 6</span>
    </div>
  </div>

  <!-- SLIDE 3: MINDMAP KEYWORDS -->
  <div class="slide">
    <div class="slide-header">
      <span class="slide-badge">Step 2: Mindmap Vocabulary</span>
      <span class="designer-tag">Designed by Tím</span>
    </div>

    <div>
      <h2 style="font-size:26px; color:#1e1b4b; margin:15px 0 10px 0;">🧠 Vocabulary Mindmap Organizer</h2>
      <p style="color:#64748b; font-size:14px; margin-bottom:15px;">Explore the key topic branches and vocabulary words to prepare for speaking:</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
        ${branchesSlide}
      </div>
    </div>

    <div class="slide-footer">
      <span>${unit.unitNumber}: ${unit.unitTitle}</span>
      <span>Slide 3 / 6</span>
    </div>
  </div>

  <!-- SLIDE 4: USEFUL EXPRESSIONS -->
  <div class="slide">
    <div class="slide-header">
      <span class="slide-badge">Step 3: Useful Expressions</span>
      <span class="designer-tag">Designed by Tím</span>
    </div>

    <div>
      <h2 style="font-size:26px; color:#1e1b4b; margin:15px 0 10px 0;">💬 Speaking Toolbox (Key Sentence Patterns)</h2>
      <p style="color:#64748b; font-size:14px; margin-bottom:15px;">Practice saying these sentence frames with clear rhythm and natural intonation:</p>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${expressionsSlide}
      </div>
    </div>

    <div class="slide-footer">
      <span>${unit.unitNumber}: ${unit.unitTitle}</span>
      <span>Slide 4 / 6</span>
    </div>
  </div>

  <!-- SLIDE 5: 30-60S CHALLENGE OUTLINE -->
  <div class="slide">
    <div class="slide-header">
      <span class="slide-badge">Step 5: Speaking Challenge</span>
      <span class="designer-tag">Designed by Tím</span>
    </div>

    <div>
      <h2 style="font-size:26px; color:#1e1b4b; margin:15px 0 10px 0;">🎤 30–60 Second Speaking Challenge</h2>
      <div style="background:#fff; border-radius:16px; padding:20px; border:2px solid #f472b6; margin-top:15px;">
        <h3 style="color:#db2777; margin:0 0 10px 0; font-size:20px;">⭐ Suggested Speaking Structure:</h3>
        <div style="font-size:16px; line-height:1.6; color:#1e293b;">
          <div><strong>1. Opening:</strong> "Hello everyone! My name is [Name]. Today I would like to talk about..."</div>
          <div><strong>2. Body:</strong> Connect ideas using "Firstly,...", "Secondly,...", "Because..."</div>
          <div><strong>3. Closing:</strong> "Thank you for listening to my presentation. Have a wonderful day!"</div>
        </div>
      </div>
      <div style="margin-top:15px; background:#eff6ff; border-radius:12px; padding:12px 16px; color:#1e40af; font-size:14px; font-weight:600;">
        💡 Tip: Speak clearly, maintain eye contact, and pronounce ending sounds /s/, /t/, /d/ accurately!
      </div>
    </div>

    <div class="slide-footer">
      <span>${unit.unitNumber}: ${unit.unitTitle}</span>
      <span>Slide 5 / 6</span>
    </div>
  </div>

  <!-- SLIDE 6: MODEL ANSWER & RUBRICS -->
  <div class="slide">
    <div class="slide-header">
      <span class="slide-badge">Evaluation & Model Presentation</span>
      <span class="designer-tag">Designed by Tím</span>
    </div>

    <div>
      <h2 style="font-size:24px; color:#1e1b4b; margin:12px 0 8px 0;">⭐ Model Answer & 5 Speaking Rubrics</h2>
      
      <div style="background:white; border-radius:14px; padding:14px; border:2px solid #cbd5e1; margin-bottom:12px;">
        <div style="font-size:13px; font-weight:bold; color:#7c3aed; margin-bottom:4px;">MODEL PRESENTATION:</div>
        <div style="font-size:14px; color:#1e293b; font-style:italic; line-height:1.5;">
          "${unit.modelAnswer}"
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:8px; text-align:center;">
        <div style="background:#e0f2fe; padding:8px; border-radius:10px; font-size:12px; font-weight:bold; color:#0369a1;">
          1. Pronunciation<br/><span style="font-size:10px; color:#0284c7;">Phát âm</span>
        </div>
        <div style="background:#dcfce7; padding:8px; border-radius:10px; font-size:12px; font-weight:bold; color:#15803d;">
          2. Fluency<br/><span style="font-size:10px; color:#16a34a;">Trôi chảy</span>
        </div>
        <div style="background:#fef3c7; padding:8px; border-radius:10px; font-size:12px; font-weight:bold; color:#b45309;">
          3. Vocabulary<br/><span style="font-size:10px; color:#d97706;">Từ vựng</span>
        </div>
        <div style="background:#f3e8ff; padding:8px; border-radius:10px; font-size:12px; font-weight:bold; color:#7e22ce;">
          4. Grammar<br/><span style="font-size:10px; color:#9333ea;">Ngữ pháp</span>
        </div>
        <div style="background:#ffe4e6; padding:8px; border-radius:10px; font-size:12px; font-weight:bold; color:#be123c;">
          5. Content<br/><span style="font-size:10px; color:#e11d48;">Nội dung</span>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>E-SMART ENGLISH KIDS • Designed by Tím</span>
      <span>Slide 6 / 6 • Keep practicing every day! 🎉</span>
    </div>
  </div>

</body>
</html>`;

  const filename = `${unit.unitNumber.replace(/\s+/g, '_')}_Classroom_Presentation.ppt`;
  downloadFile(pptHtml, 'application/vnd.ms-powerpoint;charset=utf-8', filename);
}
