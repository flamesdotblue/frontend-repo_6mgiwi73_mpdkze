import { FileDown, Trash2, Loader2 } from "lucide-react";

export default function ActionBar({ disabled, onClear, onConvert, converting }) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <button
        onClick={onConvert}
        disabled={disabled || converting}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {converting ? <Loader2 className="animate-spin" size={16} /> : <FileDown size={16} />} 
        {converting ? "Converting..." : "Convert to PDF"}
      </button>
      <button
        onClick={onClear}
        disabled={disabled || converting}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 size={16} /> Clear all
      </button>
    </div>
  );
}
