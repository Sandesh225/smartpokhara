// ==================== CATEGORY MAPPING COMPONENT ====================
// app/admin/departments/_components/CategoryMapping.tsx

import { Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export default function CategoryMapping({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <div className="glass rounded-2xl p-6 border border-border elevation-1 h-full flex flex-col">
      <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-secondary" />
        Mapped Categories
      </h4>

      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        Complaints filed under these categories are automatically routed to this
        department.
      </p>

      {categories.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-muted/30">
          <p className="text-sm text-muted-foreground italic text-center">
            No categories mapped yet
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-secondary/10 border-2 border-secondary/20 text-sm font-semibold text-secondary-foreground transition-all hover:border-secondary hover:shadow-md hover:-translate-y-0.5"
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
