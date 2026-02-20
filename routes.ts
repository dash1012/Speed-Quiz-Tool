import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuizzes, useDeleteQuiz, useCreateQuiz } from "@/hooks/use-quizzes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Plus, Play, Edit, Trash2, Clock, Users, FileJson, Loader2, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function QuizList() {
  const { data: quizzes, isLoading } = useQuizzes();
  const deleteQuiz = useDeleteQuiz();
  const createQuiz = useCreateQuiz();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = (quiz: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quiz));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${quiz.title.replace(/\s+/g, '_')}_export.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({ title: "내보내기 완료", description: "퀴즈가 파일로 저장되었습니다." });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation
        if (!json.title || !json.groups || !Array.isArray(json.groups)) {
          throw new Error("Invalid format");
        }
        // Remove ID to create new
        const { id, ...newQuiz } = json;
        setIsImporting(true);
        await createQuiz.mutateAsync(newQuiz);
        toast({ title: "가져오기 완료", description: "퀴즈를 성공적으로 가져왔습니다." });
      } catch (err) {
        toast({ title: "오류", description: "유효하지 않은 퀴즈 파일입니다.", variant: "destructive" });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">퀴즈 목록</h1>
          <p className="text-muted-foreground mt-1">게임을 시작할 퀴즈를 선택하거나 라이브러리를 관리하세요.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <label className="cursor-pointer">
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            <Button variant="outline" className="w-full md:w-auto" disabled={isImporting}>
              {isImporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileJson className="w-4 h-4 mr-2" />}
              가져오기
            </Button>
          </label>
          <Link href="/editor">
            <Button className="w-full md:w-auto shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              퀴즈 만들기
            </Button>
          </Link>
        </div>
      </div>

      {!quizzes?.length ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-muted-foreground/20">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-muted mb-4">
            <List className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">아직 퀴즈가 없습니다</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">첫 번째 퀴즈를 만들거나 파일에서 가져와서 시작해 보세요.</p>
          <Link href="/editor">
            <Button>첫 번째 퀴즈 만들기</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card className="h-full flex flex-col overflow-hidden hover:border-primary/50 transition-colors group card-lift">
                  <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/10 pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="font-display text-xl line-clamp-1">{quiz.title}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 -mt-1 -mr-2 text-muted-foreground hover:text-foreground"
                        onClick={() => handleExport(quiz)}
                        title="JSON으로 내보내기"
                      >
                        <FileJson className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription className="flex gap-4 mt-1">
                      <span className="flex items-center gap-1 text-xs font-medium bg-background/50 px-2 py-1 rounded-md">
                        <Users className="w-3 h-3" /> {quiz.groups.length} 그룹
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium bg-background/50 px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3" /> {quiz.timePerQuiz}초
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pt-6">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {quiz.groups.length}개 팀에 총 {quiz.groups.reduce((acc: number, g: any) => acc + g.words.length, 0)}개의 단어가 포함되어 있습니다.
                      패스 제한: {quiz.passLimit}회.
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2 gap-2 border-t border-border/40 bg-muted/5">
                    <Link href={`/play/${quiz.id}`} className="flex-1">
                      <Button className="w-full font-bold shadow-md shadow-primary/10 group-hover:shadow-primary/20">
                        <Play className="w-4 h-4 mr-2 fill-current" /> 시작하기
                      </Button>
                    </Link>
                    <Link href={`/editor/${quiz.id}`}>
                      <Button variant="outline" size="icon" title="수정">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" title="삭제">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>퀴즈를 삭제할까요?</AlertDialogTitle>
                          <AlertDialogDescription>
                            이 작업은 되돌릴 수 없습니다. "{quiz.title}" 퀴즈가 영구적으로 삭제됩니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteQuiz.mutate(quiz.id)} className="bg-destructive hover:bg-destructive/90">
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
