import React, { useState, useEffect } from 'react';
import { HeaderProgress } from './components/HeaderProgress';
import { TeacherSetupModal } from './components/TeacherSetupModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { SubmissionsAnalyticsModal } from './components/SubmissionsAnalyticsModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Section1Video } from './components/sections/Section1Video';
import { Section2Mindmap } from './components/sections/Section2Mindmap';
import { Section3Expressions } from './components/sections/Section3Expressions';
import { Section4Practice } from './components/sections/Section4Practice';
import { Section5Challenge } from './components/sections/Section5Challenge';
import { Section6Feedback } from './components/sections/Section6Feedback';
import { DEFAULT_UNITS } from './data/defaultUnits';
import { TeacherMaterial, BackgroundThemeType } from './types';
import { sounds } from './utils/soundEffects';
import { hasValidApiKey } from './utils/geminiClient';

export default function App() {
  const [units, setUnits] = useState<TeacherMaterial[]>(DEFAULT_UNITS);
  const [currentMaterial, setCurrentMaterial] = useState<TeacherMaterial>(DEFAULT_UNITS[0]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [unlockedStep, setUnlockedStep] = useState<number>(1);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState<boolean>(false);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Auto-check API Key on initial mount per AI_INSTRUCTIONS.md
  useEffect(() => {
    if (!hasValidApiKey()) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  // App View Modes: 'dashboard' (Teacher Unit Hub) | 'lesson' (Interactive 6-step player)
  const [viewMode, setViewMode] = useState<'dashboard' | 'lesson'>('lesson');
  const [isStudentMode, setIsStudentMode] = useState<boolean>(false);

  // Student Section 5 recording / challenge state
  const [challengeTranscript, setChallengeTranscript] = useState<string>('');
  const [challengeAudioUrl, setChallengeAudioUrl] = useState<string>('');
  const [challengeDuration, setChallengeDuration] = useState<number>(40);
  const [hasFinishedLesson, setHasFinishedLesson] = useState<boolean>(false);

  // Load Units from Server or localStorage on mount
  useEffect(() => {
    async function fetchUnits() {
      try {
        const res = await fetch('/api/units');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setUnits(data);
            handleUrlRouting(data);
            return;
          }
        }
      } catch (err) {
        console.warn('API units fetch error, using stored local units:', err);
      }

      // Check localStorage
      const local = localStorage.getItem('esmart_units');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUnits(parsed);
            handleUrlRouting(parsed);
            return;
          }
        } catch (_) {}
      }

      // Fallback default
      handleUrlRouting(DEFAULT_UNITS);
    }

    function handleUrlRouting(allUnits: TeacherMaterial[]) {
      const params = new URLSearchParams(window.location.search);
      const unitParam = params.get('unit');
      const modeParam = params.get('mode');

      if (modeParam === 'student') {
        setIsStudentMode(true);
        setViewMode('lesson');
        const found = allUnits.find((u) => u.id === unitParam || u.unitNumber.toLowerCase().replace(/\s+/g, '-') === unitParam);
        if (found) {
          setCurrentMaterial(found);
        } else if (allUnits.length > 0) {
          setCurrentMaterial(allUnits[0]);
        }
      } else if (modeParam === 'teacher') {
        setIsStudentMode(false);
        if (unitParam) {
          const found = allUnits.find((u) => u.id === unitParam);
          if (found) setCurrentMaterial(found);
          setViewMode('lesson');
        } else {
          setViewMode('dashboard');
        }
      } else if (unitParam) {
        const found = allUnits.find((u) => u.id === unitParam);
        if (found) {
          setCurrentMaterial(found);
          setViewMode('lesson');
        }
      } else {
        // Default entry point: Show Teacher Dashboard
        setViewMode('dashboard');
      }
    }

    fetchUnits();
  }, []);

  const handleToggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Section completion handlers unlocking next section
  const handleSection1Complete = () => {
    setUnlockedStep((prev) => Math.max(prev, 2));
    setCurrentStep(2);
  };

  const handleSection2Complete = () => {
    setUnlockedStep((prev) => Math.max(prev, 3));
    setCurrentStep(3);
  };

  const handleSection3Complete = () => {
    setUnlockedStep((prev) => Math.max(prev, 4));
    setCurrentStep(4);
  };

  const handleSection4Complete = () => {
    setUnlockedStep((prev) => Math.max(prev, 5));
    setCurrentStep(5);
  };

  const handleSection5Complete = (transcript: string, audioUrl?: string, duration?: number) => {
    setChallengeTranscript(transcript);
    if (audioUrl) setChallengeAudioUrl(audioUrl);
    if (duration) setChallengeDuration(duration);

    setUnlockedStep((prev) => Math.max(prev, 6));
    setCurrentStep(6);
  };

  const handleTryAgainYes = () => {
    setHasFinishedLesson(false);
    setCurrentStep(5);
  };

  const handleTryAgainNo = () => {
    setHasFinishedLesson(true);
  };

  // Save modified or new material
  const handleSaveMaterial = async (newMaterial: TeacherMaterial) => {
    setCurrentMaterial(newMaterial);

    const updatedUnits = units.map((u) => (u.id === newMaterial.id ? newMaterial : u));
    if (!units.some((u) => u.id === newMaterial.id)) {
      updatedUnits.unshift(newMaterial);
    }
    setUnits(updatedUnits);

    // Save to localStorage
    localStorage.setItem('esmart_units', JSON.stringify(updatedUnits));

    // Save to backend API
    try {
      await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial),
      });
    } catch (e) {
      console.warn('Backend save unit fallback:', e);
    }

    // Reset progression
    setCurrentStep(1);
    setUnlockedStep(1);
    setChallengeTranscript('');
    setChallengeAudioUrl('');
    setHasFinishedLesson(false);
  };

  // Teacher Hub Handlers
  const handleSelectUnitFromDashboard = (unit: TeacherMaterial, isStudentView: boolean) => {
    setCurrentMaterial(unit);
    setIsStudentMode(isStudentView);
    setViewMode('lesson');
    setCurrentStep(1);
    setUnlockedStep(1);
    setChallengeTranscript('');
    setChallengeAudioUrl('');
    setHasFinishedLesson(false);
  };

  const handleCreateNewUnit = () => {
    const nextIdx = units.length + 1;
    const newUnit: TeacherMaterial = {
      id: `unit-${nextIdx}`,
      unitNumber: `Unit ${nextIdx}`,
      unitTitle: `New Speaking Unit ${nextIdx}`,
      curriculumInfo: 'Tiếng Anh 5 Global Success – General Education Curriculum 2018',
      knowledgeContent: 'Lesson theme, vocabulary and key sentence patterns...',
      backgroundType: 'preset',
      backgroundTheme: 'default',
      video: {
        sourceType: 'sample',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        caption: 'Model Speaking Presentation',
        transcript: 'Hello everyone! Today I want to talk about my favourite topic...',
        duration: '0:50',
      },
      mindmap: {
        sourceType: 'diagram',
        url: '',
        title: 'Mindmap: Key Ideas',
        branches: [
          {
            id: 'b1',
            title: 'Key Vocabulary',
            color: 'emerald',
            iconName: 'BookOpen',
            items: ['Vocabulary 1', 'Vocabulary 2'],
            simpleExplanation: 'This branch displays key vocabulary words.',
          },
          {
            id: 'b2',
            title: 'Sentence Patterns',
            color: 'blue',
            iconName: 'MessageSquare',
            items: ['Key question', 'Key answer'],
            simpleExplanation: 'Sentence patterns to practice speaking.',
          },
        ],
      },
      section1Questions: [
        {
          id: 's1_q1',
          question: 'What is the main topic of the presentation?',
          expectedHint: 'Key topic from the video',
          exampleAnswer: 'The presentation is about the main lesson topic.',
        },
      ],
      section2Questions: [
        {
          id: 's2_q1',
          question: 'What information do you see on the mindmap?',
          expectedHint: 'Look at the mindmap branches',
          exampleAnswer: 'I can see branches showing vocabulary and sentence patterns.',
        },
      ],
      usefulExpressions: [
        {
          id: 'exp1',
          english: 'Hello everyone! Today I would like to talk about this topic.',
          vietnameseGuide: 'Xin chào mọi người! Hôm nay mình muốn chia sẻ về chủ đề này.',
          category: 'Greeting & Opening',
        },
      ],
      practiceLevels: [
        {
          levelNumber: 1,
          levelName: 'Recognition',
          badgeTitle: 'Level 1: Recognition',
          buddyPrompt: 'Do you like learning English speaking?',
          options: ['Yes, I do', 'No, I do not'],
          sampleStudentAnswer: 'Yes, I do',
          hint: 'Say Yes, I do!',
        },
      ],
      modelAnswer: 'Hello everyone! Today I want to practice speaking English. Thank you for listening!',
    };

    setCurrentMaterial(newUnit);
    setIsTeacherModalOpen(true);
  };

  const handleDeleteUnit = async (unitId: string) => {
    const updated = units.filter((u) => u.id !== unitId);
    setUnits(updated);
    localStorage.setItem('esmart_units', JSON.stringify(updated));
    try {
      await fetch(`/api/units/${unitId}`, { method: 'DELETE' });
    } catch (_) {}
  };

  // Determine Background Style
  const getBackgroundStyle = () => {
    if (currentMaterial.backgroundType === 'upload' && currentMaterial.customBackgroundUrl) {
      return {
        backgroundImage: `url(${currentMaterial.customBackgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    }
    return {};
  };

  // Determine Preset Background Gradient Class
  const getBackgroundGradientClass = (theme?: BackgroundThemeType) => {
    switch (theme) {
      case 'sky':
        return 'from-sky-100 via-cyan-50 to-blue-100';
      case 'peach':
        return 'from-orange-100 via-amber-50 to-rose-100';
      case 'mint':
        return 'from-emerald-100 via-teal-50 to-green-100';
      case 'lavender':
        return 'from-purple-100 via-indigo-50 to-pink-100';
      case 'pink':
        return 'from-pink-100 via-rose-50 to-amber-50';
      case 'starry':
        return 'from-slate-100 via-indigo-50 to-purple-100';
      default:
        return 'from-amber-50/40 via-sky-50/30 to-pink-50/20';
    }
  };

  return (
    <div
      style={getBackgroundStyle()}
      className={`min-h-screen flex flex-col font-['Nunito',sans-serif] bg-gradient-to-b ${getBackgroundGradientClass(
        currentMaterial.backgroundTheme
      )} transition-colors duration-300 relative`}
    >
      {/* Semi-transparent backdrop overlay if custom background image is active */}
      {currentMaterial.backgroundType === 'upload' && currentMaterial.customBackgroundUrl && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] pointer-events-none z-0" />
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* VIEW 1: TEACHER DASHBOARD HUB */}
        {viewMode === 'dashboard' && !isStudentMode ? (
          <main className="flex-1">
            <TeacherDashboard
              units={units}
              onSelectUnit={handleSelectUnitFromDashboard}
              onEditUnit={(u) => {
                setCurrentMaterial(u);
                setIsTeacherModalOpen(true);
              }}
              onCreateUnit={handleCreateNewUnit}
              onDeleteUnit={handleDeleteUnit}
              onOpenSubmissions={() => setIsSubmissionsModalOpen(true)}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            />
          </main>
        ) : (
          /* VIEW 2: INTERACTIVE 6-STEP LESSON PLAYER (STUDENT OR TEACHER VIEW) */
          <>
            {/* Sticky Progress Header */}
            <HeaderProgress
              currentStep={currentStep}
              unlockedStep={unlockedStep}
              onSelectStep={(step) => {
                setCurrentStep(step);
                setHasFinishedLesson(false);
              }}
              unitNumber={currentMaterial.unitNumber}
              unitTitle={currentMaterial.unitTitle}
              onOpenTeacherModal={() => setIsTeacherModalOpen(true)}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              isStudentMode={isStudentMode}
              onBackToDashboard={() => setViewMode('dashboard')}
              onQuickShare={() => setIsTeacherModalOpen(true)}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            />

            {/* Main Content Sections */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
              {currentStep === 1 && (
                <Section1Video
                  material={currentMaterial}
                  onCompleteSection={handleSection1Complete}
                  onOpenTeacherUpload={() => setIsTeacherModalOpen(true)}
                  isStudentMode={isStudentMode}
                />
              )}

              {currentStep === 2 && (
                <Section2Mindmap
                  material={currentMaterial}
                  onCompleteSection={handleSection2Complete}
                  onOpenTeacherUpload={() => setIsTeacherModalOpen(true)}
                  isStudentMode={isStudentMode}
                />
              )}

              {currentStep === 3 && (
                <Section3Expressions
                  material={currentMaterial}
                  onCompleteSection={handleSection3Complete}
                />
              )}

              {currentStep === 4 && (
                <Section4Practice
                  material={currentMaterial}
                  onCompleteSection={handleSection4Complete}
                />
              )}

              {currentStep === 5 && (
                <Section5Challenge
                  material={currentMaterial}
                  onFinishChallenge={handleSection5Complete}
                  savedTranscript={challengeTranscript}
                  savedAudioUrl={challengeAudioUrl}
                />
              )}

              {currentStep === 6 && (
                <Section6Feedback
                  material={currentMaterial}
                  studentTranscript={challengeTranscript}
                  studentAudioUrl={challengeAudioUrl}
                  durationSeconds={challengeDuration}
                  onTryAgainYes={handleTryAgainYes}
                  onTryAgainNo={handleTryAgainNo}
                  hasFinishedLesson={hasFinishedLesson}
                />
              )}
            </main>
          </>
        )}

        {/* Teacher Setup Modal */}
        <TeacherSetupModal
          isOpen={isTeacherModalOpen}
          onClose={() => setIsTeacherModalOpen(false)}
          currentMaterial={currentMaterial}
          onSaveMaterial={handleSaveMaterial}
        />

        {/* Submissions & 5 Rubrics Radar Analytics Modal */}
        <SubmissionsAnalyticsModal
          isOpen={isSubmissionsModalOpen}
          onClose={() => setIsSubmissionsModalOpen(false)}
          units={units}
          selectedUnitId={currentMaterial.id}
        />

        {/* Gemini API Key & Model Configuration Modal per AI_INSTRUCTIONS.md */}
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          isMandatory={!hasValidApiKey()}
        />

        {/* Footer with "Designed by Tím" */}
        <footer className="mt-auto border-t border-amber-100 bg-white/85 backdrop-blur-xs py-3.5 text-center text-xs text-slate-500 font-semibold">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              🎓 <strong>E-SMART ENGLISH KIDS</strong> • Tiếng Anh 5 Global Success (General Education Curriculum 2018)
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-black tracking-wide border border-pink-200">
                Designed by Tím
              </span>
              <span className="text-purple-600 font-bold hidden sm:inline">
                • Speaking Confidence for Kids
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
