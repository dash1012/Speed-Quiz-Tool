import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuiz, useCreateQuiz, useUpdateQuiz } from "@/hooks/use-quizzes";
import { insertQuizSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Trash2, Save, ArrowLeft, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Extended schema to handle the string[] <-> string conversion for textarea
const formSchema = insertQuizSchema.extend({
  groups: z.array(z.object({
    name: z.string().min(1, "그룹 이름은 필수입니다"),
    wordsString: z.string().min(1, "최소 한 개의 단어를 입력하세요"),
    words: z.array(z.string()).optional() // internal use only
  })).min(1, "최소 한 개의 그룹이 필요합니다"),
});

type FormValues = z.infer<typeof formSchema>;

export default function QuizEditor() {
  const [match, params] = useRoute("/editor/:id");
  const isEditing = !!match;
  const quizId = params?.id ? parseInt(params.id) : 0;
  
  const { data: quiz, isLoading: isLoadingQuiz } = useQuiz(quizId);
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      timePerQuiz: 60,
      passLimit: 3,
      groups: [
        { name: "그룹 A", wordsString: "사과, 바나나, 체리" },
        { name: "그룹 B", wordsString: "강아지, 고양이, 코끼리" }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "groups",
  });

  useEffect(() => {
    if (quiz) {
      form.reset({
        title: quiz.title,
        timePerQuiz: quiz.timePerQuiz,
        passLimit: quiz.passLimit,
        groups: quiz.groups.map(g => ({
          name: g.name,
          wordsString: g.words.join("\n"),
        })),
      });
    }
  }, [quiz, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Transform wordsString back to words array
      const payload = {
        title: values.title,
        timePerQuiz: values.timePerQuiz,
        passLimit: values.passLimit,
        groups: values.groups.map(g => ({
          name: g.name,
          words: g.wordsString.split(/[\n,]+/).map(w => w.trim()).filter(w => w.length > 0)
        })),
      };

      if (isEditing) {
        await updateQuiz.mutateAsync({ id: quizId, ...payload });
      } else {
        await createQuiz.mutateAsync(payload);
      }
      setLocation("/quizzes");
    } catch (error) {
      // handled by mutation hooks
    }
  };

  if (isEditing && isLoadingQuiz) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/quizzes")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">{isEditing ? "퀴즈 수정" : "새 퀴즈 만들기"}</h1>
          <p className="text-muted-foreground">설정을 구성하고 각 그룹의 단어 목록을 추가하세요.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>일반 설정</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>퀴즈 제목</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 금요일 밤 상식 퀴즈" {...field} className="text-lg font-medium" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timePerQuiz"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제한 시간 (초)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>패스 제한</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>단어를 건너뛸 수 있는 횟수입니다.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xl font-bold font-display">그룹 및 단어</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ name: `그룹 ${fields.length + 1}`, wordsString: "" })}>
                <Plus className="w-4 h-4 mr-2" /> 그룹 추가
              </Button>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id} className="relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 space-y-4">
                      <FormField
                        control={form.control}
                        name={`groups.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase text-muted-foreground font-bold">그룹 이름</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`groups.${index}.wordsString`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase text-muted-foreground font-bold">단어 (줄바꿈 또는 쉼표로 구분)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                className="min-h-[120px] font-mono text-sm bg-muted/20" 
                                placeholder="단어 1&#10;단어 2&#10;단어 3"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive mt-8"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="sticky bottom-4 z-10 flex justify-end gap-4 p-4 bg-background/80 backdrop-blur-lg border border-border/50 rounded-xl shadow-2xl">
            <Button type="button" variant="outline" onClick={() => setLocation("/quizzes")}>취소</Button>
            <Button type="submit" disabled={createQuiz.isPending || updateQuiz.isPending} className="min-w-[150px] shadow-lg shadow-primary/20">
              {(createQuiz.isPending || updateQuiz.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 저장 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> 퀴즈 저장
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
