import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Trophy, Star, Sparkles, Volume2, CheckCircle2, Gamepad2 } from 'lucide-react';
import { TeacherMaterial } from '../types';
import { sounds } from '../utils/soundEffects';
import { speechService } from '../utils/speech';

interface VocabularyGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: TeacherMaterial;
}

interface CardItem {
  id: string; // unique card id
  pairId: string; // id shared by the two matching cards
  text: string;
  type: 'word' | 'meaning';
  icon?: string;
  category?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const VocabularyGameModal: React.FC<VocabularyGameModalProps> = ({
  isOpen,
  onClose,
  material,
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Initialize cards from unit materials
  useEffect(() => {
    if (isOpen) {
      initGame();
    } else {
      setIsTimerRunning(false);
    }
  }, [isOpen, material]);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && !isGameOver) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isGameOver]);

  const initGame = () => {
    // Collect potential items from mindmap branches & useful expressions
    const candidates: Array<{ word: string; meaning: string; icon?: string }> = [];

    // From mindmap branches
    (material.mindmap?.branches || []).forEach((b) => {
      (b.items || []).forEach((item) => {
        if (item.trim() && !candidates.some((c) => c.word.toLowerCase() === item.toLowerCase())) {
          candidates.push({
            word: item.trim(),
            meaning: `Nhánh: ${b.title}`,
            icon: '💡',
          });
        }
      });
    });

    // From useful expressions
    (material.usefulExpressions || []).forEach((exp) => {
      if (exp.english && !candidates.some((c) => c.word.toLowerCase() === exp.english.toLowerCase())) {
        candidates.push({
          word: exp.english,
          meaning: exp.vietnameseGuide || 'Mẫu câu rèn nói',
          icon: '💬',
        });
      }
    });

    // Fallback if few items
    if (candidates.length < 4) {
      candidates.push(
        { word: 'Speaking Challenge', meaning: 'Thử thách bài nói', icon: '🎤' },
        { word: 'English Champion', meaning: 'Nhà vô địch tiếng Anh', icon: '🏆' },
        { word: 'Confidence', meaning: 'Sự tự tin khi nói', icon: '⭐' },
        { word: 'Practice daily', meaning: 'Luyện tập mỗi ngày', icon: '📚' }
      );
    }

    // Select 6 pairs (12 cards)
    const selected = candidates.slice(0, 6);

    const generatedCards: CardItem[] = [];
    selected.forEach((item, idx) => {
      const pairId = `pair_${idx}`;
      // Card 1: English word / phrase
      generatedCards.push({
        id: `card_${idx}_word`,
        pairId,
        text: item.word,
        type: 'word',
        icon: item.icon,
        category: 'English',
        isFlipped: false,
        isMatched: false,
      });
      // Card 2: Vietnamese / Clue
      generatedCards.push({
        id: `card_${idx}_meaning`,
        pairId,
        text: item.meaning,
        type: 'meaning',
        icon: '🎯',
        category: 'Ý nghĩa / Nhánh',
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffled = generatedCards.sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setIsGameOver(false);
    setSeconds(0);
    setIsTimerRunning(true);
  };

  const handleCardClick = (index: number) => {
    if (!isTimerRunning) setIsTimerRunning(true);

    // Can't click if 2 cards already flipped, or card is already flipped/matched
    if (flippedCards.length >= 2 || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    sounds.playEncouragementChime();

    // Read aloud if it's an English word
    if (cards[index].type === 'word') {
      speechService.speak(cards[index].text, undefined, 0.9, 1.05);
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // MATCH!
        setTimeout(() => {
          sounds.playPraiseChime();
          const matched = [...newCards];
          matched[firstIdx].isMatched = true;
          matched[secondIdx].isMatched = true;
          setCards(matched);
          setFlippedCards([]);

          const nextMatchedCount = matchedPairs + 1;
          setMatchedPairs(nextMatchedCount);

          if (nextMatchedCount === cards.length / 2) {
            // GAME WON!
            setTimeout(() => {
              sounds.playCelebrationFanfare();
              setIsGameOver(true);
              setIsTimerRunning(false);
            }, 500);
          }
        }, 600);
      } else {
        // NO MATCH -> Flip back after delay
        setTimeout(() => {
          const reset = [...cards];
          reset[firstIdx].isFlipped = false;
          reset[secondIdx].isFlipped = false;
          setCards(reset);
          setFlippedCards([]);
        }, 1100);
      }
    }
  };

  const calculateStars = () => {
    if (moves <= 10) return 3;
    if (moves <= 16) return 2;
    return 1;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in font-['Nunito',sans-serif]">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 p-4 sm:p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-lg">
                  Gamification Warm-up
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider bg-pink-500 px-2 py-0.5 rounded-lg">
                  Designed by Tím
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-heading">
                🎮 Trò Chơi Lật Thẻ Ghép Đôi Từ Vựng
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Stats Bar */}
        <div className="bg-amber-50 px-5 py-3 border-b border-amber-200 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm font-bold text-slate-700">
          <div className="flex items-center gap-4">
            <span className="bg-white px-3 py-1 rounded-xl border border-amber-200 shadow-xs">
              ⏱️ Thời gian: <strong>{seconds}s</strong>
            </span>
            <span className="bg-white px-3 py-1 rounded-xl border border-amber-200 shadow-xs">
              🎯 Số lượt lật: <strong>{moves}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-purple-700 font-black">
              Đã ghép: {matchedPairs} / {cards.length / 2} cặp
            </span>
            <button
              onClick={initGame}
              className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Chơi lại</span>
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {isGameOver ? (
            /* Celebration Screen */
            <div className="text-center py-8 px-4 space-y-5 animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-400 p-1 shadow-xl animate-bounce flex items-center justify-center text-4xl">
                🏆
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                  Xuất Sắc! Em Đã Chiến Thắng! 🎉
                </h3>
                <p className="text-sm font-bold text-slate-600">
                  Em đã hoàn thành trò chơi trong <strong>{seconds} giây</strong> với <strong>{moves} lượt lật</strong>.
                </p>
              </div>

              {/* Star Rating */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`w-10 h-10 ${
                      star <= calculateStars()
                        ? 'fill-amber-400 text-amber-400 animate-pulse'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200 max-w-md mx-auto text-xs sm:text-sm font-bold text-purple-900">
                ⭐ Em đã ghi nhớ rất tốt các từ vựng trọng tâm của {material.unitNumber}! Bây giờ hãy tự tin bước vào bài luyện nói nhé!
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={initGame}
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm flex items-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chơi Lại Ván Mới</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tiếp Tục Luyện Nói</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {cards.map((card, idx) => {
                const isRevealed = card.isFlipped || card.isMatched;

                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    className={`aspect-4/3 sm:aspect-square rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 select-none shadow-md ${
                      card.isMatched
                        ? 'bg-emerald-100 border-2 border-emerald-400 opacity-80 cursor-default scale-95 ring-2 ring-emerald-300'
                        : isRevealed
                        ? card.type === 'word'
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-2 border-purple-300 shadow-purple-200'
                          : 'bg-gradient-to-br from-pink-500 to-rose-600 text-white border-2 border-pink-300 shadow-pink-200'
                        : 'bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400 hover:brightness-105 border-2 border-amber-200 text-white hover:scale-102 active:scale-95'
                    }`}
                  >
                    {isRevealed ? (
                      <div className="space-y-1.5 animate-fade-in flex flex-col items-center justify-center h-full">
                        <span className="text-xl sm:text-2xl">{card.icon || '⭐'}</span>
                        <div
                          className={`font-black font-heading leading-tight line-clamp-3 ${
                            card.text.length > 25 ? 'text-xs' : 'text-xs sm:text-sm'
                          }`}
                        >
                          {card.text}
                        </div>
                        <span className="text-[10px] uppercase font-bold opacity-80 px-2 py-0.5 rounded-md bg-black/20">
                          {card.category}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="w-10 h-10 rounded-2xl bg-white/30 backdrop-blur-xs flex items-center justify-center text-xl font-black">
                          ?
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-950/70">
                          Lật Thẻ
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Tip */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-center text-xs text-slate-500 font-semibold flex items-center justify-between">
          <span>💡 Lật 2 thẻ ghép trúng giữa Từ tiếng Anh và Ý nghĩa / Nhánh bài học tương ứng.</span>
          <span className="font-bold text-pink-600">Designed by Tím</span>
        </div>
      </div>
    </div>
  );
};
