import "dotenv/config";

import { connectDB, disconnectDB } from "../config/db.js";
import User from "../models/User.js";

const TOTAL_USERS = 100;

const FIRST_NAMES = ["Aarav", "Priya", "Rahul", "Sneha", "Vikram", "Ananya", "Karan", "Meera", "Rohan", "Divya"];
const LAST_NAMES = ["Sharma", "Patel", "Kumar", "Singh", "Gupta", "Reddy", "Nair", "Mehta", "Iyer", "Joshi"];
const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur", "Ahmedabad", "Indore"];

function buildUsers(count) {
  return Array.from({ length: count }, (_, index) => {
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
    const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];

    return {
      name: `${firstName} ${lastName}`,
      email: `${firstName}.${lastName}${index + 1}@example.com`.toLowerCase(),
      age: 18 + (index % 43),
      city: CITIES[index % CITIES.length],
    };
  });
}

async function seed() {
  try {
    await connectDB();

    await User.deleteMany({});
    const users = await User.insertMany(buildUsers(TOTAL_USERS));

    console.log(`Seeded ${users.length} users into '${User.collection.name}'`);
    console.log(`Sample profile: /api/user/profile/${users[0]._id}`);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

seed();
