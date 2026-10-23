const mongoose = require('mongoose');
const Book = require('./models/Book');
const User = require('./models/User');
const Issue = require('./models/Issue');
const { connectDB, closeDB } = require('./config/db');

const sampleBooks = [
  {
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '978-0441172719',
    genre: 'Science Fiction',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange.',
    coverImage: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=600',
    totalCopies: 4,
    availableCopies: 3,
    rating: 4.8,
    publishYear: 1965,
    borrowCount: 12,
  },
  {
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    isbn: '978-0593135204',
    genre: 'Science Fiction',
    description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself are doomed.',
    coverImage: 'https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=600',
    totalCopies: 3,
    availableCopies: 2,
    rating: 4.9,
    publishYear: 2021,
    borrowCount: 15,
  },
  {
    title: 'Neuromancer',
    author: 'William Gibson',
    isbn: '978-0441569595',
    genre: 'Science Fiction',
    description: 'Case was the sharpest data-thief in the matrix—until he crossed the wrong people and they crippled his nervous system.',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
    totalCopies: 3,
    availableCopies: 3,
    rating: 4.6,
    publishYear: 1984,
    borrowCount: 7,
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '978-1449373320',
    genre: 'Technology',
    description: 'The definitive guide to the architecture of reliable, scalable, and maintainable systems in the modern cloud era.',
    coverImage: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=600',
    totalCopies: 5,
    availableCopies: 4,
    rating: 4.9,
    publishYear: 2017,
    borrowCount: 20,
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    genre: 'Technology',
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600',
    totalCopies: 4,
    availableCopies: 3,
    rating: 4.7,
    publishYear: 2008,
    borrowCount: 18,
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'David Thomas & Andrew Hunt',
    isbn: '978-0135957059',
    genre: 'Technology',
    description: 'Your journey to mastery: topics ranging from personal responsibility and career development to architectural techniques.',
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600',
    totalCopies: 3,
    availableCopies: 3,
    rating: 4.8,
    publishYear: 2019,
    borrowCount: 14,
  },
  {
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    isbn: '978-1250301696',
    genre: 'Mystery',
    description: 'Alicia Berenson’s life is seemingly perfect. Then one evening she shoots her husband five times in the face, and never speaks another word.',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600',
    totalCopies: 4,
    availableCopies: 4,
    rating: 4.5,
    publishYear: 2019,
    borrowCount: 11,
  },
  {
    title: 'The Girl with the Dragon Tattoo',
    author: 'Stieg Larsson',
    isbn: '978-0307949486',
    genre: 'Mystery',
    description: 'A dark mystery involving an unsolved disappearance, high-stakes finance, and a brilliant, enigmatic hacker named Lisbeth Salander.',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=600',
    totalCopies: 3,
    availableCopies: 2,
    rating: 4.6,
    publishYear: 2005,
    borrowCount: 9,
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    isbn: '978-0547928227',
    genre: 'Fantasy',
    description: 'Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, until Gandalf the wizard and a company of dwarves arrive on his doorstep.',
    coverImage: 'https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&q=80&w=600',
    totalCopies: 5,
    availableCopies: 5,
    rating: 4.9,
    publishYear: 1937,
    borrowCount: 22,
  },
  {
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    isbn: '978-0756404741',
    genre: 'Fantasy',
    description: 'The heroic story of Kvothe, from his childhood in a troupe of traveling players to his years as an orphan and his admission to a legendary school of magic.',
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=600',
    totalCopies: 4,
    availableCopies: 4,
    rating: 4.7,
    publishYear: 2007,
    borrowCount: 16,
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0061120084',
    genre: 'Fiction',
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
    totalCopies: 4,
    availableCopies: 4,
    rating: 4.8,
    publishYear: 1960,
    borrowCount: 19,
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    genre: 'Fiction',
    description: 'The exemplary novel of the Jazz Age, telling the tragic story of Jay Gatsby and his obsessive pursuit of Daisy Buchanan.',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=600',
    totalCopies: 3,
    availableCopies: 3,
    rating: 4.4,
    publishYear: 1925,
    borrowCount: 13,
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '978-0062316097',
    genre: 'History',
    description: 'From examining the role evolving humans have played in the global ecosystem to charting the rise of empires, Sapiens integrates history and science to reconsider accepted narratives.',
    coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=600',
    totalCopies: 4,
    availableCopies: 4,
    rating: 4.7,
    publishYear: 2014,
    borrowCount: 17,
  },
];

const sampleUsers = [
  {
    name: 'Alex Rivers',
    email: 'alex.rivers@example.com',
    role: 'member',
    favoriteGenres: ['Science Fiction', 'Technology'],
  },
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    role: 'member',
    favoriteGenres: ['Mystery', 'Fiction'],
  },
  {
    name: 'Marcus Thorne',
    email: 'marcus.librarian@library.org',
    role: 'librarian',
    favoriteGenres: ['History', 'Fantasy'],
  },
];

const seedData = async () => {
  console.log('Seeding initial library dataset...');

  // Clear existing collections
  await Promise.all([
    Book.deleteMany({}),
    User.deleteMany({}),
    Issue.deleteMany({}),
  ]);

  // Insert Books and Users
  const createdBooks = await Book.insertMany(sampleBooks);
  const createdUsers = await User.insertMany(sampleUsers);

  console.log(`Seeded ${createdBooks.length} books and ${createdUsers.length} users.`);

  // Create initial issue history for Alex Rivers to show off personalized recommendations
  const alex = createdUsers.find((u) => u.email === 'alex.rivers@example.com');
  const dune = createdBooks.find((b) => b.title === 'Dune');
  const hailMary = createdBooks.find((b) => b.title === 'Project Hail Mary');
  const dragonTattoo = createdBooks.find((b) => b.title === 'The Girl with the Dragon Tattoo');
  const sarah = createdUsers.find((u) => u.email === 'sarah.chen@example.com');

  if (alex && dune && hailMary) {
    // Past returned book: Dune
    await Issue.create({
      book: dune._id,
      user: alex._id,
      issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
      returnDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
      status: 'returned',
    });

    // Active loan: Project Hail Mary
    await Issue.create({
      book: hailMary._id,
      user: alex._id,
      issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      status: 'issued',
    });
  }

  if (sarah && dragonTattoo) {
    // Active loan: The Girl with the Dragon Tattoo
    await Issue.create({
      book: dragonTattoo._id,
      user: sarah._id,
      issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      status: 'issued',
    });
  }

  console.log('Seeded sample active and returned loan records.');
  return { booksCount: createdBooks.length, usersCount: createdUsers.length };
};

// If run directly from command line (node seed.js)
if (require.main === module) {
  require('dotenv').config();
  connectDB()
    .then(async () => {
      await seedData();
      await closeDB();
      console.log('Seeding completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { seedData };
