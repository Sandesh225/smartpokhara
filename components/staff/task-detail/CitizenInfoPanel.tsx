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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Citizen Contact</h3>
      
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
          {citizen.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-900 truncate">{citizen.name}</p>
          
          <div className="flex flex-col gap-1 mt-1">
             {citizen.phone && (
               <a href={`tel:${citizen.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                 <Phone className="w-3.5 h-3.5" /> {citizen.phone}
               </a>
             )}
             {citizen.email && (
               <a href={`mailto:${citizen.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 truncate">
                 <Mail className="w-3.5 h-3.5" /> {citizen.email}
               </a>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}