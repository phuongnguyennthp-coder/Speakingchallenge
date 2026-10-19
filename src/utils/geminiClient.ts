/**
 * Gemini Client with Model Fallback & Retry Mechanism
 * Supports:
 * 1. gemini-3-flash-preview (Default)
 * 2. gemini-3-pro-preview
 * 3. gemini-2.5-flash
 * 
 * Complies strictly with AI_INSTRUCTIONS.md:
 * - API Key saved in localStorage ('gemini_api_key')
 * - Automatic retry with next model if current model encounters errors (e.g. 429 RESOURCE_EXHAUSTED)
 * - Returns exact raw error string if all models fail
 */

export interface ModelCardInfo {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  desc: string;
}

export const GEMINI_MODEL_LIST: ModelCardInfo[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    badge: 'Khuyên dùng (Default)',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    desc: 'Phản hồi cực nhanh, tối ưu hóa cho tương tác nói và tạo câu hỏi thời gian thực.',
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    badge: 'Mạnh mẽ nhất',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    desc: 'Lý luận sâu, chấm điểm kỹ năng nói toàn diện và phát triển ý tưởng bài học phong phú.',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Ổn định / Dự phòng',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    desc: 'Hạn ngạch rộng, độ ổn định cao, dự phòng tự động khi model khác hết quota.',
  },
];

export const DEFAULT_MODEL_ID = 'gemini-3-flash-preview';

export const FALLBACK_MODEL_CHAIN = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
];

/**
 * Storage helpers
 */
export function getStoredApiKey(): string {
  try {
    const localKey = localStorage.getItem('gemini_api_key');
    if (localKey && localKey.trim()) return localKey.trim();
  } catch (_) {}
  return '';
}

export function setStoredApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem('gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  } catch (_) {}
}

export function getStoredModel(): string {
  try {
    const localModel = localStorage.getItem('gemini_model');
    if (localModel && localModel.trim()) return localModel.trim();
  } catch (_) {}
  return DEFAULT_MODEL_ID;
}

export function setStoredModel(model: string): void {
  try {
    localStorage.setItem('gemini_model', model);
  } catch (_) {}
}

export function hasValidApiKey(): boolean {
  return Boolean(getStoredApiKey());
}

export interface GeminiCallOptions {
  systemInstruction?: string;
  responseMimeType?: 'application/json' | 'text/plain';
  responseSchema?: any;
}

/**
 * Executes a Gemini prompt with automatic fallback and retry across the model chain.
 * If current model returns an error (such as 429 RESOURCE_EXHAUSTED or 503),
 * it immediately retries with the next model in the fallback chain.
 * If all models fail, it throws the raw exact error message.
 */
export async function callGeminiWithFallback(
  prompt: string,
  options: GeminiCallOptions = {}
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('CHƯA_CÓ_API_KEY: Vui lòng nhập Gemini API Key của bạn để sử dụng tính năng AI.');
  }

  const preferredModel = getStoredModel();
  // Build chain starting with user's preferred model, followed by the rest
  const chain = [preferredModel, ...FALLBACK_MODEL_CHAIN.filter((m) => m !== preferredModel)];

  let lastError: Error | null = null;
  const attemptedErrors: string[] = [];

  for (let i = 0; i < chain.length; i++) {
    const currentModel = chain[i];
    try {
      console.log(`[Gemini Engine] Trying model [${currentModel}] (${i + 1}/${chain.length})...`);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

      const requestBody: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      };

      if (options.systemInstruction) {
        requestBody.systemInstruction = {
          role: 'system',
          parts: [{ text: options.systemInstruction }],
        };
      }

      const generationConfig: any = {};
      if (options.responseMimeType === 'application/json') {
        generationConfig.responseMimeType = 'application/json';
        if (options.responseSchema) {
          generationConfig.responseSchema = options.responseSchema;
        }
      }

      if (Object.keys(generationConfig).length > 0) {
        requestBody.generationConfig = generationConfig;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const rawMessage =
          errorData?.error?.message ||
          `HTTP ${res.status} ${res.statusText || 'Error from Google API'}`;
        const errorCode = errorData?.error?.code || res.status;
        const errorStatus = errorData?.error?.status || '';

        const fullErrorStr = `${errorCode} ${errorStatus ? errorStatus + ': ' : ''}${rawMessage}`;
        throw new Error(fullErrorStr);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { text, modelUsed: currentModel };
    } catch (err: any) {
      console.warn(`[Gemini Fallback] Model [${currentModel}] failed:`, err?.message || err);
      lastError = err;
      attemptedErrors.push(`[${currentModel}]: ${err?.message || 'Unknown error'}`);

      // Continue to next model in the fallback chain!
    }
  }

  // All models failed! Throw raw exact error from the last model or summary
  const summaryError = lastError?.message || attemptedErrors.join(' | ');
  throw new Error(summaryError);
}

/**
 * 1. AI Helper: Auto-generate full Unit content strictly grounded in knowledge
 */
export async function aiGenerateUnitContent(
  knowledgeContent: string,
  unitNumber: string,
  unitTitle: string
): Promise<any> {
  const systemInstruction = `You are an expert English teacher specializing in the Vietnamese primary curriculum (Tiếng Anh 5 Global Success - GDPT 2018).
Your task is to create a complete speaking lesson strictly based on the provided lesson text/transcript.
IMPORTANT: You MUST ONLY use vocabulary, sentence structures, and ideas present in the provided knowledge content. Do not introduce outside concepts.`;

  const prompt = `Knowledge content provided by teacher:
"""
${knowledgeContent}
"""

Target Unit: ${unitNumber} - ${unitTitle}

Generate a comprehensive JSON response matching this exact structure:
{
  "unitTitle": "${unitTitle}",
  "section1Questions": [
    { "id": "q1", "question": "Question 1 grounded in text", "expectedHint": "Short hint from text", "exampleAnswer": "Full sample answer" },
    { "id": "q2", "question": "Question 2 grounded in text", "expectedHint": "Short hint from text", "exampleAnswer": "Full sample answer" },
    { "id": "q3", "question": "Question 3 grounded in text", "expectedHint": "Short hint from text", "exampleAnswer": "Full sample answer" }
  ],
  "mindmapBranches": [
    { "id": "b1", "title": "Branch 1 Title", "color": "emerald", "iconName": "BookOpen", "items": ["Item 1", "Item 2"], "simpleExplanation": "Explanation" },
    { "id": "b2", "title": "Branch 2 Title", "color": "blue", "iconName": "Briefcase", "items": ["Item 1", "Item 2"], "simpleExplanation": "Explanation" },
    { "id": "b3", "title": "Branch 3 Title", "color": "amber", "iconName": "Compass", "items": ["Item 1", "Item 2"], "simpleExplanation": "Explanation" },
    { "id": "b4", "title": "Branch 4 Title", "color": "purple", "iconName": "Sparkles", "items": ["Item 1", "Item 2"], "simpleExplanation": "Explanation" }
  ],
  "usefulExpressions": [
    { "id": "exp1", "english": "Key sentence pattern 1", "vietnameseGuide": "Hướng dẫn tiếng Việt", "category": "Greeting & Opening" },
    { "id": "exp2", "english": "Key sentence pattern 2", "vietnameseGuide": "Hướng dẫn tiếng Việt", "category": "Expressing Dreams" },
    { "id": "exp3", "english": "Key sentence pattern 3", "vietnameseGuide": "Hướng dẫn tiếng Việt", "category": "Giving Reasons" },
    { "id": "exp4", "english": "Key sentence pattern 4", "vietnameseGuide": "Hướng dẫn tiếng Việt", "category": "Closing" }
  ],
  "practiceLevels": [
    { "levelNumber": 1, "levelName": "Recognition", "badgeTitle": "Level 1: Quick Word Check", "buddyPrompt": "Prompt from text", "sampleStudentAnswer": "Sample answer", "hint": "Hint" },
    { "levelNumber": 2, "levelName": "Short Answers", "badgeTitle": "Level 2: One-Sentence Reply", "buddyPrompt": "Prompt from text", "sampleStudentAnswer": "Sample answer", "hint": "Hint" },
    { "levelNumber": 3, "levelName": "Extended Answers", "badgeTitle": "Level 3: Full Reason & Details", "buddyPrompt": "Prompt from text", "sampleStudentAnswer": "Sample answer", "hint": "Hint" },
    { "levelNumber": 4, "levelName": "Personal Opinion", "badgeTitle": "Level 4: Mini Presentation", "buddyPrompt": "Prompt from text", "sampleStudentAnswer": "Sample answer", "hint": "Hint" }
  ],
  "modelAnswer": "A 4-5 sentence complete model presentation summarizing the topic clearly with opening, body, and closing."
}`;

  const { text } = await callGeminiWithFallback(prompt, {
    systemInstruction,
    responseMimeType: 'application/json',
  });

  return JSON.parse(text);
}

/**
 * Offline Fallback Engines for Students (Zero Barrier, No API Key Required)
 */
function getOfflineComprehension(question: string, expectedHint: string, studentSpeech: string) {
  const cleanSpeech = studentSpeech.toLowerCase().trim();
  const cleanHint = expectedHint.toLowerCase().trim();
  const praises = ['Awesome! ⭐', 'Great Job! 🌟', 'Super! 🎉', 'Well Done! 👏'];
  const randomPraise = praises[Math.floor(Math.random() * praises.length)];

  const hasKeyword = cleanHint.split(/\s+/).some((w) => w.length > 3 && cleanSpeech.includes(w));

  return {
    praiseWord: randomPraise,
    encouragement: hasKeyword ? 'Accurate answer! Well done!' : 'Good listening and clear speaking!',
    correctionTip: '',
    isUnderstood: true,
  };
}

function getOfflineExpression(targetExpression: string, studentSpeech: string) {
  const targetWords = targetExpression.toLowerCase().split(/\s+/);
  const speechWords = studentSpeech.toLowerCase().split(/\s+/);
  const matches = targetWords.filter((w) => speechWords.includes(w)).length;
  const ratio = targetWords.length > 0 ? matches / targetWords.length : 1;

  if (ratio >= 0.4 || speechWords.length >= 3) {
    return {
      praise: 'Super pronunciation! ⭐',
      pronunciationFeedback: 'Clear word sounds and nice intonation!',
      fluencyFeedback: 'Natural rhythm and smooth pace!',
      encouragingComment: 'You sounded confident and clear!',
    };
  }

  return {
    praise: 'Good practice! 👏',
    pronunciationFeedback: 'Pay attention to ending sounds /s/ and /t/.',
    fluencyFeedback: 'Keep a steady speaking pace.',
    encouragingComment: 'Listen to the sample and try again!',
  };
}

function getOfflineBuddyChat(levelNumber: number, buddyPrompt: string, studentSpeech: string) {
  if (levelNumber === 1) {
    return {
      praiseWord: 'Great! ⭐',
      supportiveComment: 'Quick and accurate word choice!',
      buddyReply: 'Yes, exactly! You got the right idea!',
    };
  }
  if (levelNumber === 2) {
    return {
      praiseWord: 'Super! 🌟',
      supportiveComment: 'Clear full sentence response!',
      buddyReply: 'I understand you completely! Great sentence!',
    };
  }
  if (levelNumber === 3) {
    return {
      praiseWord: 'Brilliant! 🎉',
      supportiveComment: 'Detailed ideas with good reasons!',
      buddyReply: 'Wonderful thoughts! You explain your ideas so well!',
    };
  }
  return {
    praiseWord: 'Outstanding! 🏆',
    supportiveComment: 'Confident presentation of your opinion!',
    buddyReply: 'You spoke like a true English speaking champion!',
  };
}

function getOfflineChallengeEvaluation(transcript: string, topic: string, durationSeconds: number) {
  return {
    rubricFeedback: {
      pronunciation: 'Clear English sounds and good word endings.',
      fluency: durationSeconds >= 25 ? 'Natural speaking flow and steady pace.' : 'Good speaking pace! Try to speak a bit longer next time.',
      vocabulary: 'Accurate words matching the lesson mindmap.',
      grammar: 'Simple, correct sentence structures used.',
      contentDevelopment: 'Clear ideas connected directly to the topic.',
    },
    strengths: [
      'Spoke with great confidence and clear voice.',
      'Used key vocabulary from the lesson mindmap.',
      'Completed the speaking challenge enthusiastically.',
    ],
    nextTimeYouCanTry: [
      "Connect ideas using words like 'because', 'also', and 'and'.",
      'Pronounce ending sounds /s/ and /t/ more clearly.',
    ],
    suggestedSentenceUpgrades: [
      {
        original: 'I like this topic. It is good.',
        upgrade: 'I really love this topic because it is very fun and meaningful.',
        tip: "Use 'because' to explain your reasons!",
      },
    ],
    closingMessage: 'Super proud of your speaking challenge today! Keep shining ⭐',
  };
}

/**
 * 2. AI Helper: Comprehension analysis (Section 1 & 2)
 * Enforces: Very short concise feedback (under 10 words) & strict grounding
 * With instant offline fallback so students are NEVER blocked!
 */
export async function aiAnalyzeComprehension(
  question: string,
  expectedHint: string,
  studentSpeech: string
): Promise<any> {
  if (!hasValidApiKey()) {
    return getOfflineComprehension(question, expectedHint, studentSpeech);
  }

  try {
    const prompt = `You are a friendly primary school English coach for Vietnamese Grade 5 kids.
Question: "${question}"
Expected Hint / Answer idea: "${expectedHint}"
Student spoke / typed: "${studentSpeech}"

CRITICAL RULES:
1. FEEDBACK PHẢI CỰC KỲ NGẮN GỌN VÀ ÍT CHỮ (mỗi câu dưới 10 từ). Trẻ em không đọc đoạn văn dài!
2. BÁM SÁT 100% NỘI DUNG BÀI / MINDMAP, tuyệt đối không lấy ngoài.

Return JSON:
{
  "praiseWord": "1-2 words cheerful praise (e.g. 'Awesome!', 'Great Job!', 'Super!')",
  "encouragement": "Very short praise (under 8 words, e.g. 'Accurate answer! Well done!')",
  "correctionTip": "Short tip under 8 words if not quite right, or empty string",
  "isUnderstood": true
}`;

    const { text } = await callGeminiWithFallback(prompt, {
      responseMimeType: 'application/json',
    });

    return JSON.parse(text);
  } catch (err) {
    console.warn('[Gemini Client] aiAnalyzeComprehension fallback triggered:', err);
    return getOfflineComprehension(question, expectedHint, studentSpeech);
  }
}

/**
 * 3. AI Helper: Expression pronunciation and fluency analysis (Section 3)
 * With instant offline fallback so students are NEVER blocked!
 */
export async function aiAnalyzeExpression(
  targetExpression: string,
  studentSpeech: string
): Promise<any> {
  if (!hasValidApiKey()) {
    return getOfflineExpression(targetExpression, studentSpeech);
  }

  try {
    const prompt = `Target sentence to practice: "${targetExpression}"
Student spoke / typed: "${studentSpeech}"

RULE: Keep feedback very short, concise and friendly (under 8 words each).
Return JSON:
{
  "praise": "Short praise (e.g. 'Great pronunciation!')",
  "pronunciationFeedback": "Short tip under 8 words (e.g. 'Clear word sounds!')",
  "fluencyFeedback": "Short tip under 8 words (e.g. 'Natural rhythm and pace!')",
  "encouragingComment": "Short cheer under 8 words (e.g. 'Keep up the good speaking!')"
}`;

    const { text } = await callGeminiWithFallback(prompt, {
      responseMimeType: 'application/json',
    });

    return JSON.parse(text);
  } catch (err) {
    console.warn('[Gemini Client] aiAnalyzeExpression fallback triggered:', err);
    return getOfflineExpression(targetExpression, studentSpeech);
  }
}

/**
 * 4. AI Helper: Dialogue Buddy response (Section 4)
 * With instant offline fallback so students are NEVER blocked!
 */
export async function aiBuddyChat(
  levelNumber: number,
  buddyPrompt: string,
  studentSpeech: string
): Promise<any> {
  if (!hasValidApiKey()) {
    return getOfflineBuddyChat(levelNumber, buddyPrompt, studentSpeech);
  }

  try {
    const prompt = `You are AI Buddy, chatting with a Grade 5 Vietnamese child.
Level: ${levelNumber}
Buddy Prompt: "${buddyPrompt}"
Child's reply: "${studentSpeech}"

RULE: Keep buddy response very short and friendly (1 short sentence, under 10 words).
Return JSON:
{
  "praiseWord": "Great! / Super! / Wonderful!",
  "supportiveComment": "Short comment under 8 words",
  "buddyReply": "One short conversational reply under 10 words"
}`;

    const { text } = await callGeminiWithFallback(prompt, {
      responseMimeType: 'application/json',
    });

    return JSON.parse(text);
  } catch (err) {
    console.warn('[Gemini Client] aiBuddyChat fallback triggered:', err);
    return getOfflineBuddyChat(levelNumber, buddyPrompt, studentSpeech);
  }
}

/**
 * 5. AI Helper: Final 30-60s Challenge Evaluation (Section 6)
 * With instant offline fallback so students are NEVER blocked!
 */
export async function aiEvaluateChallenge(
  transcript: string,
  topic: string,
  durationSeconds: number,
  context?: string
): Promise<any> {
  if (!hasValidApiKey()) {
    return getOfflineChallengeEvaluation(transcript, topic, durationSeconds);
  }

  try {
    const prompt = `Topic: "${topic}"
Context: "${context || topic}"
Student Speaking Duration: ${durationSeconds} seconds
Student Speaking Transcript: "${transcript}"

CRITICAL RULE: Feedback must be SHORT, CONCISE, and FEW WORDS (each sentence under 10-12 words).
Strictly grounded in topic / mindmap. No outside inferences.

Return JSON:
{
  "rubricFeedback": {
    "pronunciation": "Short comment under 10 words (e.g. 'Clear sounds and good ending consonants.')",
    "fluency": "Short comment under 10 words (e.g. 'Good natural flow and steady pace.')",
    "vocabulary": "Short comment under 10 words (e.g. 'Accurate words from the lesson mindmap.')",
    "grammar": "Short comment under 10 words (e.g. 'Simple, correct sentence structures used.')",
    "contentDevelopment": "Short comment under 10 words (e.g. 'Clear ideas connected directly to the topic.')"
  },
  "strengths": [
    "Short strength 1 under 8 words",
    "Short strength 2 under 8 words"
  ],
  "nextTimeYouCanTry": [
    "Short friendly tip under 8 words"
  ],
  "suggestedSentenceUpgrades": [
    {
      "original": "Short simple sentence from student",
      "upgrade": "Better Grade 5 sentence",
      "tip": "Short tip under 8 words"
    }
  ],
  "closingMessage": "One short cheerful sentence under 10 words."
}`;

    const { text } = await callGeminiWithFallback(prompt, {
      responseMimeType: 'application/json',
    });

    return JSON.parse(text);
  } catch (err) {
    console.warn('[Gemini Client] aiEvaluateChallenge fallback triggered:', err);
    return getOfflineChallengeEvaluation(transcript, topic, durationSeconds);
  }
}

