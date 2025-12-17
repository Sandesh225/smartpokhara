"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Link as LinkIcon, Bold, Italic, List } from "lucide-react";

interface PageEditorProps {
  content: string;
  onChange: (value: string) => void;
}

export function PageEditor({ content, onChange }: PageEditorProps) {
  // In a real implementation, this would be Tiptap or Quill.
  // For now, we provide a functional text area with a mock toolbar.
  
  return (
    <div className="border rounded-md">
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
        <Button variant="ghost" size="sm" type="button"><Bold className="h-4 w-4"/></Button>
        <Button variant="ghost" size="sm" type="button"><Italic className="h-4 w-4"/></Button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <Button variant="ghost" size="sm" type="button"><List className="h-4 w-4"/></Button>
        <Button variant="ghost" size="sm" type="button"><LinkIcon className="h-4 w-4"/></Button>
        <Button variant="ghost" size="sm" type="button"><ImageIcon className="h-4 w-4"/></Button>
      </div>
      <Textarea 
        value={content} 
        onChange={(e) => onChange(e.target.value)} 
        className="min-h-[400px] border-0 rounded-none focus-visible:ring-0 resize-y p-4 font-mono text-sm"
        placeholder="Write your page content here (HTML supported)..."
      />
      <div className="p-2 border-t bg-gray-50 text-xs text-gray-500 text-right">
         {content.length} characters
      </div>
    </div>
  );
}