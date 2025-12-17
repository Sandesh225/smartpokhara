import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SEOSettingsProps {
    register: any; // React Hook Form register
}

export function SEOSettings({ register }: SEOSettingsProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
       <h3 className="font-semibold text-sm">SEO Configuration</h3>
       
       <div className="space-y-2">
          <Label>Meta Title</Label>
          <Input {...register("meta_title")} placeholder="Page Title | Smart City" />
          <p className="text-[10px] text-gray-400 text-right">Max 60 chars</p>
       </div>

       <div className="space-y-2">
          <Label>Meta Description</Label>
          <Textarea {...register("meta_description")} className="h-24" placeholder="Brief summary for search engines..." />
          <p className="text-[10px] text-gray-400 text-right">Max 160 chars</p>
       </div>
    </div>
  );
}