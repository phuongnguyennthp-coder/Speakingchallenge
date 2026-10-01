export interface MindmapBranch {
  id: string;
  title: string;
  color: string;
  iconName: string;
  items: string[];
  simpleExplanation: string;
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  expectedHint: string;
  exampleAnswer: string;
}

export interface UsefulExpression {
  id: string;
  english: string;
  vietnameseGuide?: string;
  category: 'Greeting & Opening' | 'Expressing Dreams' | 'Giving Reasons' | 'Closing' | 'General';
  audioSpeed?: number;
}

export interface PracticeLevel {
  levelNumber: number;
  levelName: 'Recognition' | 'Short Answers' | 'Extended Answers' | 'Personal Opinion';
  badgeTitle: string;
  buddyPrompt: string;
  options?: string[];
  sampleStudentAnswer: string;
  hint: string;
}

export type MediaSourceType =
  | 'sample'
  | 'youtube'
  | 'drive'
  | 'upload'
  | 'mp3-upload'
  | 'mp3-url'
  | 'link';

export type MindmapSourceType =
  | 'diagram'
  | 'image'
  | 'upload'
  | 'video'
  | 'youtube'
  | 'drive'
  | 'link'
  | 'mp3';

export type BackgroundThemeType =
  | 'default'
  | 'sky'
  | 'peach'
  | 'mint'
  | 'lavender'
  | 'pink'
  | 'starry'
  | 'custom';

export interface TeacherMaterial {
  id: string;
  unitNumber: string;
  unitTitle: string;
  curriculumInfo: string;
  knowledgeContent?: string; // Text/notes/transcript provided by teacher for AI auto-generation & strict grounding
  backgroundType?: 'preset' | 'upload';
  backgroundTheme?: BackgroundThemeType;
  customBackgroundUrl?: string; // Data URL or external URL for uploaded background image
  video: {
    sourceType: MediaSourceType;
    url: string;
    caption: string;
    transcript: string;
    duration: string;
  };
  mindmap: {
    sourceType: MindmapSourceType;
    url: string;
    title: string;
    branches: MindmapBranch[];
  };
  section1Questions: ComprehensionQuestion[];
  section2Questions: ComprehensionQuestion[];
  usefulExpressions: UsefulExpression[];
  practiceLevels: PracticeLevel[];
  modelAnswer: string;
}

export interface QuestionAnswerState {
  questionId: string;
  studentSpeech: string;
  audioBlobUrl?: string;
  praiseWord: string;
  feedbackText: string;
  isCompleted: boolean;
  timestamp?: number;
}

export interface ExpressionPracticeState {
  expressionId: string;
  studentSpeech: string;
  praise: string;
  pronunciationFeedback: string;
  fluencyFeedback: string;
  encouragingComment: string;
  isPracticed: boolean;
}

export interface BuddyConversationTurn {
  levelNumber: number;
  levelTitle: string;
  prompt: string;
  studentSpeech: string;
  praiseWord: string;
  supportiveComment: string;
  buddyReply: string;
  isCompleted: boolean;
}

export interface ChallengeEvaluation {
  rubricFeedback: {
    pronunciation: string;
    fluency: string;
    vocabulary: string;
    grammar: string;
    contentDevelopment: string;
  };
  strengths: string[];
  nextTimeYouCanTry: string[];
  suggestedSentenceUpgrades: Array<{
    original: string;
    upgrade: string;
    tip: string;
  }>;
  modelAnswer: string;
  closingMessage: string;
}

export interface StudentSubmission {
  id: string;
  unitId: string;
  unitNumber: string;
  unitTitle: string;
  studentName: string;
  studentClass: string;
  schoolName: string;
  transcript: string;
  audioUrl?: string;
  durationSeconds?: number;
  rubricFeedback?: {
    pronunciation?: string;
    fluency?: string;
    vocabulary?: string;
    grammar?: string;
    contentDevelopment?: string;
  };
  strengths?: string[];
  nextTimeYouCanTry?: string[];
  teacherFeedback?: string;
  teacherRating?: number;
  submittedAt: string;
}
