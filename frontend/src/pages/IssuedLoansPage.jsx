import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Search,
  BookOpen,
  Lock,
  User,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import api from '../services/api';

export default function IssuedLoansPage({ activeUser, onReturnSuccess, reloadTrigger }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [scope, setScope] = useState(activeUser ? 'my' : 'all');
  const [search, setSearch] = useState('');
  const [returningId, setReturningId] = useState(null);

  // Update default scope if user switches
  useEffect(() => {
    if (activeUser) {
      setScope('my');
    } else {
      setScope('all');
    }
  }, [activeUser?._id]);

  const fetchIssues = () => {
    setLoading(true);
    const params = {};
    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    if (scope === 'my' && activeUser) {
      params.userId = activeUser._id;
    }

    api.getIssues(params)
      .then((res) => {
        if (res.success) setIssues(res.data);
      })
      .catch((err) => console.error('Failed to load issues:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIssues();
  }, [statusFilter, scope, activeUser?._id, reloadTrigger]);

  const handleReturn = async (issue) => {
    if (!activeUser) {
      alert('You must select your member profile from the top-right user menu to return a book.');
      return;
    }

    const isOwner = issue.user && issue.user._id === activeUser._id;
    const isLibrarian = activeUser.role === 'librarian';

    if (!isOwner && !isLibrarian) {
      alert(`Permission Denied: This book was borrowed by ${issue.user?.name || 'another member'}. Only they can return this book!`);
      return;
    }

    setReturningId(issue._id);
    try {
      const res = await api.returnBook(issue._id, activeUser._id);
      if (res.success) {
        onReturnSuccess();
        fetchIssues();
      }
    } catch (err) {
      alert(`Error returning book: ${err.message}`);
    } finally {
      setReturningId(null);
    }
  };

  const filteredIssues = issues.filter((it) => {
    const q = search.toLowerCase();
    const bookTitle = it.book?.title?.toLowerCase() || '';
    const userName = it.user?.name?.toLowerCase() || '';
    const isbn = it.book?.isbn?.toLowerCase() || '';
    return bookTitle.includes(q) || userName.includes(q) || isbn.includes(q);
  });

  const isGuest = !activeUser;
  const isLibrarian = activeUser && activeUser.role === 'librarian';

  return (
    <div>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
              <ClipboardList className="w-6 h-6 text-indigo-600" />
              <span>{scope === 'my' && activeUser ? `${activeUser.name}'s Borrowed Books` : 'Library Loans & Records'}</span>
            </h1>
            {activeUser && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Logged in as {activeUser.name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeUser
              ? 'Books issued strictly to your account. Only you can return your borrowed books.'
              : 'Browse all loans. To return or borrow books, switch to a member account in the top-right.'}
          </p>
        </div>

        {/* View Scope Toggle (My Books vs All Library Books) */}
        {activeUser && (
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setScope('my')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                scope === 'my'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Books Only
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                scope === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Member Loans {isLibrarian && '(Admin View)'}
            </button>
          </div>
        )}
      </div>

      {/* Guest Notice */}
      {isGuest && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-6 flex items-start space-x-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Browsing as Guest:</span> You can view library borrowing activity below, but you cannot return or issue books for other members. To access your personal loan history or return books, select your member profile (e.g. <strong>Alex Rivers</strong>, <strong>Sarah Chen</strong>, or <strong>Marcus Thorne</strong>) from the top-right user menu.
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Status ({issues.length})
          </button>
          <button
            onClick={() => setStatusFilter('issued')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === 'issued' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active Loans
          </button>
          <button
            onClick={() => setStatusFilter('returned')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === 'returned' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Returned History
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2 w-full sm:w-72 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, member, or ISBN..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Loans Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-slate-500 font-medium">Loading loan records...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No loan records found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {scope === 'my' && activeUser
              ? `You (${activeUser.name}) have no records matching this filter. Go to the Catalog to borrow a book!`
              : 'There are currently no issued books matching this filter.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Book Title</th>
                  <th className="py-3.5 px-4">Borrowing Member</th>
                  <th className="py-3.5 px-4">Issued On</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Return Book</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredIssues.map((issue) => {
                  const isReturned = issue.status === 'returned';
                  const isOverdue = !isReturned && new Date(issue.dueDate) < new Date();
                  const isOwner = activeUser && issue.user && issue.user._id === activeUser._id;
                  const canReturn = !isReturned && (isOwner || isLibrarian);

                  return (
                    <tr key={issue._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Book */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={issue.book?.coverImage}
                            alt=""
                            className="w-10 h-14 object-cover rounded-md bg-slate-100 shrink-0 shadow-xs"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{issue.book?.title || 'Unknown Title'}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">by {issue.book?.author}</div>
                            <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-400">
                              ISBN: {issue.book?.isbn}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* User / Borrower */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <div className="font-semibold text-slate-800">{issue.user?.name || 'Unknown User'}</div>
                          {isOwner && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{issue.user?.email}</div>
                      </td>

                      {/* Issue Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {new Date(issue.issueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {new Date(issue.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </div>
                        {isOverdue && (
                          <div className="text-[10px] font-bold text-rose-600 flex items-center space-x-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Overdue</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            isReturned
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : isOverdue
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isReturned ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-slate-500" />
                              <span>Returned</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-emerald-600" />
                              <span>Active Loan</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Return Action with Strict Ownership Protection */}
                      <td className="py-3.5 px-4 text-right">
                        {isReturned ? (
                          <span className="text-[11px] text-slate-400 font-medium">
                            Returned on {new Date(issue.returnDate).toLocaleDateString()}
                          </span>
                        ) : canReturn ? (
                          <button
                            onClick={() => handleReturn(issue)}
                            disabled={returningId === issue._id}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-200 transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{returningId === issue._id ? 'Returning...' : 'Return Book'}</span>
                          </button>
                        ) : (
                          <div
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-400 text-[11px] font-medium border border-slate-200 cursor-not-allowed"
                            title={`This book was borrowed by ${issue.user?.name || 'another member'}. Only they can return it.`}
                          >
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Only {issue.user?.name?.split(' ')[0] || 'Borrower'} can return</span>
                          </div>
                        )}
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
