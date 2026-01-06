import { useFormContext } from "react-hook-form";
import { MapPin, FileText, CheckCircle2, Edit2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function ReviewStep({ categories, wards, jumpToStep }: any) {
  const { getValues } = useFormContext();
  const values = getValues();

  const categoryName = categories.find((c: any) => c.id === values.category_id)?.name;
  const wardNumber = wards.find((w: any) => w.id === values.ward_id)?.ward_number;

  return (
    <div className="space-y-6">
      <Alert className="bg-emerald-50 border-emerald-200">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        <AlertTitle>Review your report</AlertTitle>
        <AlertDescription>Check everything before submitting to the city office.</AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Card */}
        <div className="p-4 rounded-xl border bg-white relative">
          <button onClick={() => jumpToStep(1)} className="absolute top-2 right-2 p-1 text-slate-400"><Edit2 size={14}/></button>
          <p className="text-xs font-bold uppercase text-slate-400">Issue</p>
          <p className="font-bold">{categoryName}</p>
          <p className="text-sm text-slate-600">{values.title}</p>
        </div>

        {/* Location Card */}
        <div className="p-4 rounded-xl border bg-white relative">
          <button onClick={() => jumpToStep(2)} className="absolute top-2 right-2 p-1 text-slate-400"><Edit2 size={14}/></button>
          <p className="text-xs font-bold uppercase text-slate-400">Location</p>
          <p className="font-bold">Ward {wardNumber}</p>
          <p className="text-sm text-slate-600 truncate">{values.address_text}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl border bg-slate-50">
        <p className="text-xs font-bold uppercase text-slate-400 mb-2">Detailed Description</p>
        <p className="text-sm whitespace-pre-wrap">{values.description}</p>
      </div>
    </div>
  );
}