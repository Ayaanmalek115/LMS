import React, { useState, useEffect } from 'react';
import { Sparkles, User, Info, ArrowRight, BookOpen, Layers } from 'lucide-react';
import BookCard from '../components/BookCard';
import api from '../services/api';

export default function ForYouPage({ activeUser, onSelectBook, onBorrowBook, reloadTrigger }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPersonalization, setHasPersonalization] = useState(false);
  const [topGenres, setTopGenres] = useState([]);

  useEffect(() => {
    setLoading(true);
    const userId = activeUser ? activeUser._id : 'guest';

    api.getPersonalizedRecommendations(userId, 12)
      .then((res) => {
        if (res.success) {
          setRecommendations(res.data);
          setHasPersonalization(res.hasPersonalization);
          setTopGenres(res.topGenres || []);
        }
      })
      .catch((err) => console.error('Failed to load recommendations:', err))
      .finally(() => setLoading(false));
  }, [activeUser, reloadTrigger]);

  return (
    <div>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-md relative overflow-hidden">
        <div className="absolute right-4 -bottom-6 opacity-15 pointer-events-none">
          <Sparkles className="w-64 h-64" />
        </div>

        <div className="relative max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-3">
            <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
            <span>Smart Genre & Category Recommender</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight">
            {activeUser ? `Recommended For ${activeUser.name}` : 'Curated Book Recommendations'}
          </h1>

          <p className="mt-2 text-sm text-white/90 leading-relaxed">
            {hasPersonalization ? (
              <>
                Based on your reading history and interest in{' '}
                <strong className="underline decoration-white/40">
                  {topGenres.join(', ') || activeUser?.favoriteGenres?.join(', ')}
                </strong>
                , our rule-based engine picked these titles for you.
              </>
            ) : (
              'Explore top-rated and trending titles across our most popular categories. Log in or select a member from the top bar to get personalized picks based on borrowed books!'
            )}
          </p>

          {/* User profile tags */}
          {activeUser && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-white/80">Active Member:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-800 font-bold">
                {activeUser.name}
              </span>
              {activeUser.favoriteGenres?.map((g) => (
                <span key={g} className="px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white font-medium">
                  ★ {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How it works info strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8 flex items-start space-x-3 text-xs text-slate-600">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900">How the Recommendation Algorithm Works:</span>{' '}
          Our engine scans books you've previously borrowed or favorited, scores unborrowed books by matching genre (+4) and author (+5), weights critically acclaimed ratings (+1.5x), and factors in current library popularity—no complex external models or black boxes required.
        </div>
      </div>

      {/* Recommendations Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-slate-500 font-medium">Crunching recommendations for you...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No recommendations found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Browse the catalog and borrow books to start training your reading preferences!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recommendations.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onSelect={onSelectBook}
              onBorrow={onBorrowBook}
              showRecommendation={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
