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
    <div className="stone-panel p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-foreground flex items-center gap-2">
          <Tag className="w-4 h-4 text-accent" /> Mapped Categories
        </h4>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Complaints filed under these categories are automatically routed to this
        department.
      </p>

      {categories.length === 0 ? (
        <div className="text-sm text-muted-foreground italic p-4 bg-neutral-stone-50 rounded-md border border-dashed border-neutral-stone-200">
          No categories mapped yet.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-neutral-stone-100 border border-neutral-stone-200 text-sm font-medium text-neutral-stone-700 transition-all hover:border-accent hover:text-accent"
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
