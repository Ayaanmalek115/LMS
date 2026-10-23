import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, RotateCcw, Search, BookOpen } from 'lucide-react';
import api from '../services/api';

export default function IssuedLoansPage({ onReturnSuccess, reloadTrigger }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [returningId, setReturningId] = useState(null);

  const fetchIssues = () => {
    setLoading(true);
    api.getIssues({ status: statusFilter !== 'all' ? statusFilter : undefined })
      .then((res) => {
        if (res.success) setIssues(res.data);
      })
      .catch((err) => console.error('Failed to load issues:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIssues();
  }, [statusFilter, reloadTrigger]);

  const handleReturn = async (issueId) => {
    setReturningId(issueId);
    try {
      const res = await api.returnBook(issueId);
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

  return (
    <div>
      {/* Page Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <ClipboardList className="w-6 h-6 text-indigo-600" />
            <span>Library Loans & Issued Books</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track borrowed copies, check due dates, and process book returns.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Loans ({issues.length})
          </button>
          <button
            onClick={() => setStatusFilter('issued')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === 'issued' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Only
          </button>
          <button
            onClick={() => setStatusFilter('returned')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === 'returned' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Returned
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs mb-6 flex items-center space-x-2">
        <Search className="w-4 h-4 text-slate-400 pl-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by book title, member name, or ISBN..."
          className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600 px-2">
            Clear
          </button>
        )}
      </div>

      {/* Loans Table / Cards */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-slate-500 font-medium">Loading loans...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No loan records found</h3>
          <p className="text-xs text-slate-500 mt-1">
            There are currently no issued books matching this filter.
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
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredIssues.map((issue) => {
                  const isReturned = issue.status === 'returned';
                  const isOverdue = !isReturned && new Date(issue.dueDate) < new Date();

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

                      {/* User */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{issue.user?.name || 'Unknown User'}</div>
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
                              <span>Issued</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Return Action */}
                      <td className="py-3.5 px-4 text-right">
                        {!isReturned ? (
                          <button
                            onClick={() => handleReturn(issue._id)}
                            disabled={returningId === issue._id}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{returningId === issue._id ? 'Returning...' : 'Return'}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Returned {new Date(issue.returnDate).toLocaleDateString()}
                          </span>
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
