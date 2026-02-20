import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";

// Pages
import Home from "@/pages/Home";
import QuizList from "@/pages/QuizList";
import QuizEditor from "@/pages/QuizEditor";
import GamePlay from "@/pages/GamePlay";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/quizzes" component={QuizList} />
        <Route path="/editor" component={QuizEditor} />
        <Route path="/editor/:id" component={QuizEditor} />
        <Route path="/play/:id" component={GamePlay} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="speed-quiz-theme">
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
