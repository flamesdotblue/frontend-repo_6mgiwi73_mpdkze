import { Rocket, Image as ImageIcon, FileText, Github } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-blue-600 grid place-items-center text-white shadow-sm">
            <Rocket className="h-5 w-5" />
          </div>
          <span className="font-semibold text-slate-800 tracking-tight">Snap2PDF</span>
        </div>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-600">
          <a href="#features" className="hover:text-slate-900 transition-colors flex items-center gap-2"><ImageIcon className="h-4 w-4"/>Images</a>
          <a href="#convert" className="hover:text-slate-900 transition-colors flex items-center gap-2"><FileText className="h-4 w-4"/>PDF</a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <Github className="h-4 w-4" />
            Star
          </a>
          <a
            href="#convert"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Convert Now
          </a>
        </div>
      </div>
    </header>
  );
}
