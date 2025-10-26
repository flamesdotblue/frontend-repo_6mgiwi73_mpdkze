import { ShieldCheck, Zap, FolderDown, Layers } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Fast by default",
    desc: "Instant in-browser conversion. No uploads, no waiting, no limits.",
  },
  {
    icon: ShieldCheck,
    title: "Private & secure",
    desc: "Images never leave your device. Everything happens locally.",
  },
  {
    icon: Layers,
    title: "All formats",
    desc: "PNG, JPG, JPEG, WEBP, GIF, BMP — they'll all become pixel-perfect PDFs.",
  },
  {
    icon: FolderDown,
    title: "Batch export",
    desc: "Drop multiple images and download a single merged PDF or one per image.",
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-slate-50/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-600/10 text-blue-700 grid place-items-center mb-3">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
