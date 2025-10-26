import { Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white pointer-events-none" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-8 text-center relative">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          No signup. 100% private. Runs in your browser.
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
          Convert any image into a beautiful PDF
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-slate-600 text-base sm:text-lg">
          Drag & drop PNG, JPG, WEBP, GIF and more. Reorder, set page size, and download a crisp PDF in seconds.
        </p>
        <div className="mt-8">
          <a href="#convert" className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            Get started
          </a>
        </div>
      </div>
    </section>
  );
}
