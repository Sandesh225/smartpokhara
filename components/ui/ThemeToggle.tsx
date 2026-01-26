
// src/components/ui/ThemeToggle.tsx
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/contexts/ThemeContext";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
};

// src/components/ui/Badge.tsx
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success';
  className?: string;
}

export const Badge = ({ 
  children, 
  variant = 'default',
  className = '' 
}: BadgeProps) => {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    success: 'bg-green-500/10 text-green-600 border-green-500/20',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};