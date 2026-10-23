import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, Search, BookOpen, Layers, Star } from 'lucide-react';
import api from '../services/api';

export default function ManageBooksPage({ onAddBook, onEditBook, reloadTrigger }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchBooks = () => {
    setLoading(true);
    api.getBooks({ limit: 100 })
      .then((res) => {
        if (res.success) setBooks(res.data);
      })
      .catch((err) => console.error('Failed to load books:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooks();
  }, [reloadTrigger]);

  const handleDelete = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}" from the library?`)) {
      return;
    }

    setDeletingId(book._id);
    try {
      const res = await api.deleteBook(book._id);
      if (res.success) {
        setBooks((prev) => prev.filter((b) => b._id !== book._id));
      }
    } catch (err) {
      alert(`Could not delete book: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBooks = books.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            <span>Manage Library Inventory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add new titles, edit existing metadata, update stock levels, and remove books.
          </p>
        </div>

        <button
          onClick={onAddBook}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs mb-6 flex items-center space-x-2">
        <Search className="w-4 h-4 text-slate-400 pl-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, author, genre, or ISBN..."
          className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600 px-2">
            Clear
          </button>
        )}
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-slate-500 font-medium">Loading inventory...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No books found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Click &quot;Add New Book&quot; above to add your first title.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Book</th>
                  <th className="py-3.5 px-4">Genre</th>
                  <th className="py-3.5 px-4">ISBN</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Inventory (Avail/Total)</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBooks.map((book) => {
                  return (
                    <tr key={book._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Book */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={book.coverImage}
                            alt=""
                            className="w-10 h-14 object-cover rounded-md bg-slate-100 shrink-0 shadow-xs"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{book.title}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">by {book.author}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Year: {book.publishYear}</div>
                          </div>
                        </div>
                      </td>

                      {/* Genre */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {book.genre}
                        </span>
                      </td>

                      {/* ISBN */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {book.isbn}
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1 font-bold text-slate-800">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{book.rating ? book.rating.toFixed(1) : '4.5'}</span>
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block font-semibold px-2 py-0.5 rounded-lg ${
                            book.availableCopies > 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {book.availableCopies} / {book.totalCopies} Available
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => onEditBook(book)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Book"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(book)}
                            disabled={deletingId === book._id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                            title="Delete Book"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
