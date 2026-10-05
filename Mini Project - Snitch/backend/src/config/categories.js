export const PRODUCT_CATEGORIES = [
  {
    id: "shirts",
    name: "Shirts (Topwear)",
    slug: "shirts-topwear",
    subCategories: [
      {
        id: "casual-resort",
        name: "Casual & Resort Wear",
        description: "Box-fit Cuban collar, cotton-linen vertical stripes, open-knit / crochet, crinkled seersucker shirts",
      },
      {
        id: "smart-party",
        name: "Smart Casual & Party Wear",
        description: "Slim-fit cotton satin, hand-embroidered motif, jacquard weave button-downs, mandarin collar shirts",
      },
      {
        id: "streetwear-layering",
        name: "Streetwear & Layering",
        description: "Heavy canvas denim overshirts (shackets), flannel check overshirts with drop shoulders",
      },
    ],
  },
  {
    id: "tshirts-polos",
    name: "T-Shirts & Polos",
    slug: "tshirts-polos",
    subCategories: [
      {
        id: "oversized-graphic",
        name: "Oversized & Graphic Tees",
        description: "Heavyweight 240+ GSM drop-shoulder boxy tees, vintage/acid-wash typography, raglan-sleeve, raw-edge tees",
      },
      {
        id: "polos",
        name: "Polos",
        description: "Flat-knit textured polos (retro collar), zipper-neck structured knits, performance stitchless polos, striped open-weave polo sweaters",
      },
    ],
  },
  {
    id: "jeans",
    name: "Jeans (Bottomwear)",
    slug: "jeans-bottomwear",
    subCategories: [
      {
        id: "trending-relaxed",
        name: "Trending Relaxed Fits",
        description: "Wide-leg baggy denim, straight-fit stretch, washed bootcut/flared, carpenter utility loop denim, distressed skater jeans",
      },
    ],
  },
  {
    id: "trousers-chinos",
    name: "Trousers, Chinos & Pants",
    slug: "trousers-chinos-pants",
    subCategories: [
      {
        id: "modern-tailored",
        name: "Modern & Tailored",
        description: "Korean wide-leg pleated trousers, Gurkha crossover double-buckle trousers, stretch slim-fit chinos, relaxed linen-blend trousers",
      },
    ],
  },
  {
    id: "cargos-joggers",
    name: "Cargos & Joggers",
    slug: "cargos-joggers",
    subCategories: [
      {
        id: "street-utility",
        name: "Street Utility",
        description: "6 & 8-pocket heavy-twill cargos, technical parachute nylon cargos with drawstrings, baggy denim cargos, stretch cargo joggers, corduroy relaxed cargos",
      },
    ],
  },
  {
    id: "shorts-coords",
    name: "Shorts & Co-Ords",
    slug: "shorts-coords",
    subCategories: [
      {
        id: "shorts",
        name: "Shorts",
        description: "100% cotton relaxed-fit shorts, pull-up cargo utility denim shorts, resort linen-blend drawstring shorts, textured waffle/crochet lounge shorts",
      },
      {
        id: "coord-sets",
        name: "Co-Ord Sets",
        description: "Matching printed resort shirt + shorts sets, textured monochrome knit top + bottom lounge sets",
      },
    ],
  },
  {
    id: "outerwear-winterwear",
    name: "Outerwear & Winterwear",
    slug: "outerwear-winterwear",
    subCategories: [
      {
        id: "layering-essentials",
        name: "Layering Essentials",
        description: "Mock-neck & turtleneck cable-knit sweaters, textured jacquard pullovers, relaxed-fit zip-up bombers, boxy varsity & fleece track jackets",
      },
    ],
  },
  {
    id: "footwear",
    name: "Footwear (Shoes)",
    slug: "footwear-shoes",
    subCategories: [
      {
        id: "sneakers-casuals",
        name: "Sneakers & Casuals",
        description: "Chunky retro low-top street sneakers, minimalist clean white leather low-tops, canvas skate shoes, sneaker mules / slip-on slide shoes",
      },
      {
        id: "smart-footwear",
        name: "Smart Footwear",
        description: "Suede and textured synthetic leather loafers (penny & tassel), Chelsea ankle boots (matte suede & faux leather)",
      },
    ],
  },
  {
    id: "accessories-fragrances",
    name: "Accessories & Fragrances (High-Margin Add-ons)",
    slug: "accessories-fragrances",
    subCategories: [
      {
        id: "jewellery-accessories",
        name: "Jewellery & Accessories",
        description: "Stainless steel Cuban, box, and link chains, braided leather cuffs & multi-layer bracelets, retro tinted sunglasses, minimalist canvas & PU crossbody sling bags",
      },
      {
        id: "grooming",
        name: "Grooming",
        description: "Signature Eau de Parfum (EDP) perfumes (woody, amber, fresh citrus notes)",
      },
    ],
  },
];

export const CATEGORY_NAMES = PRODUCT_CATEGORIES.map((c) => c.name);
