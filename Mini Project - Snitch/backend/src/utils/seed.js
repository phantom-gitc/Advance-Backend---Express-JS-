import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import productModel from "../models/product.model.js";
import connectDB from "../config/database.js";

const seedData = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding...");

    // Clear existing products
    await productModel.deleteMany({});
    console.log("Cleared existing products.");

    // Check or create seller
    let seller = await userModel.findOne({ email: "seller@atelier.com" });
    const hashedPassword = await bcrypt.hash("password123", 10);
    if (!seller) {
      seller = await userModel.create({
        name: "Atelier Studio",
        email: "seller@atelier.com",
        password: hashedPassword,
        role: "seller",
      });
      console.log("Created seller user: seller@atelier.com");
    }

    // Check or create customer
    let customer = await userModel.findOne({ email: "customer@atelier.com" });
    if (!customer) {
      customer = await userModel.create({
        name: "Julian Vance",
        email: "customer@atelier.com",
        password: hashedPassword,
        role: "user",
      });
      console.log("Created customer user: customer@atelier.com");
    }

    const products = [
      // 1. Shirts (Topwear)
      {
        title: "Cuban Collar Abstract Resort Shirt",
        description: "Relaxed box-fit Cuban camp-collar shirt cut from a breathable cotton-viscose blend. Featuring an archival geometric print, chest patch pocket, and genuine mother-of-pearl buttons.",
        price: { amount: 65, currency: "INR" },
        sizes: ["S", "M", "L", "XL"],
        category: "Shirts (Topwear)",
        subCategory: "Casual & Resort Wear",
        stock: 35,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },
      {
        title: "Cotton-Linen Striped Resort Shirt",
        description: "Breezy vertical stripe shirt woven from fine European linen and combed cotton. Open-notch resort collar with relaxed drop shoulders for coastal elegance.",
        price: { amount: 72, currency: "INR" },
        sizes: ["M", "L", "XL"],
        category: "Shirts (Topwear)",
        subCategory: "Casual & Resort Wear",
        stock: 22,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },
      {
        title: "Slim-Fit Satin Bottle Green Party Shirt",
        description: "Tailored evening shirt in lustrous cotton satin. Features clean French placket, stiffened spread collar, and rich emerald green tones for cocktail affairs.",
        price: { amount: 85, currency: "INR" },
        sizes: ["S", "M", "L", "XL", "XXL"],
        category: "Shirts (Topwear)",
        subCategory: "Smart Casual & Party Wear",
        stock: 18,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1620012253295-c15c429f6048?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },
      {
        title: "Heavy Canvas Denim Overshirt Shacket",
        description: "14oz heavy raw denim canvas overshirt tailored with dropped armholes, dual chest flap utility pockets, and gunmetal shank buttons.",
        price: { amount: 110, currency: "INR" },
        sizes: ["M", "L", "XL"],
        category: "Shirts (Topwear)",
        subCategory: "Streetwear & Layering",
        stock: 14,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },

      // 2. T-Shirts & Polos
      {
        title: "280 GSM Boxy Drop-Shoulder Tee",
        description: "Heavyweight 280 GSM combed organic cotton crafted with an exaggerated drop-shoulder silhouette, thick ribbed neckband, and pigment vintage dye.",
        price: { amount: 48, currency: "INR" },
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "T-Shirts & Polos",
        subCategory: "Oversized & Graphic Tees",
        stock: 50,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },
      {
        title: "Textured Flat-Knit Retro Polo",
        description: "Fine gauge Milanese knit polo shirt featuring a classic 70s open-collar retro placket, ribbed cuff trim, and micro-waffle texture.",
        price: { amount: 68, currency: "INR" },
        sizes: ["S", "M", "L", "XL"],
        category: "T-Shirts & Polos",
        subCategory: "Polos",
        stock: 26,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },

      // 3. Jeans (Bottomwear)
      {
        title: "Wide-Leg Vintage Washed Denim",
        description: "Architectural wide-leg skate denim washed in vintage faded indigo. Heavyweight 13.5oz non-stretch cotton with a stacked hem line and custom nickel hardware.",
        price: { amount: 98, currency: "INR" },
        sizes: ["S", "M", "L", "XL"],
        category: "Jeans (Bottomwear)",
        subCategory: "Trending Relaxed Fits",
        stock: 30,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },
      {
        title: "Carpenter Utility Loop Raw Denim",
        description: "Workwear-inspired straight leg jeans featuring reinforced knee panelling, hammer loop, utility ruler pocket, and contrast stitching.",
        price: { amount: 105, currency: "INR" },
        sizes: ["M", "L", "XL"],
        category: "Jeans (Bottomwear)",
        subCategory: "Trending Relaxed Fits",
        stock: 20,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },

      // 4. Trousers, Chinos & Pants
      {
        title: "Korean Double-Pleated Wide Trouser",
        description: "Flowing double-pleat tailored trousers crafted from lightweight tropical wool blend. Features a high-rise waist, deep forward pleats, and clean cuff break.",
        price: { amount: 115, currency: "INR" },
        sizes: ["S", "M", "L", "XL"],
        category: "Trousers, Chinos & Pants",
        subCategory: "Modern & Tailored",
        stock: 25,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },
      {
        title: "Gurkha Crossover Double-Buckle Trouser",
        description: "Iconic Gurkha waistband with adjustable side brass buckles, forward pleats, and a sharp tapered drape in tailored cavalry twill.",
        price: { amount: 125, currency: "INR" },
        sizes: ["M", "L", "XL"],
        category: "Trousers, Chinos & Pants",
        subCategory: "Modern & Tailored",
        stock: 16,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },

      // 5. Cargos & Joggers
      {
        title: "8-Pocket Heavy Twill Street Cargo",
        description: "Utility street pant tailored from 380 GSM combed cotton twill. Reinforced bellows cargo pockets, drawcord ankles, and articulated knee darts.",
        price: { amount: 92, currency: "INR" },
        sizes: ["S", "M", "L", "XL"],
        category: "Cargos & Joggers",
        subCategory: "Street Utility",
        stock: 28,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },
      {
        title: "Technical Parachute Nylon Cargo",
        description: "Ultra-lightweight crinkle nylon pant with bungee cinch hems, waterproof taped zippers, and tactical 3D modular cargo pockets.",
        price: { amount: 96, currency: "INR" },
        sizes: ["M", "L", "XL"],
        category: "Cargos & Joggers",
        subCategory: "Street Utility",
        stock: 22,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },

      // 6. Shorts & Co-Ords
      {
        title: "Monochrome Waffle Knit Co-Ord Set",
        description: "Relaxed matching shirt and lounge shorts set knit from high-GSM waffle cotton. Minimalist buttonless camp collar with elasticated drawstring shorts.",
        price: { amount: 110, currency: "INR" },
        sizes: ["S", "M", "L", "XL"],
        category: "Shorts & Co-Ords",
        subCategory: "Co-Ord Sets",
        stock: 19,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },
      {
        title: "Resort Linen-Blend Drawstring Shorts",
        description: "Breathable 6.5-inch inseam tailored resort shorts with an elasticated waistband, braided ecru drawstring, and rear welt pocket.",
        price: { amount: 52, currency: "INR" },
        sizes: ["S", "M", "L", "XL"],
        category: "Shorts & Co-Ords",
        subCategory: "Shorts",
        stock: 34,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },

      // 7. Outerwear & Winterwear
      {
        title: "Mock-Neck Cable-Knit Pullover",
        description: "Heavyweight chunky cable-knit sweater made from Australian Merino wool blend. High mock-neck collar with ribbed trims for structured warmth.",
        price: { amount: 135, currency: "INR" },
        sizes: ["S", "M", "L", "XL"],
        category: "Outerwear & Winterwear",
        subCategory: "Layering Essentials",
        stock: 17,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },
      {
        title: "Minimalist Matte Zip Bomber Jacket",
        description: "Structured streetwear bomber jacket engineered with a weather-resistant matte nylon shell, two-way silver YKK zipper, and quilted thermal lining.",
        price: { amount: 160, currency: "INR" },
        sizes: ["M", "L", "XL", "XXL"],
        category: "Outerwear & Winterwear",
        subCategory: "Layering Essentials",
        stock: 14,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },

      // 8. Footwear (Shoes)
      {
        title: "Minimalist Italian Leather Low-Tops",
        description: "Handcrafted low-top luxury sneakers in full-grain Italian white leather. Margom rubber cupsole, calfskin lining, and subtle debossed numbering.",
        price: { amount: 180, currency: "INR" },
        sizes: ["M", "L", "XL"],
        category: "Footwear (Shoes)",
        subCategory: "Sneakers & Casuals",
        stock: 20,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },
      {
        title: "Matte Suede Chelsea Ankle Boot",
        description: "Refined ankle chelsea boots in oiled storm grey suede. Features Goodyear welted crepe sole, elasticated tonal gussets, and woven pull tabs.",
        price: { amount: 195, currency: "INR" },
        sizes: ["M", "L", "XL"],
        category: "Footwear (Shoes)",
        subCategory: "Smart Footwear",
        stock: 12,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },

      // 9. Accessories & Fragrances
      {
        title: "Solid Stainless Steel Cuban Chain (8mm)",
        description: "High-grade 316L hypoallergenic surgical steel Cuban link chain with a brushed gunmetal finish and secure bespoke box clasp.",
        price: { amount: 45, currency: "INR" },
        sizes: ["M"],
        category: "Accessories & Fragrances (High-Margin Add-ons)",
        subCategory: "Jewellery & Accessories",
        stock: 45,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },
      {
        title: "Signature EDP: Cedar & Smoked Amber (100ml)",
        description: "Eau de Parfum with 22% concentrated fragrance oil. Opening with sparkling bergamot and pink pepper, deepening into cedarwood, dark amber, and Haitian vetiver.",
        price: { amount: 88, currency: "INR" },
        sizes: ["M"],
        category: "Accessories & Fragrances (High-Margin Add-ons)",
        subCategory: "Grooming",
        stock: 30,
        seller: seller._id,
        images: [
          "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
        ],
        isUnlisted: false,
      },
    ];

    // Give each product sizes with availability status (sizeStock)
    const enrichedProducts = products.map((p) => {
      const sizeStock = (p.sizes || ["M"]).map((sz, idx) => ({
        size: sz,
        stock: idx === p.sizes.length - 1 && p.sizes.length > 2 ? 0 : Math.floor(p.stock / p.sizes.length) + 2,
      }));
      return {
        ...p,
        sizeStock,
      };
    });

    await productModel.insertMany(enrichedProducts);
    console.log(`Seeded ${enrichedProducts.length} diverse products across all 9 luxury categories!`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();
