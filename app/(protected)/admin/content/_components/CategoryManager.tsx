"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useState } from "react";

export function CategoryManager() {
  const [categories, setCategories] = useState(["General", "News"]);
  const [newCat, setNewCat] = useState("");

  const add = () => {
     if(newCat && !categories.includes(newCat)) {
         setCategories([...categories, newCat]);
         setNewCat("");
     }
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-white">
       <h3 className="font-semibold text-sm">Categories</h3>
       <div className="flex flex-wrap gap-2">
          {categories.map(c => (
             <Badge key={c} variant="secondary" className="hover:bg-slate-200 cursor-default">
                {c} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setCategories(categories.filter(x => x !== c))} />
             </Badge>
          ))}
       </div>
       <div className="flex gap-2">
          <Input 
             value={newCat} 
             onChange={(e) => setNewCat(e.target.value)} 
             placeholder="New category..." 
             className="h-8 text-sm"
             onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <Button size="sm" variant="outline" onClick={add} className="h-8"><Plus className="h-4 w-4"/></Button>
       </div>
    </div>
  );
}