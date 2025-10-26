import { Trash2, MoveUp, MoveDown } from "lucide-react";

export default function PreviewGrid({ items, onRemove, onMoveUp, onMoveDown }) {
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((img, idx) => (
        <div key={img.id} className="group relative rounded-xl overflow-hidden border bg-white">
          <img
            src={img.preview}
            alt={img.file.name}
            className="w-full h-40 object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onRemove(idx)}
              className="p-2 rounded-lg bg-white/90 shadow hover:bg-white"
              title="Remove"
            >
              <Trash2 size={16} className="text-red-600" />
            </button>
            <button
              onClick={() => onMoveUp(idx)}
              className="p-2 rounded-lg bg-white/90 shadow hover:bg-white"
              title="Move up"
              disabled={idx === 0}
            >
              <MoveUp size={16} />
            </button>
            <button
              onClick={() => onMoveDown(idx)}
              className="p-2 rounded-lg bg-white/90 shadow hover:bg-white"
              title="Move down"
              disabled={idx === items.length - 1}
            >
              <MoveDown size={16} />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 text-xs font-medium px-2 py-1 rounded bg-white/90 shadow">
            Page {idx + 1}
          </div>
        </div>
      ))}
    </div>
  );
}
