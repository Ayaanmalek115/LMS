# LibVibe — Library Management & Book Recommendation System

A full-stack web application built with **Node.js/Express**, **React.js (Vite + Tailwind CSS)**, and **MongoDB (Mongoose)**. It provides a complete library management workflow with an intelligent, rule-based book recommendation engine based on genres, authors, and user borrowing patterns.

---

## 🌟 Features

1. **Book Catalog & Search**:
   - Live search across title, author, genre, and ISBN.
   - Category / Genre pills filter (`Science Fiction`, `Technology`, `Mystery`, `Fantasy`, `Fiction`, `History`, etc.).
   - Stock availability toggle (`In Stock` vs `Fully Borrowed`).
   - Detailed modal with full synopsis and "More Books in [Genre]" recommendation rail.

2. **Smart Book Recommendation Engine (`/api/recommendations`)**:
   - **Genre Affinity Matching**: Analyzes a member's active and historical loans, calculates category weights, and ranks unread titles.
   - **Author Overlap**: Scores books written by authors the member has previously read.
   - **Quality & Popularity Weighting**: Factors in book ratings ($1.5\times$) and checkout frequency.
   - **Transparent Explanation Badges**: Every recommendation comes with a reason chip (e.g. *"Matches your interest in Science Fiction"*, *"Critically acclaimed in Technology"*).
   - **Zero Complex AI Dependency**: Fast, transparent, reproducible, and requires no external API keys or heavy Python models.

3. **Issue & Return Tracking (`/api/issues`)**:
   - Checkout / Borrow book modal with borrower selection and configurable loan durations (7, 14, 21, 30 days).
   - Real-time stock decrement and due date calculations.
   - One-click book return that immediately restocks available copies.
   - Overdue loan indicator.

4. **Inventory Management (Librarian/Admin)**:
   - Full CRUD: Add new titles, edit metadata and inventory counts, delete titles (with active loan protection).

5. **Plug-and-Play Database (In-Memory Fallback)**:
   - Connects to local MongoDB (`mongodb://127.0.0.1:27017/library_db`) or MongoDB Atlas.
   - If no MongoDB instance is currently running, it automatically boots an in-memory MongoDB instance (`mongodb-memory-server`) and seeds it with 13 curated books and demo users so you can test the entire app immediately without any setup hurdles!

---

## 📂 Project Structure

```
library-management-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Database connection + auto in-memory fallback
│   │   ├── controllers/
│   │   │   ├── bookController.js      # Book CRUD, search, filter, stats
│   │   │   ├── issueController.js     # Borrow and return book logic
│   │   │   ├── recommendationController.js # Rule-based recommendation engine
│   │   │   └── userController.js      # User management & preferences
│   │   ├── models/
│   │   │   ├── Book.js                # Book schema with indexes
│   │   │   ├── User.js                # User schema & favorite genres
│   │   │   └── Issue.js               # Issue/loan transaction schema
│   │   ├── routes/
│   │   │   ├── bookRoutes.js
│   │   │   ├── issueRoutes.js
│   │   │   ├── recommendationRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── seed.js                   # 13+ curated sample books & users
│   │   └── server.js                 # Express server entrypoint
│   ├── .env                          # Configuration (PORT, MONGODB_URI)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top bar with User Simulator switcher
│   │   │   ├── BookCard.jsx          # Book card with badges and actions
│   │   │   ├── BookDetailsModal.jsx  # Book details + Similar books rail
│   │   │   ├── BookModal.jsx         # Add / Edit book modal dialog
│   │   │   ├── IssueModal.jsx        # Borrow book dialog
│   │   │   └── StatsCard.jsx         # 4-metric dashboard summary
│   │   ├── pages/
│   │   │   ├── CatalogPage.jsx       # Main search & browse catalog
│   │   │   ├── ForYouPage.jsx        # Personalized recommendations center
│   │   │   ├── IssuedLoansPage.jsx   # Active & returned loan management
│   │   │   └── ManageBooksPage.jsx   # Librarian inventory CRUD table
│   │   ├── services/
│   │   │   └── api.js                # Centralized REST client
│   │   ├── App.jsx                   # Main layout and modal state
│   │   ├── index.css                 # Tailwind CSS styling
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── package.json
│   └── index.html
│
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Start the Backend Server

```bash
cd backend
npm install
npm run dev
```

The server will start on `http://localhost:5000`.
- If you have MongoDB installed locally or want to use Atlas, edit `backend/.env` with your URI:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/library_db
  ```
- If you don't have MongoDB installed, the backend will automatically launch the built-in in-memory MongoDB and seed initial data automatically!

### 2. Start the Frontend Application

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open your browser to:
👉 **`http://localhost:5173`**

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/books` | Get books with `?search=`, `?genre=`, `?availability=` |
| `GET` | `/api/books/:id` | Get book by ID |
| `POST` | `/api/books` | Add new book to library |
| `PUT` | `/api/books/:id` | Update book details and inventory |
| `DELETE` | `/api/books/:id` | Delete book (safe check on active loans) |
| `GET` | `/api/books/genres` | Get list of distinct genres |
| `GET` | `/api/books/stats` | Get inventory & loan summary stats |
| `POST` | `/api/issues/borrow` | Issue a book (`{ bookId, userId, days }`) |
| `POST` | `/api/issues/return` | Return a borrowed book (`{ issueId }`) |
| `GET` | `/api/issues` | List loans (`?status=issued\|returned`) |
| `GET` | `/api/recommendations/user/:userId` | Personalized recommendations for a user |
| `GET` | `/api/recommendations/similar/:bookId` | Category/Author similar books |
| `GET` | `/api/users` | List library members & librarians |
