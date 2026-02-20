import { useEffect, useState, useRef, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuiz } from "@/hooks/use-quizzes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Check, X, SkipForward, RotateCcw, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "@/lib/audio";
import confetti from "canvas-confetti";
import clsx from "clsx";

type GameState = "select-group" | "countdown" | "playing" | "result" | "final-score";

type GroupScore = {
  name: string;
  score: number;
  played: boolean;
  history: { word: string; result: 'correct' | 'wrong' | 'pass' }[];
};

export default function GamePlay() {
  const [match, params] = useRoute("/play/:id");
  const quizId = params?.id ? parseInt(params.id) : 0;
  const { data: quiz, isLoading } = useQuiz(quizId);
  const [, setLocation] = useLocation();

  const [gameState, setGameState] = useState<GameState>("select-group");
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(-1);
  const [scores, setScores] = useState<GroupScore[]>([]);
  
  // Gameplay state
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [passesLeft, setPassesLeft] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [sessionScore, setSessionScore] = useState(0);
  
  // Refs for timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize scores when quiz loads
  useEffect(() => {
    if (quiz && scores.length === 0) {
      setScores(quiz.groups.map(g => ({
        name: g.name,
        score: 0,
        played: false,
        history: []
      })));
    }
  }, [quiz]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp") handleAction("correct");
      if (e.key === "x" || e.key === "ArrowDown") handleAction("wrong");
      if (e.key === "p" || e.key === "ArrowRight") handleAction("pass");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, currentWordIndex, passesLeft]);

  // Timer logic
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(t => t - 1);
        if (timeLeft <= 5) playSound('tick');
      }, 1000);
    } else if (gameState === "playing" && timeLeft === 0) {
      endTurn();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, timeLeft]);

  // Countdown logic
  useEffect(() => {
    if (gameState === "countdown" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(c => c - 1);
        playSound('tick');
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "countdown" && countdown === 0) {
      setGameState("playing");
      setTimeLeft(quiz?.timePerQuiz || 60);
      playSound('correct'); // start sound
    }
  }, [gameState, countdown]);

  const startTurn = (groupIndex: number) => {
    setActiveGroupIndex(groupIndex);
    setWords([...quiz!.groups[groupIndex].words].sort(() => Math.random() - 0.5)); // Shuffle
    setCurrentWordIndex(0);
    setPassesLeft(quiz!.passLimit);
    setSessionScore(0);
    setCountdown(3);
    setGameState("countdown");
  };

  const handleAction = (action: 'correct' | 'wrong' | 'pass') => {
    if (action === 'pass' && passesLeft <= 0) return;

    // Record history
    const currentWord = words[currentWordIndex];
    const newScores = [...scores];
    newScores[activeGroupIndex].history.push({ word: currentWord, result: action });

    // Update state
    if (action === 'correct') {
      setSessionScore(s => s + 1);
      newScores[activeGroupIndex].score += 1;
      playSound('correct');
    } else if (action === 'wrong') {
      playSound('wrong');
    } else if (action === 'pass') {
      setPassesLeft(p => p - 1);
      playSound('pass');
    }

    setScores(newScores);

    // Next word
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(i => i + 1);
    } else {
      endTurn();
    }
  };

  const endTurn = () => {
    playSound('finish');
    setGameState("result");
    const newScores = [...scores];
    newScores[activeGroupIndex].played = true;
    setScores(newScores);
  };

  const checkGameEnd = () => {
    if (scores.every(s => s.played)) {
      setGameState("final-score");
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setGameState("select-group");
    }
  };

  if (isLoading || !quiz) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
  }

  // --- RENDER STATES ---

  if (gameState === "select-group") {
    return (
      <div className="max-w-4xl mx-auto space-y-8 text-center pt-10">
        <h1 className="text-4xl font-display font-bold">플레이할 팀 선택</h1>
        <p className="text-muted-foreground">차례를 시작할 팀을 선택하세요.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {scores.map((group, idx) => (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={idx}>
              <Button
                variant={group.played ? "secondary" : "default"}
                className={clsx(
                  "w-full h-32 text-2xl font-display shadow-lg flex flex-col gap-2 rounded-2xl",
                  group.played ? "opacity-60 grayscale" : "bg-gradient-to-br from-primary to-primary/80 hover:to-primary"
                )}
                disabled={group.played}
                onClick={() => startTurn(idx)}
              >
                {group.name}
                {group.played && <span className="text-sm font-sans bg-background/20 px-2 py-0.5 rounded">점수: {group.score}</span>}
              </Button>
            </motion.div>
          ))}
        </div>
        
        {scores.some(s => s.played) && (
          <Button variant="outline" size="lg" onClick={() => setGameState("final-score")} className="mt-8">
            게임 조기 종료
          </Button>
        )}
      </div>
    );
  }

  if (gameState === "countdown") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-3xl font-bold mb-8 text-muted-foreground">{scores[activeGroupIndex].name} 준비하세요!</h2>
        <motion.div
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-9xl font-black text-primary font-display"
        >
          {countdown}
        </motion.div>
      </div>
    );
  }

  if (gameState === "playing") {
    const progress = ((quiz.timePerQuiz - timeLeft) / quiz.timePerQuiz) * 100;
    
    return (
      <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-xl font-bold text-muted-foreground">{scores[activeGroupIndex].name}</div>
          <div className={clsx("text-4xl font-black font-mono", timeLeft <= 5 ? "text-destructive animate-pulse" : "text-primary")}>
            {timeLeft}초
          </div>
          <div className="text-xl font-bold text-muted-foreground">점수: {sessionScore}</div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-8">
          <motion.div 
            className="h-full bg-primary" 
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 1 }}
          />
        </div>

        {/* Main Word Card */}
        <Card className="flex-1 flex items-center justify-center mb-8 relative overflow-hidden shadow-2xl border-2 border-primary/10">
          <div className="absolute top-4 right-4 text-sm font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
            패스: {passesLeft}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWordIndex}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 1.1 }}
              className="text-5xl md:text-8xl font-black text-center px-4 font-display text-foreground leading-tight"
            >
              {words[currentWordIndex]}
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-4 h-32">
          <Button 
            variant="destructive" 
            className="h-full text-2xl font-bold rounded-xl shadow-lg border-b-4 border-destructive/50 active:border-b-0 active:translate-y-1 transition-all"
            onClick={() => handleAction('wrong')}
          >
            <X className="w-8 h-8 mr-2" /> 틀림
            <span className="text-xs absolute bottom-4 opacity-70 block w-full">(0점)</span>
          </Button>
          
          <Button 
            variant="secondary" 
            className="h-full text-2xl font-bold rounded-xl shadow-lg border-b-4 border-secondary/50 active:border-b-0 active:translate-y-1 transition-all bg-yellow-400 hover:bg-yellow-500 text-yellow-950"
            onClick={() => handleAction('pass')}
            disabled={passesLeft <= 0}
          >
            <SkipForward className="w-8 h-8 mr-2" /> 패스
            <span className="text-xs absolute bottom-4 opacity-70 block w-full">({passesLeft}회 남음)</span>
          </Button>

          <Button 
            className="h-full text-2xl font-bold rounded-xl shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all bg-green-500 hover:bg-green-600 text-white"
            onClick={() => handleAction('correct')}
          >
            <Check className="w-8 h-8 mr-2" /> 정답!
            <span className="text-xs absolute bottom-4 opacity-70 block w-full">(+1점)</span>
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === "result") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-black font-display text-primary"
        >
          시간 종료!
        </motion.div>
        
        <div className="bg-card p-8 rounded-3xl shadow-xl border border-border w-full max-w-md">
          <h2 className="text-2xl font-bold mb-2">{scores[activeGroupIndex].name} 팀의 점수</h2>
          <div className="text-8xl font-black text-foreground mb-4">{sessionScore}</div>
          <p className="text-muted-foreground">이번 라운드 획득 점수</p>
        </div>

        <Button size="lg" className="w-48 text-lg h-14 rounded-xl" onClick={checkGameEnd}>
          계속하기 <SkipForward className="ml-2" />
        </Button>
      </div>
    );
  }

  if (gameState === "final-score") {
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);
    const maxScore = sortedScores[0].score;
    const winners = sortedScores.filter(s => s.score === maxScore);

    return (
      <div className="max-w-2xl mx-auto space-y-8 py-10">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black font-display bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            최종 결과
          </h1>
          <p className="text-xl text-muted-foreground">게임이 종료되었습니다! 최종 순위입니다.</p>
        </div>

        <div className="space-y-4">
          {sortedScores.map((group, idx) => (
            <motion.div
              key={group.name}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={clsx(
                "flex items-center p-4 border-2 transition-all",
                idx === 0 ? "border-accent bg-accent/5 scale-105 shadow-xl" : "border-border"
              )}>
                <div className={clsx(
                  "w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mr-4 shrink-0",
                  idx === 0 ? "bg-accent text-accent-foreground" : 
                  idx === 1 ? "bg-muted-foreground/30 text-muted-foreground" : 
                  idx === 2 ? "bg-orange-700/20 text-orange-700" : "bg-muted text-muted-foreground"
                )}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{group.name}</h3>
                  <div className="flex gap-2 mt-1">
                    정답: {group.history.filter(h => h.result === 'correct').length}
                    <span className="text-muted-foreground">•</span>
                    패스: {group.history.filter(h => h.result === 'pass').length}
                  </div>
                </div>
                <div className="text-4xl font-black text-primary ml-4">
                  {group.score}
                </div>
                {idx === 0 && <Award className="w-8 h-8 text-accent ml-4" />}
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-4 justify-center pt-8">
          <Button size="lg" variant="outline" onClick={() => setLocation("/quizzes")}>
            목록으로 돌아가기
          </Button>
          <Button size="lg" onClick={() => window.location.reload()}>
            <RotateCcw className="mr-2 w-4 h-4" /> 다시 하기
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
