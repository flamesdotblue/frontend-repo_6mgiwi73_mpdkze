import { useCallback, useMemo, useRef, useState } from "react";
import { Upload, X, FileText, GripVertical } from "lucide-react";
import { PDFDocument, StandardFonts } from "pdf-lib";

const pageSizes = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612, height: 792 },
  Square: { width: 612, height: 612 },
};

function bytesFromDataURL(dataURL) {
  const base64 = dataURL.split(",")[1];
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function fileToImageBytes(file) {
  // For JPEG/PNG we can pass bytes directly; for others we convert via canvas to PNG
  const type = file.type.toLowerCase();
  if (type.includes("jpeg") || type.includes("jpg") || type.includes("png")) {
    const arrayBuffer = await file.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }
  // Decode to canvas and export PNG
  const img = document.createElement("img");
  const url = URL.createObjectURL(file);
  try {
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const dataURL = canvas.toDataURL("image/png", 1.0);
    return bytesFromDataURL(dataURL);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function useSortable(list, setList) {
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const onDragStart = (index) => (e) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragEnter = (index) => () => {
    dragOverItem.current = index;
  };

  const onDragEnd = () => {
    const from = dragItem.current;
    const to = dragOverItem.current;
    if (from == null || to == null || from === to) return;
    const arr = [...list];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    setList(arr);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return { onDragStart, onDragEnter, onDragEnd };
}

export default function Uploader() {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [pageSize, setPageSize] = useState("A4");
  const [margin, setMargin] = useState(24);
  const [onePerImage, setOnePerImage] = useState(false);

  const totalSizeMB = useMemo(
    () => (files.reduce((s, f) => s + (f.file?.size || 0), 0) / (1024 * 1024)).toFixed(2),
    [files]
  );

  const { onDragStart, onDragEnter, onDragEnd } = useSortable(files, setFiles);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
    if (!dropped.length) return;
    const items = dropped.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
      type: f.type,
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const onPick = useCallback((e) => {
    const picked = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    if (!picked.length) return;
    const items = picked.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
      type: f.type,
    }));
    setFiles((prev) => [...prev, ...items]);
    e.target.value = "";
  }, []);

  const removeItem = (id) => {
    setFiles((prev) => {
      const next = prev.filter((x) => x.id !== id);
      const removed = prev.find((x) => x.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  };

  const clearAll = () => {
    setFiles((prev) => {
      prev.forEach((x) => URL.revokeObjectURL(x.url));
      return [];
    });
  };

  const convert = async () => {
    if (!files.length) return;
    setIsMerging(true);
    try {
      const doOne = async (images, filename = "images.pdf") => {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        for (const item of images) {
          const imgBytes = await fileToImageBytes(item.file);
          let image;
          // Try embed as PNG first, fallback to JPG
          try {
            image = await pdfDoc.embedPng(imgBytes);
          } catch {
            image = await pdfDoc.embedJpg(imgBytes);
          }
          const page = pdfDoc.addPage([pageSizes[pageSize].width, pageSizes[pageSize].height]);
          const { width, height } = page.getSize();
          const maxW = width - margin * 2;
          const maxH = height - margin * 2;
          const scale = Math.min(maxW / image.width, maxH / image.height);
          const drawW = image.width * scale;
          const drawH = image.height * scale;
          const x = (width - drawW) / 2;
          const y = (height - drawH) / 2;
          page.drawImage(image, { x, y, width: drawW, height: drawH });
          page.drawText(item.name, {
            x: margin,
            y: margin / 2,
            size: 8,
            font,
            color: undefined,
          });
        }
        const bytes = await pdfDoc.save();
        const blob = new Blob([bytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      };

      if (onePerImage) {
        for (const item of files) {
          await doOne([item], `${item.name.replace(/\.[^/.]+$/, "")}.pdf`);
        }
      } else {
        await doOne(files, "images.pdf");
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong while creating the PDF. Please try again.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <section id="convert" className="py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 hover:bg-slate-50 transition-colors p-6 sm:p-10 text-center"
        >
          <div className="mx-auto h-14 w-14 rounded-xl bg-blue-600/10 text-blue-700 grid place-items-center mb-3">
            <Upload className="h-7 w-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Drop your images here</h2>
          <p className="mt-1 text-slate-600 text-sm">PNG, JPG, JPEG, WEBP, GIF, BMP — up to 50 images</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50">
              Browse files
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onPick}
              />
            </label>
            {files.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-8 grid lg:grid-cols-[1fr,320px] gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900">Selected images</h3>
                <span className="text-xs text-slate-500">{files.length} items • {totalSizeMB} MB</span>
              </div>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {files.map((item, idx) => (
                  <li
                    key={item.id}
                    className="group relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50"
                    draggable
                    onDragStart={onDragStart(idx)}
                    onDragEnter={onDragEnter(idx)}
                    onDragEnd={onDragEnd}
                    title="Drag to reorder"
                  >
                    <img src={item.url} alt={item.name} className="w-full h-32 object-cover" />
                    <div className="absolute top-1 left-1 inline-flex items-center gap-1 bg-white/90 text-slate-700 rounded px-1.5 py-0.5 text-[10px] shadow-sm border border-slate-200"><GripVertical className="h-3 w-3"/>Drag</div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-1.5 right-1.5 rounded-full bg-white/90 p-1 text-slate-700 shadow-sm hover:bg-white border border-slate-200"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="p-2 text-xs text-slate-600 truncate" title={item.name}>{item.name}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm h-fit">
              <h3 className="font-semibold text-slate-900 mb-3">Options</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-600 mb-1">Page size</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    className="w-full rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  >
                    {Object.keys(pageSizes).map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Margins (px)</label>
                  <input
                    type="number"
                    min={0}
                    max={72}
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input id="onePer" type="checkbox" checked={onePerImage} onChange={(e) => setOnePerImage(e.target.checked)} />
                  <label htmlFor="onePer" className="text-slate-700">Export one PDF per image</label>
                </div>
              </div>
              <button
                onClick={convert}
                disabled={isMerging}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
              >
                <FileText className="h-4 w-4" />
                {isMerging ? "Converting..." : onePerImage ? "Download PDFs" : "Download PDF"}
              </button>
              <p className="mt-2 text-[11px] text-slate-500">Conversion happens locally in your browser using open-source PDF engine.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
