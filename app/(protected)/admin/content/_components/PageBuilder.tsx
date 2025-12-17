"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, GripVertical, Image as ImageIcon, Type, Layout } from "lucide-react";
import { useState } from "react";

export function PageBuilder() {
  const [blocks, setBlocks] = useState<string[]>(["hero", "text"]);

  const addBlock = (type: string) => {
    setBlocks([...blocks, type]);
  };

  return (
    <div className="space-y-4">
       <div className="space-y-2">
          {blocks.map((block, idx) => (
             <Card key={idx} className="group relative border-dashed hover:border-solid hover:border-blue-300 transition-all">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 cursor-move opacity-0 group-hover:opacity-100">
                   <GripVertical className="h-5 w-5" />
                </div>
                <CardContent className="p-4 pl-10 flex items-center gap-3">
                   {block === 'hero' && <Layout className="h-5 w-5 text-blue-500"/>}
                   {block === 'text' && <Type className="h-5 w-5 text-gray-500"/>}
                   {block === 'image' && <ImageIcon className="h-5 w-5 text-green-500"/>}
                   <span className="capitalize font-medium text-sm">{block} Section</span>
                </CardContent>
             </Card>
          ))}
       </div>

       <div className="flex gap-2 justify-center py-4 border-t border-dashed">
          <Button variant="outline" size="sm" onClick={() => addBlock('text')}>
             <Type className="mr-2 h-4 w-4"/> Text
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('image')}>
             <ImageIcon className="mr-2 h-4 w-4"/> Image
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('hero')}>
             <Layout className="mr-2 h-4 w-4"/> Hero
          </Button>
       </div>
    </div>
  );
}