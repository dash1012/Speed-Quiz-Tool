import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Gamepad2, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Create a simple context for sound settings if needed globally, 
// for now using local state in App or handled via props could work, 
// but let's assume a simple prop or local handling for this minimal version.
// Ideally this would be in a context.

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-tr from-primary to-accent p-2 rounded-xl shadow-lg shadow-primary/20">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
              스피드<span className="text-primary">퀴즈</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-10 h-10"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">테마 변경</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>테마 변경</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8 md:py-12">
        {children}
      </main>

      <footer className="py-8 border-t border-border/40 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} 스피드 퀴즈 툴. 재미를 위해 ❤️로 제작되었습니다.</p>
      </footer>
    </div>
  );
}
