import { Link } from "wouter";
import { motion } from "framer-motion";
import { Play, Plus, List, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="space-y-4"
      >
        <div className="w-24 h-24 bg-gradient-to-tr from-primary to-accent rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-primary/30 rotate-3 hover:rotate-6 transition-transform duration-300">
          <Play className="w-12 h-12 text-white fill-white ml-1" />
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent pb-2">
          스피드 퀴즈
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          그룹을 위한 궁극의 빠른 속도 트리비아 게임. 빠른 생각, 큰 외침, 그리고 끝없는 재미!
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center"
      >
        <Link href="/quizzes">
          <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
            <Play className="mr-2 w-5 h-5 fill-current" />
            게임 시작
          </Button>
        </Link>
        <Link href="/quizzes?mode=manage">
          <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg h-14 px-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <List className="mr-2 w-5 h-5" />
            퀴즈 관리
          </Button>
        </Link>
      </motion.div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
    </div>
  );
}
