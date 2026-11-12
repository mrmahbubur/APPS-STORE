import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Code, FileCode } from 'lucide-react';

interface ThemeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeExportModal: React.FC<ThemeExportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [xmlContent, setXmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/theme/xml')
      .then((res) => res.text())
      .then((text) => {
        setXmlContent(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load theme XML:', err);
        setLoading(false);
      });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mrs-appstore-theme.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-zinc-950 border border-white/[0.1] rounded-[2.5rem] p-6 sm:p-8 shadow-2xl my-auto text-zinc-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[22%] bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">App Store Theme Template (XML)</h2>
              <p className="text-xs text-zinc-400">
                Production-ready responsive XML template with automatic yearly renewal script and app grid.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-white/[0.08] shrink-0">
          <span className="text-xs text-zinc-400">
            {loading ? 'Preparing template...' : `${xmlContent.split('\n').length} lines · UTF-8 formatted`}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors border border-white/10"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied XML' : 'Copy XML'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-md shadow-blue-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .xml File</span>
            </button>
          </div>
        </div>

        {/* Blogger Installation Guide Alert */}
        <div className="my-3 p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/20 text-xs text-zinc-300">
          <div className="font-bold text-blue-400 mb-1 flex items-center gap-1.5">
            <span>💡 How to fix &quot;Theme is not supporting&quot; error in Blogger:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-zinc-300 text-[11px] leading-relaxed">
            <li>Open your Blogger dashboard and go to <strong className="text-white">Theme</strong>.</li>
            <li>Click the small downward arrow next to the orange <strong className="text-white">Customize</strong> button and select <strong className="text-white">Edit HTML</strong> (do not use &quot;Restore&quot;).</li>
            <li>Press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-white font-mono">Ctrl + A</kbd> (or <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-white font-mono">Cmd + A</kbd>) to select all existing code, then hit Delete.</li>
            <li>Click <strong className="text-blue-400">&quot;Copy XML&quot;</strong> above, paste it into the editor, and click the <strong className="text-white">Save icon</strong> (top right disk icon).</li>
          </ol>
        </div>

        {/* Code Preview Area */}
        <div className="flex-1 overflow-y-auto py-2">
          <pre className="p-4 rounded-2xl bg-black border border-white/[0.08] font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto selection:bg-blue-600 selection:text-white">
            {loading ? 'Loading XML template...' : xmlContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span>Ready to paste directly into your theme HTML editor.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
