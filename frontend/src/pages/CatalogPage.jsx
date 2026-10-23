import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Sparkles, RefreshCw } from 'lucide-react';
import BookCard from '../components/BookCard';
import StatsCard from '../components/StatsCard';
import api from '../services/api';

export default function CatalogPage({ onSelectBook, onBorrowBook, stats, reloadTrigger }) {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [availability, setAvailability] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch genres
  useEffect(() => {
    api.getGenres()
      .then((res) => {
        if (res.success) setGenres(['All', ...res.data]);
      })
      .catch((err) => console.error('Failed to load genres:', err));
  }, [reloadTrigger]);

  // Fetch books with filters
  useEffect(() => {
    setLoading(true);
    const delayDebounce = setTimeout(() => {
      api.getBooks({
        search: search.trim() || undefined,
        genre: selectedGenre !== 'All' ? selectedGenre : undefined,
        availability: availability !== 'all' ? availability : undefined,
      })
        .then((res) => {
          if (res.success) setBooks(res.data);
        })
        .catch((err) => console.error('Failed to load books:', err))
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedGenre, availability, reloadTrigger]);

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-10 mb-8 overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <BookOpen className="w-80 h-80" />
        </div>
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart Library Catalog & Recommendation Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Discover Your Next Great Read
          </h1>
          <p className="mt-2 text-sm sm:text-base text-indigo-200 leading-relaxed max-w-xl">
            Browse our curated collection of books, borrow copies with one click, and explore personalized recommendations based on genre and reading habits.
          </p>

          {/* Quick Search Input */}
          <div className="mt-6 flex items-center bg-white rounded-2xl p-1.5 shadow-xl max-w-lg border border-white/20">
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, author, genre, or ISBN..."
              className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none py-1.5"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="px-2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Stats Overview */}
      <StatsCard stats={stats} />

      {/* Filters & Genre Tabs */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs mb-8 space-y-4">
        {/* Genre Badges Horizontal Scroll */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by Category</span>
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedGenre === g
                    ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-slate-600">Stock Availability:</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setAvailability('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  availability === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setAvailability('available')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  availability === 'available' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                In Stock Only
              </button>
              <button
                onClick={() => setAvailability('borrowed')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  availability === 'borrowed' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Fully Borrowed
              </button>
            </div>
          </div>

          <div className="text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{books.length}</strong> books
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-slate-500 font-medium">Loading library catalog...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No books found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or selecting a different genre filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedGenre('All');
              setAvailability('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onSelect={onSelectBook}
              onBorrow={onBorrowBook}
            />
          ))}
        </div>
      )}
    </div>
  );
}
