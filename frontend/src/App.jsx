import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CatalogPage from './pages/CatalogPage';
import ForYouPage from './pages/ForYouPage';
import IssuedLoansPage from './pages/IssuedLoansPage';
import ManageBooksPage from './pages/ManageBooksPage';
import BookDetailsModal from './components/BookDetailsModal';
import BookModal from './components/BookModal';
import IssueModal from './components/IssueModal';
import api from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Modals state
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowTargetBook, setBorrowTargetBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Initial load: users and stats
  useEffect(() => {
    api.getUsers()
      .then((res) => {
        if (res.success && res.data.length > 0) {
          setUsers(res.data);
          // Set default user to Alex Rivers to showcase recommendation engine immediately
          const alex = res.data.find((u) => u.name.includes('Alex')) || res.data[0];
          setActiveUser(alex);
        }
      })
      .catch((err) => console.error('Failed to load users:', err));
  }, []);

  useEffect(() => {
    api.getStats()
      .then((res) => {
        if (res.success) setStats(res.data);
      })
      .catch((err) => console.error('Failed to load stats:', err));
  }, [reloadTrigger]);

  const handleRefresh = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  const handleSaveBook = async (bookData, bookId) => {
    if (bookId) {
      await api.updateBook(bookId, bookData);
    } else {
      await api.createBook(bookData);
    }
    handleRefresh();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        users={users}
        activeUser={activeUser}
        setActiveUser={setActiveUser}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'catalog' && (
          <CatalogPage
            onSelectBook={(b) => setSelectedBook(b)}
            onBorrowBook={(b) => setBorrowTargetBook(b)}
            stats={stats}
            reloadTrigger={reloadTrigger}
          />
        )}

        {activeTab === 'foryou' && (
          <ForYouPage
            activeUser={activeUser}
            onSelectBook={(b) => setSelectedBook(b)}
            onBorrowBook={(b) => setBorrowTargetBook(b)}
            reloadTrigger={reloadTrigger}
          />
        )}

        {activeTab === 'loans' && (
          <IssuedLoansPage
            onReturnSuccess={handleRefresh}
            reloadTrigger={reloadTrigger}
          />
        )}

        {activeTab === 'manage' && (
          <ManageBooksPage
            onAddBook={() => setShowAddModal(true)}
            onEditBook={(b) => setEditingBook(b)}
            reloadTrigger={reloadTrigger}
          />
        )}
      </main>

      {/* Modals */}
      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onBorrow={(b) => setBorrowTargetBook(b)}
          onSelectSimilar={(b) => setSelectedBook(b)}
        />
      )}

      {borrowTargetBook && (
        <IssueModal
          book={borrowTargetBook}
          users={users}
          activeUser={activeUser}
          onClose={() => setBorrowTargetBook(null)}
          onSuccess={() => handleRefresh()}
        />
      )}

      {(showAddModal || editingBook) && (
        <BookModal
          book={editingBook}
          onClose={() => {
            setShowAddModal(false);
            setEditingBook(null);
          }}
          onSave={handleSaveBook}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-800">LibVibe</strong> — Full-Stack Library Management & Book Recommendation System
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <span>Node.js / Express</span>
            <span>•</span>
            <span>React / Vite</span>
            <span>•</span>
            <span>MongoDB / Mongoose</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
