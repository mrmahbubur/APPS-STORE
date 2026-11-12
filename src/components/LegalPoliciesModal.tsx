import React, { useState } from 'react';
import { X, ShieldCheck, Scale, RefreshCw, DollarSign, Mail } from 'lucide-react';
import { SiteMeta } from '../types';

interface LegalPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteMeta: SiteMeta | null;
  initialTab?: 'privacy' | 'terms' | 'developer' | 'dmca';
}

export const LegalPoliciesModal: React.FC<LegalPoliciesModalProps> = ({
  isOpen,
  onClose,
  siteMeta,
  initialTab = 'privacy',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'developer' | 'dmca'>(initialTab);

  const policies = siteMeta?.policies;
  const currentPolicy = policies ? policies[activeTab] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-zinc-950 border border-white/[0.1] rounded-[2.5rem] p-6 sm:p-10 shadow-2xl my-auto text-zinc-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[22%] bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Trust, Legal &amp; Developer Guidelines</h2>
              <div className="flex items-center gap-2 text-xs text-emerald-400 mt-0.5">
                <RefreshCw className="w-3 h-3 animate-spin duration-1000" />
                <span>Backend Auto-Renewed for Year {siteMeta?.currentYear || new Date().getFullYear()}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 py-4 border-b border-white/[0.08] shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('developer')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'developer'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Developer Publishing ($25)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
              activeTab === 'terms'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Terms of Service
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dmca')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
              activeTab === 'dmca'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            DMCA Compliance
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-5 space-y-5 flex-1 pr-2">
          {currentPolicy ? (
            <>
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.08]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-zinc-400 mb-1">
                  <span className="font-bold text-white text-base">{currentPolicy.title}</span>
                  <span className="text-emerald-400 font-mono text-[11px]">{currentPolicy.lastRenewed}</span>
                </div>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                  {currentPolicy.summary}
                </p>
                {activeTab === 'developer' && (
                  <div className="mt-3 p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 shrink-0 text-blue-400" />
                    <span>Official Review Contact: <strong>mr216873@gmail.com</strong></span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {currentPolicy.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-white/[0.02]">
                    <h3 className="text-sm font-bold text-white">
                      {sec.heading}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-zinc-400 text-xs">
              Loading policy framework from backend...
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span>{siteMeta?.copyrightNotice || `© ${new Date().getFullYear()} MRS TV Network. All rights reserved.`}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
