import React from 'react';
import { ExternalLink, Tag } from 'lucide-react';
import { AppSettings } from '../types';

interface AdBannerProps {
  location: 'top' | 'in-feed' | 'sidebar' | 'article' | 'bottom';
  settings: AppSettings;
}

export const AdBanner: React.FC<AdBannerProps> = ({ location, settings }) => {
  const { affiliateLink, affiliateBannerText, affiliateTitle, adSenseSlotHtml } = settings;

  if (location === 'top') {
    return (
      <div className="bg-gradient-to-r from-emerald-950 via-gray-900 to-emerald-950 border-b border-emerald-800/40 py-2.5 px-4 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-700/50 px-1.5 py-0.5 rounded">
              Sponsored
            </span>
            <span className="text-gray-200 font-medium truncate max-w-xl">
              {affiliateBannerText}
            </span>
          </div>
          <a
            href={affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg transition-colors shrink-0 text-xs shadow-sm"
          >
            Claim Offer <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  if (location === 'in-feed') {
    return (
      <div className="my-6 rounded-2xl border border-dashed border-gray-300 bg-gradient-to-br from-green-50 to-gray-50 p-4 sm:p-5 text-center relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] tracking-wider uppercase font-semibold text-gray-500 flex items-center gap-1">
            <Tag className="w-3 h-3 text-green-600" /> Partner Advertisement
          </span>
          <span className="text-[10px] text-gray-400">Promoted</span>
        </div>
        <div className="max-w-xl mx-auto py-2">
          <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
            {affiliateTitle}
          </h4>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            {affiliateBannerText}
          </p>
          <a
            href={affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition-transform active:scale-95"
          >
            Visit Partner Sportsbook <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <p className="text-[10px] text-gray-600 mt-2">
          18+ T&Cs Apply. Safe2Odds may earn an affiliate commission from partner registrations.
        </p>
      </div>
    );
  }

  if (location === 'sidebar') {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
          <span className="text-[10px] uppercase font-semibold text-gray-600">Promoted Partner</span>
          <span className="text-[10px] text-gray-600">Ad</span>
        </div>
        <div className="rounded-xl bg-gray-900 text-white p-4 text-center">
          <span className="text-[11px] font-bold text-green-400 uppercase tracking-wider block mb-1">
            {affiliateTitle}
          </span>
          <p className="text-xs text-gray-300 mb-4 leading-relaxed">
            {affiliateBannerText}
          </p>
          <a
            href={affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            Register Now <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  // Bottom or Article banner
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-center my-6">
      <div className="flex items-center justify-center gap-1 text-[10px] text-gray-600 uppercase font-semibold mb-2">
        <span>Advertisement</span>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-xs text-gray-700 font-medium mb-2">{affiliateBannerText}</p>
        <a
          href={affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-green-700 hover:text-green-800 font-bold underline"
        >
          Check Partner Details <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
