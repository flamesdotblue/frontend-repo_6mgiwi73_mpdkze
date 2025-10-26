import { useCallback, useRef, useState } from "react";
import { ImagePlus, Upload } from "lucide-react";

export default function UploadArea({ onFilesAdded }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files || []).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length) onFilesAdded(files);
    },
    [onFilesAdded]
  );

  const onSelect = (e) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length) onFilesAdded(files);
    // reset input so selecting the same file again triggers change
    e.target.value = "";
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`relative w-full rounded-2xl border-2 border-dashed ${
        isDragging ? "border-indigo-500 bg-indigo-50/50" : "border-gray-300"
      } p-8 text-center transition-colors`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onSelect}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="p-4 rounded-full bg-indigo-600/10 text-indigo-700">
          <ImagePlus />
        </div>
        <div>
          <p className="text-lg font-medium">Drag & drop images here</p>
          <p className="text-sm text-gray-500">PNG, JPG, JPEG, GIF, WEBP, SVG</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Upload size={16} /> Select images
          </button>
        </div>
      </div>
    </div>
  );
}
