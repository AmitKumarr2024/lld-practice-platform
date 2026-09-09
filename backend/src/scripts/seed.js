const bcrypt = require("bcryptjs");
const { connectDatabase, disconnectDatabase } = require("../config/database");
const { User } = require("../models/User");
const { Problem } = require("../models/Problem");
const { Attempt } = require("../models/Attempt");
const { Evaluation } = require("../models/Evaluation");

const problems = [
  {
    title: "Parking Lot",
    slug: "parking-lot",
    difficulty: "MEDIUM",
    description: "Design a multi-level parking lot system that manages vehicles, spots, and payment.",
    problemStatement:
      "Design a parking lot system that supports multiple levels, multiple spot sizes (motorcycle, compact, large), " +
      "ticket generation on entry, spot assignment, and fee calculation on exit. The system should handle a full lot gracefully.",
    requirements: [
      "Support multiple vehicle types: motorcycle, car, bus",
      "Support multiple spot sizes and levels",
      "Assign the most suitable available spot on entry",
      "Generate a ticket with entry time",
      "Calculate a parking fee based on duration on exit",
      "Handle the case where the lot is full",
    ],
    constraints: [
      "A bus may require multiple adjacent large spots (optional, explain your assumption)",
      "The system should be extensible to new vehicle types or pricing strategies",
    ],
  },
  {
    title: "Elevator System",
    slug: "elevator-system",
    difficulty: "HARD",
    description: "Design a multi-elevator control system for a building.",
    problemStatement:
      "Design a system that controls multiple elevators in a building. The system should accept external hall " +
      "requests (up/down from a floor) and internal cabin requests (a destination floor), and decide which elevator " +
      "serves which request efficiently.",
    requirements: [
      "Support multiple elevators",
      "Handle external hall calls (floor + direction) and internal floor selection",
      "Choose an elevator to dispatch based on some strategy",
      "Track elevator state: idle, moving up, moving down, door open",
      "Handle simultaneous requests from multiple floors",
    ],
    constraints: [
      "You do not need to implement real scheduling algorithms in code — explain the strategy",
      "Consider what happens when all elevators are busy",
    ],
  },
  {
    title: "Vending Machine",
    slug: "vending-machine",
    difficulty: "EASY",
    description: "Design a vending machine that dispenses items and handles payment and change.",
    problemStatement:
      "Design a vending machine that lets a user select a product, insert money, and receive the product along with " +
      "correct change, or a refund if the transaction cannot be completed. Model the machine's states clearly.",
    requirements: [
      "Support product selection and inventory tracking",
      "Accept payment (coins/notes) and compute change",
      "Handle out-of-stock and insufficient-payment scenarios",
      "Model states such as Idle, Selecting, HasMoney, Dispensing, OutOfStock",
      "Support refunding money if the transaction is cancelled",
    ],
    constraints: [
      "Assume a fixed set of denominations",
      "The design should make it easy to add new products or payment methods",
    ],
  },
  {
    title: "Library Management System",
    slug: "library-management-system",
    difficulty: "MEDIUM",
    description: "Design a system to manage books, members, and borrowing/returning in a library.",
    problemStatement:
      "Design a library management system that tracks books (including multiple copies), members, and the process " +
      "of borrowing and returning books, including reservations and late fees.",
    requirements: [
      "Track books, their copies, and availability",
      "Support member registration and borrowing limits",
      "Support checkout and return, including due dates",
      "Support reservations when a book is unavailable",
      "Calculate late fees for overdue returns",
    ],
    constraints: [
      "A book may have multiple physical copies with independent availability",
      "The design should support future extension such as digital/e-book lending",
    ],
  },
];

const demoUsers = [
  { name: "Learner Demo", email: "learner@demo.com", password: "learner123", role: "LEARNER" },
  { name: "Admin Demo", email: "admin@demo.com", password: "admin123", role: "ADMIN" },
];

async function seed() {
  await connectDatabase();

  console.log("Clearing existing data...");
  await Promise.all([
    Problem.deleteMany({}),
    User.deleteMany({}),
    Attempt.deleteMany({}),
    Evaluation.deleteMany({}),
  ]);

  console.log("Seeding problems...");
  await Problem.insertMany(problems.map((p) => ({ ...p, active: true })));

  console.log("Seeding demo users...");
  for (const u of demoUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.create({ name: u.name, email: u.email, passwordHash, role: u.role });
  }

  console.log("Seed complete.");
  console.log("Demo logins:");
  console.log("  Learner -> learner@demo.com / learner123");
  console.log("  Admin   -> admin@demo.com / admin123");

  await disconnectDatabase();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
