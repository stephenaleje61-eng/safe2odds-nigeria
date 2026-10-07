import React, { useState } from 'react';
import { Newspaper, Clock, ArrowRight, User, X, Tag } from 'lucide-react';
import { NewsArticle } from '../types';

interface NewsSectionProps {
  articles: NewsArticle[];
}

export const NewsSection: React.FC<NewsSectionProps> = ({ articles }) => {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = ['ALL', ...Array.from(new Set(articles.map(a => a.category)))];

  const filteredArticles = activeCategory === 'ALL'
    ? articles
    : articles.filter(a => a.category === activeCategory);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-green-100 text-green-700 rounded-lg">
              <Newspaper className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#111827]">
              Football Insights & Match News
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            Tactical analysis, Nigerian football updates, expected goals (xG) statistics, and smart betting strategy.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-green-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredArticles.map(art => (
          <article
            key={art.id}
            className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
          >
            {/* Featured Image */}
            <div className="h-44 w-full overflow-hidden relative bg-gray-100">
              <img
                src={art.imageUrl}
                alt={art.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-gray-950/80 backdrop-blur-xs text-green-400 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider">
                {art.category}
              </span>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-2">
                  <span>{art.date}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {art.readTime}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-[#111827] leading-snug mb-2 group-hover:text-green-700 transition-colors">
                  {art.title}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-4">
                  {art.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 font-medium">
                  {art.author}
                </span>

                <button
                  onClick={() => setSelectedArticle(art)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-800 transition-colors"
                >
                  <span>Read More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header image */}
            <div className="h-56 w-full relative bg-gray-900">
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4">
                <span className="bg-green-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                  {selectedArticle.category}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span>{selectedArticle.date}</span>
                <span>·</span>
                <span>{selectedArticle.readTime}</span>
                <span>·</span>
                <span className="font-semibold text-gray-700">{selectedArticle.author}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight mb-4">
                {selectedArticle.title}
              </h2>

              <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-4 whitespace-pre-line border-t border-gray-100 pt-4">
                {selectedArticle.content}
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-gray-800 transition-colors"
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
