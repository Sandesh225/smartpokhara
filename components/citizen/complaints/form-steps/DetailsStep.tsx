import { useFormContext, Controller } from "react-hook-form";
import { Upload, X, ImageIcon, AlertCircle, ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface DetailsStepProps {
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
  previews: string[];
  setPreviews: React.Dispatch<React.SetStateAction<string[]>>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function DetailsStep({ 
  attachments, 
  setAttachments, 
  previews, 
  setPreviews 
}: DetailsStepProps) {
  const { control, formState: { errors } } = useFormContext();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    newFiles.forEach((file) => {
      // Validate Size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large: ${file.name}`, { description: "Max 5MB allowed per file." });
        return;
      }
      // Validate Type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`Invalid format: ${file.name}`, { description: "Only JPG, PNG, and WEBP are supported." });
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setAttachments((prev) => [...prev, ...validFiles]);
      setPreviews((prev) => [...prev, ...validPreviews]);
      toast.success(`Added ${validFiles.length} photo(s)`);
    }

    // Reset input to allow re-selecting the same file if needed
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]); // Cleanup memory
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Description Field */}
      <div className="space-y-3">
        <Label className="text-lg font-bold text-slate-800">
          Describe the issue in detail <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea 
              {...field}
              placeholder="Please provide as much detail as possible. When did you first notice it? How severe is it? Has it affected anyone?"
              className="min-h-[180px] text-base bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all rounded-xl p-4 resize-y"
            />
          )}
        />
        {errors.description && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm font-medium flex items-center gap-1.5"
          >
            <AlertCircle className="h-4 w-4" /> {errors.description.message as string}
          </motion.p>
        )}
      </div>

      {/* File Upload Section */}
      <div className="space-y-4">
        <Label className="font-bold flex items-center gap-2 text-slate-800">
          <ImageIcon className="h-5 w-5 text-blue-600" /> 
          Add Photos / Evidence
        </Label>
        
        <div className="group relative border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-400 transition-all cursor-pointer text-center">
          <input 
            type="file" 
            multiple 
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          />
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <div className="h-14 w-14 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-200 group-hover:scale-110 transition-transform">
              <Upload className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-slate-700 text-lg">Click or drag photos here</p>
              <p className="text-sm text-slate-500 mt-1">Supports JPG, PNG (Max 5MB)</p>
            </div>
          </div>
        </div>

        {/* Image Previews */}
        <AnimatePresence>
          {previews.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pt-2"
            >
              {previews.map((src, i) => (
                <motion.div 
                  key={src} 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm group bg-white"
                >
                  <img src={src} className="w-full h-full object-cover" alt={`Preview ${i}`} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => removeFile(i)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                     <p className="text-[10px] text-white truncate">{attachments[i]?.name}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Anonymous Checkbox */}
      <div className="flex items-start gap-3 p-5 bg-blue-50/50 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors">
        <Controller
          name="is_anonymous"
          control={control}
          render={({ field }) => (
            <Checkbox 
              id="anon" 
              checked={field.value} 
              onCheckedChange={field.onChange} 
              className="mt-1 h-5 w-5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          )}
        />
        <label htmlFor="anon" className="text-sm cursor-pointer select-none">
          <span className="font-bold text-slate-900 flex items-center gap-1.5 text-base">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            Submit Anonymously
          </span>
          <span className="block text-slate-600 mt-1 leading-relaxed">
            If selected, your name and contact details will be hidden from public view. Only authorized officers can access your information for processing purposes.
          </span>
        </label>
      </div>
    </div>
  );
}