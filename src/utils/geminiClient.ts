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
 * 2. AI Helper: Comprehension analysis (Section 1 & 2)
 */
export async function aiAnalyzeComprehension(
  question: string,
  expectedHint: string,
  studentSpeech: string
): Promise<any> {
  const prompt = `You are a supportive primary school English coach for Vietnamese Grade 5 students.
Question: "${question}"
Expected Hint / Answer idea: "${expectedHint}"
Student spoke / typed: "${studentSpeech}"

Evaluate the student's answer kindly and constructively. Return JSON:
{
  "praiseWord": "A cheerful 1-2 word praise like 'Awesome!', 'Brilliant!', 'Great Job!', 'Super Star!'",
  "encouragement": "A warm, encouraging sentence explaining what they did well.",
  "correctionTip": "A friendly tip if they missed an idea, or empty string if correct.",
  "isUnderstood": true or false
}`;

  const { text } = await callGeminiWithFallback(prompt, {
    responseMimeType: 'application/json',
  });

  return JSON.parse(text);
}

/**
 * 3. AI Helper: Expression pronunciation and fluency analysis (Section 3)
 */
export async function aiAnalyzeExpression(
  targetExpression: string,
  studentSpeech: string
): Promise<any> {
  const prompt = `Target sentence to practice: "${targetExpression}"
Student spoke / typed: "${studentSpeech}"

Give gentle, enthusiastic feedback for a Grade 5 student. Return JSON:
{
  "praise": "Warm praise like 'Fantastic pronunciation!' or 'Well done!'",
  "pronunciationFeedback": "Specific praise on clarity of words.",
  "fluencyFeedback": "Comment on speaking rhythm and flow.",
  "encouragingComment": "A positive sentence motivating them to keep speaking."
}`;

  const { text } = await callGeminiWithFallback(prompt, {
    responseMimeType: 'application/json',
  });

  return JSON.parse(text);
}

/**
 * 4. AI Helper: Dialogue Buddy response (Section 4)
 */
export async function aiBuddyChat(
  levelNumber: number,
  buddyPrompt: string,
  studentSpeech: string
): Promise<any> {
  const prompt = `You are AI Buddy, a friendly robotic peer chatting with a Grade 5 Vietnamese child.
Level: ${levelNumber}
Your previous question: "${buddyPrompt}"
Child's reply: "${studentSpeech}"

Respond encouragingly with natural conversational English suitable for Grade 5. Return JSON:
{
  "praiseWord": "Great! / Wonderful! / Super!",
  "supportiveComment": "A supportive sentence admiring what the child shared.",
  "buddyReply": "Your next friendly response (1-2 sentences) showing you listened."
}`;

  const { text } = await callGeminiWithFallback(prompt, {
    responseMimeType: 'application/json',
  });

  return JSON.parse(text);
}

/**
 * 5. AI Helper: Final 30-60s Challenge Evaluation (Section 6)
 */
export async function aiEvaluateChallenge(
  transcript: string,
  topic: string,
  durationSeconds: number,
  context?: string
): Promise<any> {
  const prompt = `Topic: "${topic}"
Context: "${context || topic}"
Student Speaking Duration: ${durationSeconds} seconds
Student Speaking Transcript: "${transcript}"

Evaluate according to the 5 Grade 5 speaking criteria (Pronunciation, Fluency, Vocabulary, Grammar, Content Development).
Return JSON matching this exact structure:
{
  "rubricFeedback": {
    "pronunciation": "Gentle, specific assessment of clarity, ending sounds (/s/, /t/, /d/).",
    "fluency": "Assessment of rhythm, natural pauses, and continuous speaking flow.",
    "vocabulary": "Praise for topic-related vocabulary words used.",
    "grammar": "Feedback on sentence structures, connectors (because, and, so).",
    "contentDevelopment": "Assessment of opening, key ideas from mindmap, and closing."
  },
  "strengths": [
    "Strength 1 with positive energy",
    "Strength 2",
    "Strength 3"
  ],
  "nextTimeYouCanTry": [
    "Friendly actionable suggestion 1",
    "Friendly actionable suggestion 2"
  ],
  "suggestedSentenceUpgrades": [
    {
      "original": "A simple sentence from the student",
      "upgrade": "A slightly richer upgraded version suitable for Grade 5",
      "tip": "Why this upgrade makes the sentence better"
    }
  ],
  "closingMessage": "An inspiring, warm closing message praising their courage and progress."
}`;

  const { text } = await callGeminiWithFallback(prompt, {
    responseMimeType: 'application/json',
  });

  return JSON.parse(text);
}
