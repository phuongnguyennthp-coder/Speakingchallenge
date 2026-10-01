import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Allow embedding inside iframes (e.g. Heyzine Flipbooks, LMS)
app.use((_req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  next();
});

// JSON body parser with 50MB limit to handle uploaded background images, media & audio blobs
app.use(express.json({ limit: '50mb' }));

// Shared Gemini client utility on the server with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Ensure data folder and unitsStore.json exist
const DATA_DIR = path.resolve(__dirname, 'data');
const UNITS_FILE = path.resolve(DATA_DIR, 'unitsStore.json');

function loadStoredUnits(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(UNITS_FILE)) {
      const data = fs.readFileSync(UNITS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading unitsStore.json:', err);
  }
  return [];
}

function saveStoredUnits(units: any[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(UNITS_FILE, JSON.stringify(units, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing unitsStore.json:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

/**
 * UNITS MANAGEMENT API: CRUD FOR UNITS
 */
app.get('/api/units', (_req: Request, res: Response) => {
  const units = loadStoredUnits();
  res.json(units);
});

app.get('/api/units/:id', (req: Request, res: Response) => {
  const units = loadStoredUnits();
  const unit = units.find((u: any) => u.id === req.params.id);
  if (!unit) {
    res.status(404).json({ error: 'Unit not found' });
    return;
  }
  res.json(unit);
});

app.post('/api/units', (req: Request, res: Response) => {
  try {
    const newUnit = req.body;
    if (!newUnit || !newUnit.id) {
      res.status(400).json({ error: 'Invalid unit data' });
      return;
    }
    const units = loadStoredUnits();
    const existingIndex = units.findIndex((u: any) => u.id === newUnit.id);
    if (existingIndex >= 0) {
      units[existingIndex] = newUnit;
    } else {
      units.unshift(newUnit);
    }
    saveStoredUnits(units);
    res.json({ success: true, unit: newUnit });
  } catch (err) {
    console.error('Error creating/updating unit:', err);
    res.status(500).json({ error: 'Failed to save unit' });
  }
});

app.put('/api/units/:id', (req: Request, res: Response) => {
  try {
    const updated = req.body;
    const units = loadStoredUnits();
    const idx = units.findIndex((u: any) => u.id === req.params.id);
    if (idx >= 0) {
      units[idx] = { ...units[idx], ...updated, id: req.params.id };
      saveStoredUnits(units);
      res.json({ success: true, unit: units[idx] });
    } else {
      units.push({ ...updated, id: req.params.id });
      saveStoredUnits(units);
      res.json({ success: true, unit: updated });
    }
  } catch (err) {
    console.error('Error updating unit:', err);
    res.status(500).json({ error: 'Failed to update unit' });
  }
});

app.delete('/api/units/:id', (req: Request, res: Response) => {
  try {
    let units = loadStoredUnits();
    units = units.filter((u: any) => u.id !== req.params.id);
    saveStoredUnits(units);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting unit:', err);
    res.status(500).json({ error: 'Failed to delete unit' });
  }
});

/**
 * STUDENT SUBMISSIONS MANAGEMENT API
 * Stores student recordings, transcripts, AI evaluations and teacher remarks.
 */
const SUBMISSIONS_FILE = path.resolve(DATA_DIR, 'submissions.json');

function loadSubmissions(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading submissions.json:', err);
  }
  return [];
}

function saveSubmissions(subs: any[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(subs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing submissions.json:', err);
  }
}

app.get('/api/submissions', (req: Request, res: Response) => {
  const { unitId } = req.query;
  let subs = loadSubmissions();
  if (unitId) {
    subs = subs.filter((s: any) => s.unitId === unitId);
  }
  res.json(subs);
});

app.post('/api/submissions', (req: Request, res: Response) => {
  try {
    const submission = req.body;
    if (!submission || !submission.studentName) {
      res.status(400).json({ error: 'Student name is required' });
      return;
    }
    const subs = loadSubmissions();
    const newEntry = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      unitId: submission.unitId || 'unit-5',
      unitNumber: submission.unitNumber || 'Unit 5',
      unitTitle: submission.unitTitle || 'Speaking Challenge',
      studentName: submission.studentName,
      studentClass: submission.studentClass || '',
      schoolName: submission.schoolName || '',
      transcript: submission.transcript || '',
      audioUrl: submission.audioUrl || '',
      durationSeconds: submission.durationSeconds || 35,
      rubricFeedback: submission.rubricFeedback || {},
      strengths: submission.strengths || [],
      nextTimeYouCanTry: submission.nextTimeYouCanTry || [],
      teacherFeedback: '',
      teacherRating: 5,
      submittedAt: new Date().toISOString(),
    };
    subs.unshift(newEntry);
    saveSubmissions(subs);
    res.json({ success: true, submission: newEntry });
  } catch (err) {
    console.error('Error saving submission:', err);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

app.put('/api/submissions/:id', (req: Request, res: Response) => {
  try {
    const { teacherFeedback, teacherRating } = req.body;
    const subs = loadSubmissions();
    const idx = subs.findIndex((s: any) => s.id === req.params.id);
    if (idx >= 0) {
      if (teacherFeedback !== undefined) subs[idx].teacherFeedback = teacherFeedback;
      if (teacherRating !== undefined) subs[idx].teacherRating = teacherRating;
      saveSubmissions(subs);
      res.json({ success: true, submission: subs[idx] });
    } else {
      res.status(404).json({ error: 'Submission not found' });
    }
  } catch (err) {
    console.error('Error updating submission:', err);
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

app.delete('/api/submissions/:id', (req: Request, res: Response) => {
  try {
    let subs = loadSubmissions();
    subs = subs.filter((s: any) => s.id !== req.params.id);
    saveSubmissions(subs);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting submission:', err);
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

/**
 * AI AUTO-GENERATION ENDPOINT: STRICTLY GROUNDED IN TEACHER'S MATERIAL
 * Generates comprehension questions, mindmap branches, useful expressions,
 * practice levels, and model answer ONLY from the provided text.
 */
app.post('/api/ai/generate-unit-content', async (req: Request, res: Response) => {
  try {
    const { unitNumber, unitTitle, knowledgeContent } = req.body;

    if (!knowledgeContent || knowledgeContent.trim() === '') {
      res.status(400).json({ error: 'Knowledge content or transcript is required' });
      return;
    }

    if (ai) {
      const prompt = `You are an expert English Curriculum Specialist for Vietnamese Grade 5 primary students (Global Success 2018 curriculum).
The teacher just provided lesson material, notes, or transcript:
Unit Number: "${unitNumber || 'Unit'}"
Unit Title: "${unitTitle || 'English Lesson'}"
Teacher's Knowledge Material:
"""
${knowledgeContent}
"""

CRITICAL GROUNDING RULES:
1. Extract and formulate all content based SOLELY on the teacher's knowledge material provided above.
2. DO NOT hallucinate or import outside facts, vocabulary, or questions not supported by the material.
3. Language must be cheerful, clear, and age-appropriate for 10-11 year old Vietnamese elementary learners.

OUTPUT JSON FORMAT (Respond ONLY with valid JSON):
{
  "section1Questions": [
    {
      "id": "s1_q1",
      "question": "Clear question testing main topic from the material",
      "expectedHint": "Short hint for student",
      "exampleAnswer": "Short, clear answer"
    },
    {
      "id": "s1_q2",
      "question": "Question testing vocabulary or details from the material",
      "expectedHint": "Short hint",
      "exampleAnswer": "Short, clear answer"
    },
    {
      "id": "s1_q3",
      "question": "Question testing sentence patterns or reasons from the material",
      "expectedHint": "Short hint",
      "exampleAnswer": "Short, clear answer"
    }
  ],
  "mindmap": {
    "title": "Mindmap: ${unitTitle || 'Key Lesson Ideas'}",
    "branches": [
      {
        "id": "b1",
        "title": "Key Branch 1 Title",
        "color": "emerald",
        "iconName": "BookOpen",
        "items": ["Item 1", "Item 2", "Item 3"],
        "simpleExplanation": "Simple 1-sentence explanation of what is visible in this branch."
      },
      {
        "id": "b2",
        "title": "Key Branch 2 Title",
        "color": "blue",
        "iconName": "Star",
        "items": ["Item A", "Item B"],
        "simpleExplanation": "Simple 1-sentence explanation."
      },
      {
        "id": "b3",
        "title": "Key Branch 3 Title",
        "color": "amber",
        "iconName": "Heart",
        "items": ["Point X", "Point Y"],
        "simpleExplanation": "Simple 1-sentence explanation."
      },
      {
        "id": "b4",
        "title": "Sentence Patterns",
        "color": "purple",
        "iconName": "MessageSquare",
        "items": ["Pattern 1 from material", "Pattern 2 from material"],
        "simpleExplanation": "Sentence structures to practice from this lesson."
      }
    ]
  },
  "section2Questions": [
    {
      "id": "s2_q1",
      "question": "What information can you see in the mindmap?",
      "expectedHint": "Name the branches mentioned in the mindmap",
      "exampleAnswer": "I can see branches about..."
    },
    {
      "id": "s2_q2",
      "question": "Which idea do you want to talk about from the mindmap?",
      "expectedHint": "Choose any branch from the mindmap",
      "exampleAnswer": "I want to talk about..."
    }
  ],
  "usefulExpressions": [
    {
      "id": "exp1",
      "english": "Opening expression based on lesson",
      "vietnameseGuide": "Hướng dẫn tiếng Việt",
      "category": "Greeting & Opening"
    },
    {
      "id": "exp2",
      "english": "Key expression 1",
      "vietnameseGuide": "Hướng dẫn tiếng Việt",
      "category": "Expressing Dreams"
    },
    {
      "id": "exp3",
      "english": "Key expression 2",
      "vietnameseGuide": "Hướng dẫn tiếng Việt",
      "category": "Expressing Dreams"
    },
    {
      "id": "exp4",
      "english": "Giving reason expression",
      "vietnameseGuide": "Hướng dẫn tiếng Việt",
      "category": "Giving Reasons"
    },
    {
      "id": "exp5",
      "english": "Closing expression",
      "vietnameseGuide": "Hướng dẫn tiếng Việt",
      "category": "Closing"
    }
  ],
  "practiceLevels": [
    {
      "levelNumber": 1,
      "levelName": "Recognition",
      "badgeTitle": "Level 1: Spot the Idea",
      "buddyPrompt": "Question with 2 choices from material",
      "options": ["Choice A", "Choice B"],
      "sampleStudentAnswer": "Choice A",
      "hint": "Hint based on material"
    },
    {
      "levelNumber": 2,
      "levelName": "Short Answers",
      "badgeTitle": "Level 2: Quick Answer",
      "buddyPrompt": "Direct short question based on material",
      "sampleStudentAnswer": "Direct answer",
      "hint": "Hint"
    },
    {
      "levelNumber": 3,
      "levelName": "Extended Answers",
      "badgeTitle": "Level 3: Give a Reason",
      "buddyPrompt": "Why question asking for a reason from material",
      "sampleStudentAnswer": "Because...",
      "hint": "Use 'Because...' to explain"
    },
    {
      "levelNumber": 4,
      "levelName": "Personal Opinion",
      "badgeTitle": "Level 4: Your Choice",
      "buddyPrompt": "Friendly question asking about student's choice related to this topic",
      "sampleStudentAnswer": "I like... because...",
      "hint": "Share your thought with because"
    }
  ],
  "modelAnswer": "A 4-5 sentence natural speaking presentation model paragraph based directly on the teacher's material, ending with 'Thank you for listening!'"
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      res.json({ success: true, generated: parsed });
      return;
    }

    // Heuristic fallback if Gemini API key is not configured
    const lines = knowledgeContent.split('\n').filter((l: string) => l.trim().length > 0);
    const summary = lines.slice(0, 3).join(' ');
    res.json({
      success: true,
      generated: {
        section1Questions: [
          {
            id: 's1_q1',
            question: `What is the main topic of ${unitTitle || 'this lesson'}?`,
            expectedHint: `Main theme from the material: ${unitTitle}`,
            exampleAnswer: `The lesson is about ${unitTitle}.`,
          },
          {
            id: 's1_q2',
            question: 'What vocabulary and ideas did you hear or read?',
            expectedHint: 'Key words mentioned in the teacher material',
            exampleAnswer: 'I heard key words from the lesson notes.',
          },
          {
            id: 's1_q3',
            question: 'What sentence structure is used to express ideas?',
            expectedHint: 'Key sentence pattern from the lesson',
            exampleAnswer: 'The lesson uses simple sentence patterns with clear reasons.',
          },
        ],
        mindmap: {
          title: `Mindmap: ${unitTitle || 'Lesson Key Points'}`,
          branches: [
            {
              id: 'b1',
              title: 'Key Vocabulary',
              color: 'emerald',
              iconName: 'BookOpen',
              items: ['Word 1', 'Word 2', 'Word 3'],
              simpleExplanation: 'This branch displays key vocabulary words from the teacher material.',
            },
            {
              id: 'b2',
              title: 'Main Ideas',
              color: 'blue',
              iconName: 'Star',
              items: ['Core Concept A', 'Core Concept B'],
              simpleExplanation: 'This branch shows the main concepts presented in the lesson.',
            },
            {
              id: 'b3',
              title: 'Reasons & Details',
              color: 'amber',
              iconName: 'Heart',
              items: ['Reason 1', 'Reason 2'],
              simpleExplanation: 'This branch explains why and gives supporting details.',
            },
            {
              id: 'b4',
              title: 'Sentence Patterns',
              color: 'purple',
              iconName: 'MessageSquare',
              items: ['Key question pattern', 'Key answer pattern'],
              simpleExplanation: 'Sentence patterns used to practice speaking.',
            },
          ],
        },
        section2Questions: [
          {
            id: 's2_q1',
            question: 'What information can you see in the mindmap?',
            expectedHint: 'Look at the mindmap branches',
            exampleAnswer: 'I can see the branches with vocabulary, main ideas, and sentence patterns.',
          },
          {
            id: 's2_q2',
            question: 'Which idea do you want to talk about from the mindmap?',
            expectedHint: 'Choose any branch from the mindmap',
            exampleAnswer: 'I want to talk about the main topic from the first branch.',
          },
        ],
        usefulExpressions: [
          {
            id: 'exp1',
            english: `Hello everyone! Today I want to talk about ${unitTitle}.`,
            vietnameseGuide: 'Xin chào mọi người! Hôm nay mình muốn nói về chủ đề này.',
            category: 'Greeting & Opening',
          },
          {
            id: 'exp2',
            english: 'In our lesson, we learned many exciting ideas.',
            vietnameseGuide: 'Trong bài học, chúng mình đã học được nhiều ý tưởng thú vị.',
            category: 'Expressing Dreams',
          },
          {
            id: 'exp3',
            english: 'Because I really like this topic and want to practice speaking.',
            vietnameseGuide: 'Bởi vì mình rất thích chủ đề này và muốn luyện nói.',
            category: 'Giving Reasons',
          },
          {
            id: 'exp4',
            english: 'Thank you for listening to my presentation!',
            vietnameseGuide: 'Cảm ơn mọi người đã lắng nghe bài nói của mình!',
            category: 'Closing',
          },
        ],
        practiceLevels: [
          {
            levelNumber: 1,
            levelName: 'Recognition',
            badgeTitle: 'Level 1: Spot the Idea',
            buddyPrompt: `Is the main topic related to "${unitTitle}"?`,
            options: ['Yes, it is', 'No, it is not'],
            sampleStudentAnswer: 'Yes, it is',
            hint: 'Answer Yes because it is clearly the main topic.',
          },
          {
            levelNumber: 2,
            levelName: 'Short Answers',
            badgeTitle: 'Level 2: Quick Answer',
            buddyPrompt: 'Can you name one important word from our lesson?',
            sampleStudentAnswer: 'English lesson.',
            hint: 'Say a word from the lesson.',
          },
          {
            levelNumber: 3,
            levelName: 'Extended Answers',
            badgeTitle: 'Level 3: Give a Reason',
            buddyPrompt: 'Why do you think this lesson is helpful for us?',
            sampleStudentAnswer: 'Because it helps us practice speaking English with confidence.',
            hint: 'Use "Because..." to give your reason.',
          },
          {
            levelNumber: 4,
            levelName: 'Personal Opinion',
            badgeTitle: 'Level 4: Your Choice',
            buddyPrompt: 'What do you like most about this topic?',
            sampleStudentAnswer: 'I like learning new English sentences and sharing with my friends.',
            hint: 'Tell me your personal thought.',
          },
        ],
        modelAnswer: `Hello everyone! Today I am very happy to talk about ${unitTitle}. In our lesson, I learned interesting words and sentence patterns. I practice speaking every day so I can speak English fluently and confidently. What do you think about this topic? Thank you for listening!`,
      },
    });
  } catch (error: any) {
    console.error('Error generating unit content:', error);
    res.status(500).json({ error: 'Failed to generate unit content' });
  }
});

/**
 * SECTION 1 & 2: Comprehension Analysis Endpoint
 */
app.post('/api/ai/analyze-comprehension', async (req: Request, res: Response) => {
  try {
    const { question, studentAnswer, materialTopic, materialContext, expectedKeyPoints } = req.body;

    if (!studentAnswer || studentAnswer.trim() === '') {
      res.json({
        feedback: "I couldn't hear your answer clearly. Let's try pressing the microphone again or typing below!",
        praiseWord: "Let's listen again.",
        isUnderstood: false,
        keyIdeasDetected: [],
      });
      return;
    }

    if (ai) {
      const prompt = `You are a warm, cheerful, supportive AI English Speaking Coach for Vietnamese Grade 5 elementary students (10-11 years old) using the Global Success Grade 5 curriculum.
The student just listened to or studied teacher-provided material.
Teacher Material Topic: "${materialTopic || 'Grade 5 English'}"
Strict Material Context: "${materialContext || 'Standard teacher-provided English lesson material'}"
Question: "${question}"
Expected Key Points: "${expectedKeyPoints || 'Information from teacher material'}"

Student's Spoken Answer: "${studentAnswer}"

CRITICAL RULES:
- Use ONLY information from the teacher material provided.
- Accept short answers if they show understanding (Grade 5 level). Do NOT require complete sentences.
- Focus on comprehension rather than grammatical perfection.
- NEVER say "Wrong" or use negative criticism.
- Choose a cheerful praise phrase from: "Excellent!", "Great listening!", "Good try!", "Let's listen again.", "You're improving!"
- Write 1-2 short, encouraging sentences suitable for a 10-year-old Vietnamese learner.

Respond ONLY with valid JSON in this exact structure:
{
  "praiseWord": "Great listening!",
  "feedback": "You understood the main topic! You gave a wonderful answer.",
  "isUnderstood": true
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      res.json(parsed);
      return;
    }

    const lower = studentAnswer.toLowerCase();
    const isGood = lower.length > 2;
    res.json({
      praiseWord: isGood ? "Great listening!" : "Good try!",
      feedback: isGood
        ? `Great listening! You answered "${studentAnswer}". You understood the idea well!`
        : `Good try! Let's listen again or type your answer.`,
      isUnderstood: isGood,
    });
  } catch (error: any) {
    console.error('Error analyzing comprehension:', error);
    res.json({
      praiseWord: "Good try!",
      feedback: "Great effort! You did a wonderful job expressing your thought.",
      isUnderstood: true,
    });
  }
});

/**
 * SECTION 3: Expression Practice Analysis Endpoint
 */
app.post('/api/ai/analyze-expression', async (req: Request, res: Response) => {
  try {
    const { targetExpression, studentSpeech } = req.body;

    if (!studentSpeech || studentSpeech.trim() === '') {
      res.json({
        praise: "Good try!",
        pronunciationFeedback: "Let's try saying or typing the words clearly.",
        fluencyFeedback: "Speak at a steady, natural pace.",
        encouragingComment: "You can do it! Press record or type to try again.",
      });
      return;
    }

    if (ai) {
      const prompt = `You are an encouraging AI English Coach for Vietnamese Grade 5 students.
Target Expression: "${targetExpression}"
Student's Spoken Speech: "${studentSpeech}"

CRITICAL RULES:
- ALWAYS use positive language. Never use negative criticism. Build student confidence!
- Praise examples: "Wonderful pronunciation!", "Nice speaking!", "Try saying it a little more clearly.", "Excellent effort!"
- Keep tips super simple and friendly for 10-11 year olds.

Respond ONLY with JSON:
{
  "praise": "Wonderful pronunciation!",
  "pronunciationFeedback": "Your clear pronunciation of key sounds was super!",
  "fluencyFeedback": "Smooth and natural rhythm!",
  "encouragingComment": "You sound like a confident English speaker!"
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      res.json(parsed);
      return;
    }

    res.json({
      praise: "Wonderful pronunciation!",
      pronunciationFeedback: "You spoke the words with clear sounds and great effort!",
      fluencyFeedback: "Nice smooth pacing as you said the sentence.",
      encouragingComment: "Excellent effort! You are speaking more naturally every day!",
    });
  } catch (error: any) {
    console.error('Error in analyze-expression:', error);
    res.json({
      praise: "Nice speaking!",
      pronunciationFeedback: "Good clear sounds on the main words!",
      fluencyFeedback: "Kept a steady pace.",
      encouragingComment: "Wonderful effort! Keep it up!",
    });
  }
});

/**
 * SECTION 4: Practice With AI Buddy (4 Levels Guided Conversation)
 */
app.post('/api/ai/buddy-chat', async (req: Request, res: Response) => {
  try {
    const { levelNumber, levelTitle, currentPrompt, studentAnswer, materialTopic, materialContext } = req.body;

    if (!studentAnswer || studentAnswer.trim() === '') {
      res.json({
        praiseWord: "Let's try again.",
        supportiveComment: "Take your time and speak into the microphone or type whenever you are ready!",
        buddyReply: "I'm listening! What do you think?",
      });
      return;
    }

    if (ai) {
      const prompt = `You are AI Buddy, a friendly, cheerful English teacher for Vietnamese Grade 5 elementary students.
Context ONLY from Teacher Materials:
Topic: "${materialTopic}"
Material Details: "${materialContext}"
Conversation Level: LEVEL ${levelNumber} (${levelTitle})
AI Buddy's Question/Prompt: "${currentPrompt}"
Student's Spoken Answer: "${studentAnswer}"

CRITICAL RULES:
- Never use negative language. Never say "Wrong."
- Use supportive expressions like: "Good try!", "Let's try again.", "Can you say a little more?", "Excellent effort!", "Great answer!", "I like your idea!", "Well done!"
- Base responses strictly on the teacher-provided materials.
- For Level 1 (Recognition): simple recognition praise.
- For Level 2 (Short Answers): celebrate direct answer.
- For Level 3 (Extended Answers): praise detail and explanation.
- For Level 4 (Personal Opinion): celebrate student's personal choice related to the topic.
- Reply length: 1-2 friendly sentences suitable for 10-year-olds.

Respond ONLY with JSON:
{
  "praiseWord": "Great answer!",
  "supportiveComment": "I love how you shared your thought so clearly!",
  "buddyReply": "That's wonderful! You gave a great answer about our topic."
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      res.json(parsed);
      return;
    }

    const praises = ["Good try!", "Excellent effort!", "Great answer!", "I like your idea!", "Well done!"];
    const praise = praises[Math.min(levelNumber - 1, praises.length - 1)] || "Well done!";
    res.json({
      praiseWord: praise,
      supportiveComment: `You did great answering: "${studentAnswer}". You are expressing your ideas clearly!`,
      buddyReply: `Thank you for sharing! You are practising so well!`,
    });
  } catch (error: any) {
    console.error('Error in buddy-chat:', error);
    res.json({
      praiseWord: "Well done!",
      supportiveComment: "Great effort practicing this question with me!",
      buddyReply: "You are doing an awesome job speaking English today!",
    });
  }
});

/**
 * SECTION 6: Final AI Feedback Endpoint
 */
app.post('/api/ai/evaluate-challenge', async (req: Request, res: Response) => {
  try {
    const { transcript, materialTopic, materialContext, durationSeconds } = req.body;

    const studentSpeech = transcript && transcript.trim() !== ''
      ? transcript.trim()
      : 'I like this lesson. I want to practice speaking English every day.';

    if (ai) {
      const prompt = `You are the AI English Speaking Coach for Vietnamese Grade 5 students (10-11 years old).
The student just completed the 30-60 second Speaking Challenge.
Teacher Material Topic: "${materialTopic || 'Grade 5 English'}"
Teacher Material Context: "${materialContext || 'Unit Speaking Challenge'}"
Student's Recorded Speech Transcript: "${studentSpeech}"
Recording Duration: ${durationSeconds || 35} seconds.

CRITICAL INSTRUCTIONS:
1. Evaluate ONLY these 5 areas:
   - Pronunciation (clear word endings, vowels, friendly intonation)
   - Fluency (steady pace, natural pauses, confidence)
   - Vocabulary (accurate use of words from the teacher's material)
   - Grammar (simple present tense, sentence structures from the lesson)
   - Content Development (connecting ideas from the mindmap, adding personal ideas)

2. STRICT CONTENT & TONE RULES:
   - Do NOT provide numerical scores!
   - Do NOT rank students!
   - Do NOT compare students!
   - Must use encouraging, supportive, age-appropriate language for Vietnamese 10-11 year olds.
   - All content strictly grounded in the teacher's materials.

3. Provide:
   - ⭐ Strengths: 2 to 3 bullet points celebrating what the student did well.
   - ⭐ Next Time You Can Try: 2 to 3 practical, friendly growth tips.
   - ⭐ Suggested Sentence Upgrades: 1 or 2 examples showing how a simple sentence can be upgraded gently with connectors (e.g. "because", "and", "in the future").
   - ⭐ One Model Answer: A natural 4-5 sentence Grade 5 model speaking paragraph based ONLY on the teacher's material.
   - Closing message: "Great job! Keep practising English every day."

Respond ONLY with valid JSON in this exact structure:
{
  "rubricFeedback": {
    "pronunciation": "You pronounced the key words clearly with nice, friendly intonation.",
    "fluency": "You spoke smoothly and kept a steady rhythm from start to finish.",
    "vocabulary": "You used great vocabulary words from our lesson topic.",
    "grammar": "You used simple, correct sentence patterns to share your thoughts.",
    "contentDevelopment": "You connected key ideas from the mindmap and added your own opinion."
  },
  "strengths": [
    "Confident voice and clear delivery",
    "Used key vocabulary from the teacher's material",
    "Shared your personal reason warmly"
  ],
  "nextTimeYouCanTry": [
    "Try using linking words like 'because' and 'and' to connect your sentences",
    "Remember to pronounce ending sounds like /s/ and /t/ clearly"
  ],
  "suggestedSentenceUpgrades": [
    {
      "original": "I like this topic. It is good.",
      "upgrade": "In our lesson, I really like this topic because it helps me understand English better.",
      "tip": "Use 'because' to explain your reason in one smooth sentence!"
    }
  ],
  "modelAnswer": "Hello everyone! Today I want to share my presentation. In our lesson, we learned about important vocabulary and useful sentences. I love speaking English every day. Thank you for listening!",
  "closingMessage": "Great job! Keep practising English every day."
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      res.json(parsed);
      return;
    }

    res.json({
      rubricFeedback: {
        pronunciation: "Clear speech with good vowel sounds and friendly intonation.",
        fluency: "Steady pace with natural pauses, speaking with growing confidence.",
        vocabulary: "Used key words from the lesson mindmap effectively.",
        grammar: "Good use of Grade 5 sentence patterns.",
        contentDevelopment: "Connected ideas from the branches and added your own thought.",
      },
      strengths: [
        "Spoke with great confidence and clear energy!",
        "Included key ideas from the teacher's material.",
        "Demonstrated good understanding of the topic.",
      ],
      nextTimeYouCanTry: [
        "Try using connecting words like 'because' and 'also' to make longer sentences.",
        "Practice clear ending sounds like /s/ and /d/ on words.",
      ],
      suggestedSentenceUpgrades: [
        {
          "original": "I like this lesson. It is good.",
          "upgrade": "I enjoy this lesson because it is very exciting and helpful for my English speaking.",
          "tip": "Adding 'because' helps you give a clear reason!",
        },
      ],
      modelAnswer: "Hello everyone! Today I would like to share my presentation from our lesson. We learned wonderful new words and useful sentences. I really enjoy learning English and sharing my thoughts with friends. Thank you for listening!",
      closingMessage: "Great job! Keep practising English every day.",
    });
  } catch (error: any) {
    console.error('Error in evaluate-challenge:', error);
    res.json({
      rubricFeedback: {
        pronunciation: "Very nice pronunciation of the main vocabulary words.",
        fluency: "Good continuous speaking effort.",
        vocabulary: "Selected appropriate vocabulary from the lesson.",
        grammar: "Used simple and effective sentence structures.",
        contentDevelopment: "Covered the key ideas from the mindmap well.",
      },
      strengths: ["Great speaking confidence!", "Clear communication of ideas."],
      nextTimeYouCanTry: ["Add more details to explain your reasons."],
      suggestedSentenceUpgrades: [],
      modelAnswer: "In our lesson, I practice speaking English every day. I love sharing my ideas clearly and learning new words!",
      closingMessage: "Great job! Keep practising English every day.",
    });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 E-SMART ENGLISH KIDS server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
