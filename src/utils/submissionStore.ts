import { StudentSubmission } from '../types';

const STORAGE_KEY = 'esmart_submissions';

export const SEED_SUBMISSIONS: StudentSubmission[] = [
  // Class 5/1 - Ms. Hồng Phượng
  {
    id: 'sub-seed-1',
    unitId: 'unit-1',
    unitNumber: 'Unit 1',
    unitTitle: 'All about me',
    studentName: 'Nguyễn Minh Anh',
    studentClass: '5/1',
    schoolName: 'Tiểu học Kim Đồng',
    teacherName: 'Ms. Hồng Phượng',
    transcript: 'Hello everyone! My name is Minh Anh from Class 5/1. I am ten years old. In my free time, I love reading English comic books and drawing pictures. My dream is to become an English teacher in the future. Thank you for listening!',
    durationSeconds: 42,
    teacherRating: 5,
    teacherFeedback: 'Minh Anh phát âm rất chuẩn, ngữ điệu tự nhiên và tự tin tuyệt vời! Cô khen ngợi em.',
    submittedAt: '15/10/2026, 08:30:15',
    rubricFeedback: {
      pronunciation: 'Phát âm chuẩn xác, các âm đuôi /s/, /t/ rất rõ ràng.',
      fluency: 'Tốc độ nói đều đặn, tự nhiên, ngắt nghỉ đúng câu.',
      vocabulary: 'Sử dụng tốt từ vựng về sở thích và ước mơ tương lai.',
      grammar: 'Cấu trúc câu hoàn chỉnh, sử dụng thì hiện tại đơn chính xác.',
      contentDevelopment: 'Giới thiệu bản thân đầy đủ từ tên, tuổi, sở thích đến ước mơ.',
    },
    strengths: ['Giọng đọc to, rõ ràng và rất truyền cảm', 'Vốn từ vựng phong phú', 'Tự tin trước camera'],
    nextTimeYouCanTry: ['Thử dùng thêm liên từ như furthermore, because để câu văn dài hơn'],
  },
  {
    id: 'sub-seed-2',
    unitId: 'unit-1',
    unitNumber: 'Unit 1',
    unitTitle: 'All about me',
    studentName: 'Trần Hoàng Nam',
    studentClass: '5/1',
    schoolName: 'Tiểu học Kim Đồng',
    teacherName: 'Ms. Hồng Phượng',
    transcript: 'Good morning teacher and friends! My name is Hoang Nam, class 5/1. My favourite sport is football and my favourite subject is English. I practice speaking English with AI Buddy every afternoon.',
    durationSeconds: 38,
    teacherRating: 5,
    teacherFeedback: 'Hoàng Nam có tiến bộ vượt bậc! Nói to, rõ ràng, phong thái rất tự tin.',
    submittedAt: '15/10/2026, 08:45:22',
    rubricFeedback: {
      pronunciation: 'Rõ ràng, dễ nghe, trọng âm từ tốt.',
      fluency: 'Trôi chảy, không bị ngắc ngứ.',
      vocabulary: 'Từ vựng thể thao và môn học chính xác.',
      grammar: 'Câu đơn giản chuẩn ngữ pháp.',
      contentDevelopment: 'Ý tưởng mạch lạc, bám sát mindmap bài học.',
    },
    strengths: ['Nói to rõ ràng', 'Phát âm từ vựng chuẩn'],
    nextTimeYouCanTry: ['Mở rộng thêm lý do vì sao em thích đá bóng nhé'],
  },
  {
    id: 'sub-seed-3',
    unitId: 'unit-1',
    unitNumber: 'Unit 1',
    unitTitle: 'All about me',
    studentName: 'Lê Mai Chi',
    studentClass: '5/1',
    schoolName: 'Tiểu học Kim Đồng',
    teacherName: 'Ms. Hồng Phượng',
    transcript: 'Hi everyone, I am Mai Chi from class 5/1. I like listening to music and studying English. In the future, I want to be an architect to design beautiful and eco-friendly buildings.',
    durationSeconds: 45,
    teacherRating: 5,
    teacherFeedback: 'Mai Chi có ngữ điệu rất hay và từ vựng phong phú! Rất đáng khen.',
    submittedAt: '15/10/2026, 09:12:40',
    rubricFeedback: {
      pronunciation: 'Phát âm từ eco-friendly và architect rất chuẩn xác.',
      fluency: 'Nói rất êm tai và trôi chảy.',
      vocabulary: 'Từ vựng nâng cao rất tốt.',
      grammar: 'Sử dụng cấu trúc câu phức chuẩn.',
      contentDevelopment: 'Ý tưởng sáng tạo và ý nghĩa.',
    },
    strengths: ['Ngữ điệu như người bản ngữ', 'Ý tưởng phong phú'],
    nextTimeYouCanTry: ['Tiếp tục phát huy phong độ này nhé!'],
  },
  {
    id: 'sub-seed-4',
    unitId: 'unit-1',
    unitNumber: 'Unit 1',
    unitTitle: 'All about me',
    studentName: 'Phạm Tuấn Anh',
    studentClass: '5/1',
    schoolName: 'Tiểu học Kim Đồng',
    teacherName: 'Ms. Hồng Phượng',
    transcript: 'Hello Ms. Hong Phuong! I am Tuan Anh, class 5/1. Today I talk about my dream job. I want to become a doctor because I want to help sick people in our city. Thank you!',
    durationSeconds: 35,
    teacherRating: 4,
    teacherFeedback: 'Tuấn Anh nói rất có cảm xúc và mục tiêu cao đẹp! Chú ý phát âm âm đuôi /s/ kỹ hơn xíu nữa nhé.',
    submittedAt: '15/10/2026, 09:30:11',
    rubricFeedback: {
      pronunciation: 'Phát âm tương đối tốt, chú ý âm đuôi /s/.',
      fluency: 'Lưu loát, tự tin.',
      vocabulary: 'Từ vựng nghề nghiệp chuẩn xác.',
      grammar: 'Đúng cấu trúc câu điều ước và lý do.',
      contentDevelopment: 'Bày tỏ được ước mơ và lý do rõ ràng.',
    },
    strengths: ['Ước mơ nhân văn', 'Nói dõng dạc'],
    nextTimeYouCanTry: ['Luyện tập âm đuôi /s/ trong chữ because và city nhé'],
  },
  {
    id: 'sub-seed-5',
    unitId: 'unit-1',
    unitNumber: 'Unit 1',
    unitTitle: 'All about me',
    studentName: 'Đặng Thùy Linh',
    studentClass: '5/1',
    schoolName: 'Tiểu học Kim Đồng',
    teacherName: 'Ms. Hồng Phượng',
    transcript: 'Hello everyone! My name is Thuy Linh from class 5/1. I enjoy practicing speaking with AI Buddy and learning new words every day. I love my school and my class 5/1 very much!',
    durationSeconds: 40,
    teacherRating: 5,
    teacherFeedback: 'Thùy Linh nói rất lưu loát, giọng đọc ngọt ngào và tự tin!',
    submittedAt: '15/10/2026, 10:05:00',
    rubricFeedback: {
      pronunciation: 'Phát âm chuẩn xác, rõ từng âm tiết.',
      fluency: 'Rất tự nhiên và trôi chảy.',
      vocabulary: 'Từ vựng học tập tốt.',
      grammar: 'Cấu trúc câu hoàn chỉnh.',
      contentDevelopment: 'Nội dung gần gũi, ấm áp.',
    },
    strengths: ['Giọng đọc ấm áp', 'Phát âm rõ ràng'],
    nextTimeYouCanTry: ['Nói thêm về kế hoạch học tập của em nhé'],
  },

  // Class 5/3 - Ms. Thanh Thảo
  {
    id: 'sub-seed-6',
    unitId: 'unit-1',
    unitNumber: 'Unit 1',
    unitTitle: 'All about me',
    studentName: 'Vũ Bảo Châu',
    studentClass: '5/3',
    schoolName: 'Tiểu học Kim Đồng',
    teacherName: 'Ms. Thanh Thảo',
    transcript: 'Hello Ms. Thanh Thao and classmates! My name is Bao Chau from Class 5/3. I love exploring science and speaking English. My dream job is a scientist to protect our environment.',
    durationSeconds: 46,
    teacherRating: 5,
    teacherFeedback: 'Bảo Châu rất tuyệt vời! Bài nói xuất sắc, phát âm chuẩn và phong thái tự tin!',
    submittedAt: '15/10/2026, 08:35:10',
    rubricFeedback: {
      pronunciation: 'Phát âm chuẩn xác, nối âm tự nhiên.',
      fluency: 'Trôi chảy, tự tin, phát âm nhấn nhá tốt.',
      vocabulary: 'Từ vựng khoa học và môi trường rất phong phú.',
      grammar: 'Sử dụng cấu trúc câu đa dạng, chuẩn ngữ pháp.',
      contentDevelopment: 'Trình bày ý tưởng logic, hấp dẫn.',
    },
    strengths: ['Vốn từ vựng ấn tượng', 'Phong thái tự tin đỉnh cao'],
    nextTimeYouCanTry: ['Tiếp tục luyện tập các chủ đề khoa học nâng cao nhé'],
  },
  {
    id: 'sub-seed-7',
    unitId: 'unit-1',
    unitNumber: 'Unit 1',
    unitTitle: 'All about me',
    studentName: 'Đỗ Quốc Huy',
    studentClass: '5/3',
    schoolName: 'Tiểu học Kim Đồng',
    teacherName: 'Ms. Thanh Thảo',
    transcript: 'Good afternoon everyone! My name is Quoc Huy, class 5/3. In my future, I want to become a computer programmer to create fun learning games for kids all over Vietnam.',
    durationSeconds: 41,
    teacherRating: 5,
    teacherFeedback: 'Quốc Huy có ước mơ công nghệ rất hay! Phát âm từ computer programmer rất chuẩn!',
    submittedAt: '15/10/2026, 09:05:45',
    rubricFeedback: {
      pronunciation: 'Phát âm rõ ràng, chuẩn âm các thuật ngữ.',
      fluency: 'Nói tốc độ vừa phải, dễ theo dõi.',
      vocabulary: 'Sử dụng đúng từ ngữ về công nghệ và ước mơ.',
      grammar: 'Cấu trúc câu hoàn chỉnh.',
      contentDevelopment: 'Mục đích bài nói rõ ràng, thuyết phục.',
    },
    strengths: ['Giọng đọc nam tính, dứt khoát', 'Ước mơ thiết thực'],
    nextTimeYouCanTry: ['Em có thể thêm chi tiết về ngôn ngữ lập trình em thích nhé'],
  },
  {
    id: 'sub-seed-8',
    unitId: 'unit-1',
    unitNumber: 'Unit 1',
    unitTitle: 'All about me',
    studentName: 'Ngô Khánh Linh',
    studentClass: '5/3',
    schoolName: 'Tiểu học Kim Đồng',
    teacherName: 'Ms. Thanh Thảo',
    transcript: 'Hi Ms. Thanh Thao and everyone, my name is Khanh Linh from class 5/3. I love singing English songs and playing the piano. Practicing English speaking makes me very happy!',
    durationSeconds: 39,
    teacherRating: 5,
    teacherFeedback: 'Khánh Linh phát âm rất ngọt ngào và chuẩn xác! Cô rất tự hào về em.',
    submittedAt: '15/10/2026, 09:40:18',
    rubricFeedback: {
      pronunciation: 'Ngữ âm tuyệt vời, có nhịp điệu bài nói.',
      fluency: 'Trôi chảy, phát âm tự nhiên.',
      vocabulary: 'Từ vựng âm nhạc và cảm xúc tốt.',
      grammar: 'Sử dụng đúng động từ thêm ing sau like/love.',
      contentDevelopment: 'Chia sẻ sở thích một cách sinh động.',
    },
    strengths: ['Giọng điệu truyền cảm', 'Nói rất tự nhiên'],
    nextTimeYouCanTry: ['Kể thêm về bài hát tiếng Anh em thích nhất nhé'],
  },
  {
    id: 'sub-seed-9',
    unitId: 'unit-1',
    unitNumber: 'Unit 1',
    unitTitle: 'All about me',
    studentName: 'Bùi Đức Minh',
    studentClass: '5/3',
    schoolName: 'Tiểu học Kim Đồng',
    teacherName: 'Ms. Thanh Thảo',
    transcript: 'Hello everyone! I am Duc Minh, 5/3. My presentation is about my dream job. I want to be a pilot to fly airplanes and visit many countries in the world. Thank you for listening!',
    durationSeconds: 37,
    teacherRating: 4,
    teacherFeedback: 'Đức Minh có ước mơ làm phi công rất đẹp! Giọng đọc to rõ, phát âm tiến bộ nhiều.',
    submittedAt: '15/10/2026, 10:15:33',
    rubricFeedback: {
      pronunciation: 'Phát âm to, rõ, âm /p/ trong pilot chuẩn.',
      fluency: 'Nói liền mạch, dứt khoát.',
      vocabulary: 'Từ vựng du lịch và phương tiện tốt.',
      grammar: 'Cấu trúc câu ngắn gọn, chuẩn xác.',
      contentDevelopment: 'Thể hiện rõ ước mơ và điểm đến mong muốn.',
    },
    strengths: ['Tự tin, dõng dạc', 'Nói dứt khoát'],
    nextTimeYouCanTry: ['Kéo dài bài nói thêm 5-10 giây bằng cách kể tên các nước em muốn đến'],
  },
  {
    id: 'sub-seed-10',
    unitId: 'unit-1',
    unitNumber: 'Unit 1',
    unitTitle: 'All about me',
    studentName: 'Hoàng Gia Hân',
    studentClass: '5/3',
    schoolName: 'Tiểu học Kim Đồng',
    teacherName: 'Ms. Thanh Thảo',
    transcript: 'Hello Ms. Thanh Thao! I am Gia Han from class 5/3. Today I am happy to practice English with AI Buddy. I wish all teachers and my friends a great and happy day!',
    durationSeconds: 43,
    teacherRating: 5,
    teacherFeedback: 'Gia Hân rất lễ phép, phát âm tròn vành rõ chữ và truyền cảm hứng!',
    submittedAt: '15/10/2026, 10:45:12',
    rubricFeedback: {
      pronunciation: 'Rất chuẩn xác, ngữ điệu thân thiện.',
      fluency: 'Trôi chảy, tự nhiên.',
      vocabulary: 'Lời chúc và từ vựng rất chuẩn mực.',
      grammar: 'Đúng ngữ pháp.',
      contentDevelopment: 'Ý tưởng phong phú và ấm áp.',
    },
    strengths: ['Thái độ học tập gương mẫu', 'Phát âm chuẩn'],
    nextTimeYouCanTry: ['Giữ vững sự tự tin này em nhé'],
  },
];

export const submissionStore = {
  // Get all submissions with fallback to seed data
  getSubmissions(unitId?: string): StudentSubmission[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let list: StudentSubmission[] = [];
      if (raw) {
        list = JSON.parse(raw);
      }
      if (!list || list.length === 0) {
        list = [...SEED_SUBMISSIONS];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
      if (unitId && unitId !== 'all') {
        return list.filter((s) => s.unitId === unitId);
      }
      return list;
    } catch (_) {
      return [...SEED_SUBMISSIONS];
    }
  },

  // Save or update a submission
  saveSubmission(sub: Partial<StudentSubmission>): StudentSubmission {
    try {
      const currentList = this.getSubmissions('all');
      const nowStr = new Date().toLocaleString('vi-VN');

      // Check if student already submitted for this unit
      const existingIdx = currentList.findIndex(
        (s) =>
          (sub.id && s.id === sub.id) ||
          (sub.studentName &&
            sub.studentClass &&
            sub.unitId &&
            s.studentName.trim().toLowerCase() === sub.studentName.trim().toLowerCase() &&
            s.studentClass.trim() === sub.studentClass.trim() &&
            s.unitId === sub.unitId)
      );

      const finalSubmission: StudentSubmission = {
        id: sub.id || (existingIdx >= 0 ? currentList[existingIdx].id : `sub-${Date.now()}`),
        unitId: sub.unitId || 'unit-1',
        unitNumber: sub.unitNumber || 'Unit 1',
        unitTitle: sub.unitTitle || 'Speaking Challenge',
        studentName: sub.studentName?.trim() || 'Học sinh',
        studentClass: sub.studentClass?.trim() || '5/1',
        schoolName: sub.schoolName?.trim() || 'Tiểu học Kim Đồng',
        teacherName: sub.teacherName || (sub.studentClass?.includes('5/3') ? 'Ms. Thanh Thảo' : 'Ms. Hồng Phượng'),
        transcript: sub.transcript || '',
        audioUrl: sub.audioUrl || '',
        durationSeconds: sub.durationSeconds || 30,
        rubricFeedback: sub.rubricFeedback || {
          pronunciation: 'Phát âm rõ ràng và tự tin.',
          fluency: 'Nói trôi chảy theo mạch ý.',
          vocabulary: 'Từ vựng bám sát bài học.',
          grammar: 'Ngữ pháp chuẩn câu đơn và câu ghép.',
          contentDevelopment: 'Ý tưởng phong phú bám sát chủ đề.',
        },
        strengths: sub.strengths || ['Phát âm tốt', 'Tự tin khi nói'],
        nextTimeYouCanTry: sub.nextTimeYouCanTry || ['Mở rộng thêm câu trả lời nhé'],
        teacherFeedback: sub.teacherFeedback || (existingIdx >= 0 ? currentList[existingIdx].teacherFeedback : ''),
        teacherRating: sub.teacherRating ?? (existingIdx >= 0 ? currentList[existingIdx].teacherRating : 5),
        submittedAt: nowStr,
      };

      if (existingIdx >= 0) {
        currentList[existingIdx] = finalSubmission;
      } else {
        currentList.unshift(finalSubmission);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));
      return finalSubmission;
    } catch (e) {
      console.warn('Error saving to localStorage submission store:', e);
      return sub as StudentSubmission;
    }
  },

  // Update teacher feedback & rating
  updateFeedback(id: string, feedback: string, rating: number): void {
    try {
      const list = this.getSubmissions('all');
      const updated = list.map((s) =>
        s.id === id ? { ...s, teacherFeedback: feedback, teacherRating: rating } : s
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
  },

  // Delete submission
  deleteSubmission(id: string): void {
    try {
      const list = this.getSubmissions('all');
      const updated = list.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
  },

  // Export submissions to Excel CSV (UTF-8 with BOM for Vietnamese characters)
  exportToCsv(submissions: StudentSubmission[], title: string = 'Danh_Sach_Nop_Bai_Noi_Tieng_Anh'): void {
    const headers = [
      'STT',
      'Họ và Tên Học Sinh',
      'Lớp',
      'Giáo Viên Phụ Trách',
      'Trường Tiểu Học',
      'Bài Học (Unit)',
      'Thời Lượng (giây)',
      'Điểm Đánh Giá (Sao)',
      'Nhận Xét Giáo Viên',
      'Lời Bài Nói (Transcript)',
      'Ngày Nộp',
    ];

    const rows = submissions.map((s, idx) => [
      idx + 1,
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${s.studentClass}"`,
      `"${s.teacherName || ''}"`,
      `"${(s.schoolName || '').replace(/"/g, '""')}"`,
      `"${s.unitNumber}: ${s.unitTitle}"`,
      s.durationSeconds || 0,
      s.teacherRating || 5,
      `"${(s.teacherFeedback || '').replace(/"/g, '""')}"`,
      `"${(s.transcript || '').replace(/"/g, '""')}"`,
      `"${s.submittedAt}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
