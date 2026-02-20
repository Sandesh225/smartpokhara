import Link from "next/link";

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 mt-auto border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground/80">Smart Pokhara</span>
            <span>&copy; {currentYear}</span>
        </div>
        
        <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Help Center</Link>
        </div>

        <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
            <span>Powered by</span>
            <span className="font-bold text-foreground/80">Municipality OS</span>
        </div>
      </div>
    </footer>
  );
}
