import { Phone, Mail, User } from "lucide-react";

interface CitizenInfoProps {
  citizen: {
    name: string;
    phone?: string;
    email?: string;
  };
}

export function CitizenInfoPanel({ citizen }: CitizenInfoProps) {
  return (
    <div className="bg-card rounded-xl shadow-xs border border-border p-5">
      <h3 className="text-eyebrow text-muted-foreground mb-4">Citizen Contact</h3>
      
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
          {citizen.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-base font-black text-foreground truncate tracking-tight">{citizen.name}</p>
          
          <div className="flex flex-col gap-1 mt-1">
             {citizen.phone && (
               <a href={`tel:${citizen.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground font-medium hover:text-primary transition-colors">
                 <Phone className="w-3.5 h-3.5" /> {citizen.phone}
               </a>
             )}
             {citizen.email && (
               <a href={`mailto:${citizen.email}`} className="flex items-center gap-2 text-sm text-muted-foreground font-medium hover:text-primary transition-colors truncate">
                 <Mail className="w-3.5 h-3.5" /> {citizen.email}
               </a>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}