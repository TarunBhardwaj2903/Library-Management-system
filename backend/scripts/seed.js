require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Membership = require('../src/models/Membership');
const Book = require('../src/models/Book');
const Transaction = require('../src/models/Transaction');
const { addMonths, addDays } = require('../src/utils/dates');

async function main() {
  await connectDB(process.env.MONGODB_URI);

  await Promise.all([
    User.deleteMany({}),
    Membership.deleteMany({}),
    Book.deleteMany({}),
    Transaction.deleteMany({}),
  ]);

  const [adminHash, johnHash] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('user123', 10),
  ]);

  const admin = await User.create({
    username: 'admin',
    passwordHash: adminHash,
    name: 'System Admin',
    email: 'admin@lms.local',
    role: 'admin',
  });
  const john = await User.create({
    username: 'john',
    passwordHash: johnHash,
    name: 'John Reader',
    email: 'john@lms.local',
    phone: '555-0101',
    role: 'user',
  });

  const today = new Date();
  const membership = await Membership.create({
    membershipNo: 'M0001',
    userId: john._id,
    startDate: today,
    endDate: addMonths(today, 6),
    status: 'active',
  });

  const books = await Book.insertMany([
    { serialNo: 'B001', title: 'Clean Code', author: 'Robert C. Martin', type: 'Book', category: 'Programming', publisher: 'Prentice Hall', copiesTotal: 3, copiesAvailable: 3 },
    { serialNo: 'B002', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', type: 'Book', category: 'Programming', publisher: 'Addison-Wesley', copiesTotal: 2, copiesAvailable: 2 },
    { serialNo: 'B003', title: 'Design Patterns', author: 'Erich Gamma', type: 'Book', category: 'Programming', publisher: 'Addison-Wesley', copiesTotal: 2, copiesAvailable: 2 },
    { serialNo: 'B004', title: 'Sapiens', author: 'Yuval Noah Harari', type: 'Book', category: 'History', publisher: 'Harper', copiesTotal: 2, copiesAvailable: 1 },
    { serialNo: 'B005', title: 'The Alchemist', author: 'Paulo Coelho', type: 'Book', category: 'Fiction', publisher: 'HarperOne', copiesTotal: 4, copiesAvailable: 4 },
    { serialNo: 'M001', title: 'Inception', author: 'Christopher Nolan', type: 'Movie', category: 'Sci-Fi', publisher: 'Warner Bros', copiesTotal: 2, copiesAvailable: 2 },
    { serialNo: 'M002', title: 'Interstellar', author: 'Christopher Nolan', type: 'Movie', category: 'Sci-Fi', publisher: 'Paramount', copiesTotal: 2, copiesAvailable: 2 },
  ]);

  const sapiens = books.find((b) => b.serialNo === 'B004');
  await Transaction.create({
    bookId: sapiens._id,
    membershipId: membership._id,
    issueDate: addDays(today, -20),
    returnDate: addDays(today, -5),
    status: 'issued',
    remarks: 'Seeded overdue issue for demo',
  });

  console.log('[seed] done');
  console.log('  admin / admin123  (admin)');
  console.log('  john  / user123   (user, membership M0001)');
  console.log('  Overdue book: Sapiens (serial B004)');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
