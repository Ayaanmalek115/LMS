import React from 'react';
import { Star, Bookmark, BookCheck, Sparkles, Layers } from 'lucide-react';

export default function BookCard({ book, onSelect, onBorrow, showRecommendation = false }) {
  const isAvailable = book.availableCopies > 0;

  // Genre badge color map
  const genreColorMap = {
    'Science Fiction': 'bg-purple-100 text-purple-700 border-purple-200',
    'Technology': 'bg-blue-100 text-blue-700 border-blue-200',
    'Mystery': 'bg-amber-100 text-amber-800 border-amber-200',
    'Fantasy': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Fiction': 'bg-rose-100 text-rose-700 border-rose-200',
    'History': 'bg-orange-100 text-orange-800 border-orange-200',
    'Biography': 'bg-teal-100 text-teal-800 border-teal-200',
  };

  const badgeClass = genreColorMap[book.genre] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Cover Image & Badges */}
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onSelect(book)}>
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
            }}
          />

          {/* Genre Pill */}
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-xs backdrop-blur-sm ${badgeClass}`}>
            {book.genre}
          </span>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center space-x-1 text-xs font-bold text-slate-800 shadow-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{book.rating ? book.rating.toFixed(1) : '4.5'}</span>
          </div>

          {/* Availability Strip */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-xs ${
                isAvailable
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-rose-500/90 text-white'
              }`}
            >
              {isAvailable ? `${book.availableCopies} in stock` : 'All borrowed'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Recommendation Reason Pill (if present) */}
          {book.recommendationReason && (
            <div className="mb-2.5 flex items-start space-x-1.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span className="font-medium line-clamp-1">{book.recommendationReason}</span>
            </div>
          )}

          <h3
            onClick={() => onSelect(book)}
            className="font-bold text-slate-900 text-base leading-snug line-clamp-1 hover:text-indigo-600 cursor-pointer transition-colors"
            title={book.title}
          >
            {book.title}
          </h3>
          <p className="text-slate-500 text-xs mt-1 font-medium">{book.author}</p>

          <p className="text-slate-600 text-xs mt-2 line-clamp-2 leading-relaxed">
            {book.description || 'No summary available.'}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0 flex items-center space-x-2">
        <button
          onClick={() => onSelect(book)}
          className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          Details
        </button>
        <button
          onClick={() => onBorrow(book)}
          disabled={!isAvailable}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 transition-all ${
            isAvailable
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-200'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <BookCheck className="w-3.5 h-3.5" />
          <span>{isAvailable ? 'Borrow' : 'Unavailable'}</span>
        </button>
      </div>
    </div>
  );
}
