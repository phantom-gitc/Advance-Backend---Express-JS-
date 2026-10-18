import mongoose from "mongoose";
import connectDB from "../configs/database.js";
import Product from "../models/products.model.js";

const sampleProducts = [
  {
    name: "Sony WH-1000XM5 Wireless Headphones",
    title: "Industry Leading Noise Canceling Headphones",
    price: 29990,
    currency: "INR",
    category: "Audio",
    description: "Premium wireless over-ear headphones with auto noise-canceling optimizer and 30-hour battery life.",
    stock: 25,
  },
  {
    name: "Apple iPad Air M2 (11-inch)",
    title: "Powerful & Versatile Liquid Retina Tablet",
    price: 59900,
    currency: "INR",
    category: "Tablets",
    description: "Supercharged by the Apple M2 chip, 128GB storage, Wi-Fi 6E, landscape 12MP front camera with Center Stage.",
    stock: 15,
  },
  {
    name: "Logitech MX Master 3S Mouse",
    title: "Advanced Performance Wireless Ergonomic Mouse",
    price: 9495,
    currency: "INR",
    category: "Accessories",
    description: "Quiet clicks, 8K DPI any-surface tracking, MagSpeed electromagnetic scrolling, and USB-C quick charge.",
    stock: 40,
  },
  {
    name: "Keychron K2 Pro Mechanical Keyboard",
    title: "QMK/VIA Wireless Custom Mechanical Keyboard",
    price: 8999,
    currency: "INR",
    category: "Accessories",
    description: "75% layout, hot-swappable tactile switches, double-shot PBT keycaps, and Mac/Windows cross compatibility.",
    stock: 30,
  },
  {
    name: "Dell UltraSharp 27 4K USB-C Hub Monitor",
    title: "27-inch 4K UHD IPS Black Monitor",
    price: 48999,
    currency: "INR",
    category: "Monitors",
    description: "Brilliant color accuracy with IPS Black technology, 90W USB-C power delivery, and RJ45 Ethernet connectivity.",
    stock: 12,
  },
  {
    name: "Cohort 3.0 Full Stack Web Development",
    title: "Complete 0-100 Web Dev & Open Source Course",
    price: 5999,
    currency: "INR",
    category: "Courses",
    description: "Comprehensive live bootcamp covering React, Node.js, Next.js, Docker, Kubernetes, and System Design.",
    stock: 999,
  },
  {
    name: "Cohort 3.0 Web3 & Blockchain Engineering",
    title: "Master Solana, Ethereum & Smart Contracts",
    price: 6999,
    currency: "INR",
    category: "Courses",
    description: "Deep dive into Rust, Anchor, Solidity, decentralized applications, and decentralized exchange architecture.",
    stock: 999,
  },
  {
    name: "Cohort 3.0 DevOps & Cloud Architecture",
    title: "Industry Standard DevOps from Scratch",
    price: 5499,
    currency: "INR",
    category: "Courses",
    description: "Hands-on mastery of Linux, CI/CD pipelines, Docker, Kubernetes, Prometheus, Grafana, and AWS.",
    stock: 999,
  },
  {
    name: "Samsung Galaxy Watch 6 Classic",
    title: "Rotating Bezel Smartwatch with ECG & Sleep Tracking",
    price: 24999,
    currency: "INR",
    category: "Wearables",
    description: "Sophisticated stainless steel rotating bezel, advanced body composition analysis, and sapphire crystal display.",
    stock: 20,
  },
  {
    name: "Bose SoundLink Flex Bluetooth Speaker",
    title: "Waterproof Portable Outdoor Wireless Speaker",
    price: 13900,
    currency: "INR",
    category: "Audio",
    description: "Rugged IP67 waterproof design with PositionIQ technology for clear, deep audio in any orientation.",
    stock: 35,
  },
  {
    name: "Anker Prime 20,000mAh Power Bank (200W)",
    title: "High-Capacity Ultra-Fast Multi-Port Power Bank",
    price: 11999,
    currency: "INR",
    category: "Accessories",
    description: "200W total output with smart digital display, capable of fast-charging two laptops simultaneously.",
    stock: 50,
  },
  {
    name: "Sony PlayStation 5 DualSense Wireless Controller",
    title: "Next-Gen Controller with Haptic Feedback",
    price: 5790,
    currency: "INR",
    category: "Gaming",
    description: "Dynamic adaptive triggers, built-in microphone, and immersive haptic feedback for PC and console gaming.",
    stock: 60,
  },
  {
    name: "SteelSeries Arctis Nova 7 Wireless Headset",
    title: "Multi-Platform Wireless Gaming Headset",
    price: 16999,
    currency: "INR",
    category: "Gaming",
    description: "Simultaneous 2.4GHz and Bluetooth audio, 38-hour battery, ClearCast Gen 2 AI-powered noise canceling mic.",
    stock: 18,
  },
  {
    name: "Kindle Paperwhite (16GB, 6.8-inch)",
    title: "Glare-Free Waterproof e-Reader with Warm Light",
    price: 14999,
    currency: "INR",
    category: "Electronics",
    description: "Flush-front 300 ppi display, adjustable warm light, up to 10 weeks of battery life, and USB-C charging.",
    stock: 45,
  },
  {
    name: "Elgato Stream Deck MK.2",
    title: "15 Customizable LCD Macro Keys Studio Controller",
    price: 13490,
    currency: "INR",
    category: "Accessories",
    description: "One-touch tactile control for streaming, recording, code navigation, smart lighting, and audio plugins.",
    stock: 22,
  },
  {
    name: "Razer DeathAdder V3 Pro Wireless Gaming Mouse",
    title: "Ultra-Lightweight Ergonomic Esports Mouse",
    price: 12499,
    currency: "INR",
    category: "Gaming",
    description: "63g ultra-lightweight design, Focus Pro 30K Optical Sensor, and Gen-3 Optical Mouse Switches.",
    stock: 30,
  },
  {
    name: "Belkin 3-in-1 MagSafe Wireless Charger",
    title: "Fast Wireless Charging Stand for iPhone, Watch & AirPods",
    price: 13999,
    currency: "INR",
    category: "Accessories",
    description: "Official MagSafe 15W fast wireless charging station with premium stainless steel arm and weighted base.",
    stock: 28,
  },
  {
    name: "SanDisk Extreme PRO 1TB Portable SSD",
    title: "Rugged NVMe High-Speed External SSD",
    price: 12999,
    currency: "INR",
    category: "Storage",
    description: "Up to 2000MB/s read/write speeds, IP55 water and dust resistance, and 256-bit AES hardware encryption.",
    stock: 35,
  },
  {
    name: "Shure MV7X Podcast Dynamic Microphone",
    title: "Broadcast Quality XLR Cardioid Microphone",
    price: 14890,
    currency: "INR",
    category: "Audio",
    description: "Voice Isolation Technology optimized for podcasting, vocal recording, and live streaming in untreated rooms.",
    stock: 15,
  },
  {
    name: "Figma to Full Stack UI/UX Masterclass",
    title: "Design System & Frontend Architecture Course",
    price: 3499,
    currency: "INR",
    category: "Courses",
    description: "Comprehensive guide to prototyping, component systems, Tailwind, Framer Motion, and scalable frontend code.",
    stock: 999,
  },
];

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();

    console.log("Clearing existing products...");
    await Product.deleteMany({});

    console.log(`Inserting ${sampleProducts.length} fake products...`);
    const inserted = await Product.insertMany(sampleProducts);

    console.log(`✅ Successfully seeded ${inserted.length} products into the database!`);
    console.log("Sample product IDs for testing orders:");
    inserted.slice(0, 3).forEach((p, idx) => {
      console.log(` ${idx + 1}. [${p._id}] ${p.name} - ₹${p.price}`);
    });

    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed products:", error);
    process.exit(1);
  }
};

seedDatabase();
