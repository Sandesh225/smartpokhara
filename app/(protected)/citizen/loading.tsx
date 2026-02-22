import { Loader2, ShieldCheck } from "lucide-react";

export default function CitizenLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-5 bg-background">
      <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-inner-lg animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" strokeWidth={2.5} />
      </div>
      <div className="text-center space-y-1.5 animate-fade-in">
        <h2 className="font-heading font-bold text-xl text-foreground">Loading your portal</h2>
        <p className="font-sans text-sm text-muted-foreground">
          <ShieldCheck className="inline w-3.5 h-3.5 mr-1.5 align-middle" />
          Pokhara Metropolitan City
        </p>
      </div>
    </div>
  );
}
