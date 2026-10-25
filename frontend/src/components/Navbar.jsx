import React from 'react';
import { BookOpen, Sparkles, ClipboardList, Settings, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, users, activeUser, setActiveUser }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('catalog')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                LibVibe
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                Library & Recommendations
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'catalog'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('foryou')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'foryou'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Recommendations</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            </button>

            <button
              onClick={() => setActiveTab('loans')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'loans'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>{activeUser ? 'My Loans' : 'Issued Loans'}</span>
            </button>

            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'manage'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Manage Books</span>
            </button>
          </nav>

          {/* User Profile / Simulator Switcher */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <select
                value={activeUser ? activeUser._id : 'guest'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'guest') {
                    setActiveUser(null);
                  } else {
                    const u = users.find((x) => x._id === val);
                    setActiveUser(u || null);
                  }
                }}
                className="bg-transparent text-xs font-medium text-slate-700 pl-2 pr-6 py-1 focus:outline-none cursor-pointer"
                title="Switch active user to test personalized recommendations"
              >
                <option value="guest">Guest / New Visitor</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`p-2 rounded-lg text-xs flex flex-col items-center ${activeTab === 'catalog' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <BookOpen className="w-4 h-4 mb-1" />
            Catalog
          </button>
          <button
            onClick={() => setActiveTab('foryou')}
            className={`p-2 rounded-lg text-xs flex flex-col items-center ${activeTab === 'foryou' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <Sparkles className="w-4 h-4 mb-1 text-amber-500" />
            For You
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`p-2 rounded-lg text-xs flex flex-col items-center ${activeTab === 'loans' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <ClipboardList className="w-4 h-4 mb-1" />
            Loans
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`p-2 rounded-lg text-xs flex flex-col items-center ${activeTab === 'manage' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <Settings className="w-4 h-4 mb-1" />
            Manage
          </button>
        </div>
      </div>
    </header>
  );
}
