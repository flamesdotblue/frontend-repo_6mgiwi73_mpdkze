import { useMemo, useState } from "react";
import Header from "./components/Header";
import UploadArea from "./components/UploadArea";
import PreviewGrid from "./components/PreviewGrid";
import SettingsPanel, { PAGE_SIZES } from "./components/SettingsPanel";
import ActionBar from "./components/ActionBar";
import { jsPDF } from "jspdf";

function readFileAsImageSrc(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function imageToJpegDataUrl(src, maxW, maxH) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(img.width * scale));
      canvas.height = Math.max(1, Math.floor(img.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = reject;
    img.src = src;
  });
}

export default function App() {
  const [items, setItems] = useState([]);
  const [converting, setConverting] = useState(false);
  const [settings, setSettings] = useState({ pageSize: "A4", orientation: "portrait", margin: 10 });

  const hasItems = items.length > 0;

  const resolvedPage = useMemo(() => {
    const base = PAGE_SIZES[settings.pageSize] || PAGE_SIZES.A4;
    return settings.orientation === "landscape"
      ? { w: base.h, h: base.w }
      : base;
  }, [settings]);

  const handleFilesAdded = async (files) => {
    const mapped = await Promise.all(
      files.map(async (file) => {
        const src = await readFileAsImageSrc(file);
        return {
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          preview: src,
        };
      })
    );
    setItems((prev) => [...prev, ...mapped]);
  };

  const removeAt = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const moveUp = (idx) =>
    setItems((prev) => {
      if (idx <= 0) return prev;
      const arr = [...prev];
      const [it] = arr.splice(idx, 1);
      arr.splice(idx - 1, 0, it);
      return arr;
    });
  const moveDown = (idx) =>
    setItems((prev) => {
      if (idx >= prev.length - 1) return prev;
      const arr = [...prev];
      const [it] = arr.splice(idx, 1);
      arr.splice(idx + 1, 0, it);
      return arr;
    });

  const clearAll = () => setItems([]);

  const convertToPdf = async () => {
    if (!items.length) return;
    setConverting(true);
    try {
      const unit = "mm";
      const orientation = settings.orientation === "landscape" ? "l" : "p";
      const doc = new jsPDF({ unit, format: [resolvedPage.w, resolvedPage.h], orientation });

      const margin = Math.max(0, settings.margin);
      const usableW = resolvedPage.w - margin * 2;
      const usableH = resolvedPage.h - margin * 2;

      for (let i = 0; i < items.length; i++) {
        const src = await imageToJpegDataUrl(items[i].preview, 4000, 4000);
        const img = new Image();
        const dims = await new Promise((res, rej) => {
          img.onload = () => res({ w: img.width, h: img.height });
          img.onerror = rej;
          img.src = src;
        });
        const scale = Math.min(usableW / (dims.w || 1), usableH / (dims.h || 1));
        const w = (dims.w || usableW) * scale;
        const h = (dims.h || usableH) * scale;
        const x = margin + (usableW - w) / 2;
        const y = margin + (usableH - h) / 2;
        if (i > 0) doc.addPage([resolvedPage.w, resolvedPage.h], orientation);
        doc.addImage(src, "JPEG", x, y, w, h);
      }

      const filename = `images-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error(e);
      alert("Failed to create PDF. Please try different images.");
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <Header />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Convert any image to a beautiful PDF</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload multiple images, arrange pages, choose size and orientation, then download your PDF — fast and private, processed right in your browser.
          </p>
        </section>

        <UploadArea onFilesAdded={handleFilesAdded} />

        <div className="space-y-6">
          <PreviewGrid items={items} onRemove={removeAt} onMoveUp={moveUp} onMoveDown={moveDown} />

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div className="p-4 rounded-xl border bg-white">
                <h3 className="font-medium mb-3">Settings</h3>
                <SettingsPanel settings={settings} onChange={setSettings} />
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="sticky top-24 p-4 rounded-xl border bg-white space-y-4">
                <h3 className="font-medium">Actions</h3>
                <ActionBar
                  disabled={!hasItems}
                  onClear={clearAll}
                  onConvert={convertToPdf}
                  converting={converting}
                />
                <p className="text-xs text-gray-500">
                  Conversion happens locally in your browser. Your files never leave your device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Snap2PDF • Simple image to PDF converter
      </footer>
    </div>
  );
}
