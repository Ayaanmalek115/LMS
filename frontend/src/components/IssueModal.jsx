import React, { useState } from 'react';
import { X, BookCheck, Calendar, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function IssueModal({ book, users, activeUser, onClose, onSuccess }) {
  const [selectedUserId, setSelectedUserId] = useState(
    activeUser ? activeUser._id : users[0]?._id || ''
  );
  const [loanDays, setLoanDays] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!book) return null;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Number(loanDays));

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedUserId) {
      setError('Please select a library member to issue this book to');
      return;
    }

    setLoading(true);
    try {
      const res = await api.borrowBook({
        bookId: book._id,
        userId: selectedUserId,
        days: loanDays,
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Book issued successfully!');
        setTimeout(() => {
          onSuccess(res.data);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookCheck className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Issue Book</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Book Summary Card */}
          <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-12 h-16 object-cover rounded-lg shadow-xs shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{book.genre}</div>
              <h4 className="text-sm font-bold text-slate-900 truncate">{book.title}</h4>
              <p className="text-xs text-slate-500 truncate">{book.author}</p>
              <div className="text-[11px] font-medium text-emerald-600 mt-0.5">
                {book.availableCopies} copy remaining in stock
              </div>
            </div>
          </div>

          {/* Member Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Borrowing Member</span>
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            >
              <option value="" disabled>Select member...</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Loan Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Loan Duration</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[7, 14, 21, 30].map((days) => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setLoanDays(days)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    loanDays === days
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Expected Due Date Notice */}
          <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Expected Return Due Date:</span>
            <span className="font-bold text-indigo-700">{dueDate.toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Boolean(successMsg)}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center space-x-1.5 shadow-sm shadow-indigo-200 transition-all disabled:opacity-50"
            >
              <BookCheck className="w-3.5 h-3.5" />
              <span>{loading ? 'Issuing...' : 'Confirm Borrow'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
