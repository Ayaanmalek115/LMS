import React, { useEffect, useState } from 'react';
import { X, Star, Calendar, Hash, BookOpen, Layers, Sparkles, BookCheck } from 'lucide-react';
import api from '../services/api';

export default function BookDetailsModal({ book, onClose, onBorrow, onSelectSimilar }) {
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    if (book?._id) {
      setLoadingSimilar(true);
      api.getSimilarBooks(book._id)
        .then((res) => {
          if (res.success) setSimilarBooks(res.data);
        })
        .catch((err) => console.error('Failed to load similar books:', err))
        .finally(() => setLoadingSimilar(false));
    }
  }, [book?._id]);

  if (!book) return null;

  const isAvailable = book.availableCopies > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Book Cover */}
            <div className="w-full sm:w-48 shrink-0">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 shadow-md">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
                  }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {book.genre}
                </span>
                <div className="flex items-center space-x-1 text-xs font-bold text-slate-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{book.rating ? book.rating.toFixed(1) : '4.5'}</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mt-2 leading-tight">
                {book.title}
              </h2>
              <p className="text-sm font-medium text-slate-600 mt-1">by {book.author}</p>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-slate-400" />
                  <span>ISBN: <strong className="text-slate-800">{book.isbn}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Year: <strong className="text-slate-800">{book.publishYear || 'N/A'}</strong></span>
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>
                    Availability:{' '}
                    <strong className={isAvailable ? 'text-emerald-600' : 'text-rose-600'}>
                      {book.availableCopies} available
                    </strong>{' '}
                    of {book.totalCopies} copies
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Overview</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-h-32 overflow-y-auto pr-1">
                  {book.description || 'No detailed synopsis available.'}
                </p>
              </div>

              <div className="mt-5">
                <button
                  onClick={() => {
                    onClose();
                    onBorrow(book);
                  }}
                  disabled={!isAvailable}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition-all ${
                    isAvailable
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <BookCheck className="w-4 h-4" />
                  <span>{isAvailable ? 'Borrow This Book' : 'Currently Unavailable (All Copies Borrowed)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Similar Books (Recommendation Feature) */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  More Books in {book.genre}
                </h3>
              </div>
              <span className="text-xs text-slate-400">Category Match</span>
            </div>

            {loadingSimilar ? (
              <div className="py-4 text-center text-xs text-slate-400">Finding similar titles...</div>
            ) : similarBooks.length === 0 ? (
              <div className="py-2 text-xs text-slate-400">No other books in this genre yet.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {similarBooks.map((sim) => (
                  <div
                    key={sim._id}
                    onClick={() => onSelectSimilar(sim)}
                    className="group cursor-pointer bg-slate-50 hover:bg-indigo-50/60 p-2 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all text-left"
                  >
                    <div className="aspect-[4/5] rounded-lg overflow-hidden bg-slate-200 mb-1.5">
                      <img
                        src={sim.coverImage}
                        alt={sim.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-[11px] font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600">
                      {sim.title}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{sim.author}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
