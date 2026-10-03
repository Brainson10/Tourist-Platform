/**
 * "Take Home a Memory" starter content: well-known crafts and foods of the Northeast,
 * tied to the seeded destinations. Prices and places are approximate, so every souvenir
 * is flagged `needsVerification` and no seller is marked verified. No photos are seeded —
 * real product photos should be added by an admin (cards show a woven fallback meanwhile).
 *
 * Safe to re-run: existing categories, sellers and souvenirs (matched by slug, or by name
 * for categories) are never changed, and links are only made to destinations that exist.
 */

export const CATEGORIES = [
  { name: "Handicrafts", slug: "handicrafts", icon: "craft", description: "Pottery, bamboo, cane and wood made by hand." },
  { name: "Textiles", slug: "textiles", icon: "textile", description: "Handloom weaves, shawls and silks." },
  { name: "Clothing", slug: "clothing", icon: "clothing", description: "Traditional and contemporary wear." },
  { name: "Jewelry", slug: "jewelry", icon: "jewelry", description: "Beadwork and traditional ornaments." },
  { name: "Food", slug: "food", icon: "food", description: "Teas, spices, pickles and local flavours that travel well." },
  { name: "Art", slug: "art", icon: "art", description: "Paintings, paper and prints." },
  { name: "Home Decor", slug: "home-decor", icon: "home", description: "Pieces for your home." },
  { name: "Gifts", slug: "gifts", icon: "gift", description: "Small, easy-to-carry gifts." },
  { name: "Traditional Products", slug: "traditional-products", icon: "heritage", description: "Objects with a ceremonial or everyday traditional use." },
  { name: "Other", slug: "other", icon: "other", description: "Everything else worth taking home." },
];

const APPROXIMATE = "Location and details are approximate — check before visiting.";

export const SELLERS = [
  {
    slug: "ima-keithel-imphal",
    name: "Ima Keithel (Mothers' Market)",
    kind: "MARKET",
    address: "Khwairamband Bazar, Imphal, Manipur",
    latitude: 24.8076,
    longitude: 93.9386,
    openingHours: "Daily, roughly morning to evening",
    description: `A centuries-old market run entirely by women traders, with sections for handloom textiles, crafts and local produce. ${APPROXIMATE}`,
  },
  {
    slug: "ukhrul-town-market",
    name: "Ukhrul town market",
    kind: "MARKET",
    address: "Ukhrul town, Manipur",
    latitude: 25.0969,
    longitude: 94.3617,
    description: `The district town nearest Shirui, with shops selling Tangkhul Naga crafts and pottery from nearby villages. ${APPROXIMATE}`,
  },
  {
    slug: "kohora-tourist-market",
    name: "Kohora tourist shops",
    kind: "SHOP",
    village: { name: "Kohora", state: "Assam" },
    address: "Near the Kohora (Central Range) entry, Kaziranga",
    latitude: 26.5775,
    longitude: 93.1705,
    description: `Roadside shops by the main safari gate selling Assam tea, gamosas and small crafts. ${APPROXIMATE}`,
  },
  {
    slug: "tawang-craft-centre",
    name: "Tawang craft centre",
    kind: "HANDICRAFT_CENTER",
    village: { name: "Tawang Town", state: "Arunachal Pradesh" },
    address: "Tawang town, Arunachal Pradesh",
    latitude: 27.587,
    longitude: 91.863,
    description: `Workshops and a sales counter for Monpa carpets, weaving, woodwork and handmade paper. ${APPROXIMATE}`,
  },
  {
    slug: "iewduh-bara-bazar-shillong",
    name: "Iewduh (Bara Bazar)",
    kind: "MARKET",
    address: "Iewduh, Shillong, Meghalaya",
    latitude: 25.5795,
    longitude: 91.8791,
    openingHours: "Busiest on the traditional market day",
    description: `Shillong's old Khasi market, a maze of stalls for spices, turmeric, bamboo and cane work. ${APPROXIMATE}`,
  },
  {
    slug: "mao-market-kohima",
    name: "Mao Market",
    kind: "MARKET",
    address: "Kohima, Nagaland",
    latitude: 25.669,
    longitude: 94.106,
    description: `Kohima's central market for local produce, dried chillies and Naga textiles. ${APPROXIMATE}`,
  },
];

export const SOUVENIRS = [
  {
    slug: "longpi-black-pottery",
    name: "Longpi black pottery",
    category: "handicrafts",
    destinations: ["shirui-hills"],
    sellers: [
      { slug: "ukhrul-town-market", note: "Ask for pieces made in the Longpi (Nungbi) villages" },
      { slug: "ima-keithel-imphal" },
    ],
    shortDescription: "Stone-grey cookware and serving pots shaped by hand, without a wheel, by Tangkhul Naga potters.",
    description:
      "Longpi pottery comes from the Longpi (Nungbi) villages of Ukhrul district. Potters grind a local black stone and mix it with clay, shape each piece by hand and with moulds, then fire it and polish it with leaves for its distinctive dark finish.\n\nYou'll find cooking pots, kettles, bowls and serving dishes, often with cane handles.",
    whySpecial: "It is made the way Tangkhul Naga families have made it for generations — no potter's wheel, local stone and clay, and a leaf-polished finish. Each piece is slightly different.",
    whyTakeHome: "It is beautiful on a table and genuinely useful in the kitchen, so the memory of Ukhrul becomes part of everyday meals.",
    authenticityTips: "Look for a matte, stone-like dark grey surface with small hand-made irregularities. Ask where it was made — sellers usually know the village.",
    carryTips: "Heavy and can chip. Wrap pieces in clothes and carry them in your hand luggage if you can.",
    priceMin: 500,
    priceMax: 3000,
    audiences: ["FAMILY", "PARENTS", "COLLECTORS"],
    interests: ["CRAFTS", "HOME_DECOR", "CULTURE"],
    qualities: ["HANDMADE", "TRADITIONAL", "ARTISAN_MADE", "REGIONAL_SPECIALTY"],
    isFeatured: true,
  },
  {
    slug: "moirang-phee",
    name: "Moirang Phee",
    category: "textiles",
    destinations: ["loktak-lake"],
    sellers: [{ slug: "ima-keithel-imphal", note: "Ask in the handloom section" }],
    shortDescription: "Manipuri handloom cloth with a border of temple-like triangles, named after Moirang on Loktak's shore.",
    description:
      "Moirang Phee is a traditional Manipuri weave recognised by its rows of stepped triangles along the border, a motif often described as temple spires. It is woven as shawls, stoles and wraps.\n\nMoirang is the lakeside town on the edge of Loktak, so it's a fitting memory of a visit to the lake.",
    whySpecial: "The border pattern is tied to Moirang's heritage and its old tales, and it is still worn at ceremonies and festivals in Manipur.",
    whyTakeHome: "A light, foldable piece of Manipur's weaving tradition that you'll actually wear.",
    authenticityTips: "Handwoven pieces show tiny variations in the motif; very cheap, perfectly uniform prints of the pattern are usually machine-made.",
    carryTips: "Light and packs flat.",
    priceMin: 800,
    priceMax: 3000,
    audiences: ["FAMILY", "PARTNER", "PARENTS"],
    interests: ["FASHION", "CULTURE"],
    qualities: ["HANDMADE", "TRADITIONAL", "REGIONAL_SPECIALTY"],
  },
  {
    slug: "assamese-gamosa",
    name: "Assamese gamosa",
    category: "gifts",
    destinations: ["kaziranga"],
    sellers: [{ slug: "kohora-tourist-market" }],
    shortDescription: "The white cotton cloth with red woven borders that Assam offers to honour a guest.",
    description:
      "The gamosa is a rectangle of white cotton with red borders and woven motifs. In Assam it is offered to guests and elders as a mark of respect, draped at Bihu, and used every day.\n\nThe woven border that runs along the top of this site is inspired by it.",
    whySpecial: "Few objects say “Assam” as clearly. Receiving one is an honour, and giving one carries that meaning with it.",
    whyTakeHome: "Light, inexpensive and full of meaning — an ideal gift for several people at once.",
    authenticityTips: "Handwoven gamosas have softer cotton and slightly uneven motifs; powerloom ones are cheaper and perfectly regular. Both are genuine gifts.",
    carryTips: "Very light — buy a few.",
    priceMin: 150,
    priceMax: 800,
    audiences: ["FRIENDS", "FAMILY", "PARENTS"],
    interests: ["CULTURE"],
    qualities: ["TRADITIONAL", "LOCALLY_MADE", "REGIONAL_SPECIALTY"],
    isFeatured: true,
  },
  {
    slug: "assam-orthodox-tea",
    name: "Assam orthodox tea",
    category: "food",
    destinations: ["kaziranga"],
    sellers: [{ slug: "kohora-tourist-market", note: "Ask to smell a few grades before you choose" }],
    shortDescription: "Malty, full-bodied loose-leaf tea from the gardens around the Brahmaputra valley.",
    description:
      "Tea gardens surround Kaziranga, and the region's orthodox (whole-leaf) teas are known for a bold, malty cup. Look for loose leaf rather than dust or CTC if you want something special.\n\nGrades and gardens vary a lot, so tasting before you buy is common.",
    whySpecial: "Assam's tea gardens shaped the landscape and the history of the region; the tea you drink here is grown a short drive away.",
    whyTakeHome: "Every cup back home brings back the morning mist over the grasslands.",
    authenticityTips: "Whole, twisted leaves with some golden tips suggest a better orthodox tea. Sealed packs from a named garden are easier to trust than loose sacks.",
    carryTips: "Light and keeps for months if sealed. Pack away from spices so it doesn't pick up smells.",
    priceMin: 200,
    priceMax: 1500,
    audiences: ["FAMILY", "FRIENDS", "PARENTS", "MYSELF"],
    interests: ["FOOD"],
    qualities: ["LOCALLY_MADE", "REGIONAL_SPECIALTY"],
    isFeatured: true,
  },
  {
    slug: "muga-silk",
    name: "Muga silk",
    category: "textiles",
    destinations: ["kaziranga"],
    sellers: [],
    shortDescription: "Assam's golden silk, with a natural sheen that is said to grow brighter with age.",
    description:
      "Muga silk comes from silkworms found in Assam, and its natural golden colour needs no dye. It is woven into the mekhela chador, stoles and saris.\n\nIt is one of the most prized textiles of the region, and priced accordingly.",
    whySpecial: "The golden thread is naturally that colour, and Muga has long been associated with Assamese heritage and celebration.",
    whyTakeHome: "An heirloom piece — something to keep for years, not a quick souvenir.",
    authenticityTips: "Real Muga is expensive. Very cheap “Muga” is often blended or dyed. Buy from government emporiums, cooperatives or weavers who can tell you where it was made.",
    carryTips: "Light, but keep it dry and folded in a cloth bag.",
    priceMin: 2500,
    priceMax: 30000,
    audiences: ["PARTNER", "PARENTS", "COLLECTORS"],
    interests: ["FASHION", "CULTURE"],
    qualities: ["HANDMADE", "TRADITIONAL", "REGIONAL_SPECIALTY"],
  },
  {
    slug: "monpa-handmade-paper",
    name: "Monpa handmade paper",
    category: "art",
    destinations: ["tawang"],
    sellers: [{ slug: "tawang-craft-centre" }],
    shortDescription: "Soft, fibrous paper made from tree bark by Monpa papermakers — once used for Buddhist scriptures.",
    description:
      "Monpa handmade paper (Mon Shugu) is made from the inner bark of a local shrub, soaked, pounded and spread on frames to dry. It has been used for monastery scriptures and prayer flags, and is now also made into notebooks, cards and lampshades.",
    whySpecial: "A centuries-old craft of the Monpa people that was close to disappearing and has been revived by local makers.",
    whyTakeHome: "Light, beautiful and unusual — a journal or card from Tawang is a memory few people have.",
    carryTips: "Very light. Keep it flat and dry.",
    priceMin: 100,
    priceMax: 800,
    audiences: ["FRIENDS", "MYSELF", "COLLECTORS"],
    interests: ["ART", "CRAFTS", "UNIQUE"],
    qualities: ["HANDMADE", "TRADITIONAL", "REGIONAL_SPECIALTY"],
  },
  {
    slug: "monpa-woven-bag",
    name: "Monpa woven bags & textiles",
    category: "textiles",
    destinations: ["tawang"],
    sellers: [{ slug: "tawang-craft-centre" }],
    shortDescription: "Bright, geometric weaves from Tawang, made into shoulder bags, belts and wraps.",
    description: "Monpa weavers around Tawang make colourful fabrics with bold geometric bands, used for bags, belts and traditional clothing. Small pieces are easy to carry home.",
    whySpecial: "The colours and patterns are part of how the Monpa dress and celebrate, especially around Losar and festivals at the monastery.",
    whyTakeHome: "Practical, cheerful and a clear reminder of the high Himalaya.",
    authenticityTips: "Ask whether a piece was woven locally — some shops also sell factory-made bags in similar colours.",
    carryTips: "Light and folds flat.",
    priceMin: 500,
    priceMax: 3000,
    audiences: ["FRIENDS", "MYSELF", "CHILDREN"],
    interests: ["FASHION", "CRAFTS"],
    qualities: ["HANDMADE", "TRADITIONAL"],
  },
  {
    slug: "lakadong-turmeric",
    name: "Lakadong turmeric",
    category: "food",
    destinations: ["shillong"],
    sellers: [{ slug: "iewduh-bara-bazar-shillong" }],
    shortDescription: "Deep-orange turmeric from Meghalaya's Jaintia Hills, prized for its strong colour and aroma.",
    description: "Lakadong turmeric is grown by farmers in the Lakadong area of the Jaintia Hills. It is known for its deep colour and is widely described as unusually rich in curcumin.",
    whySpecial: "It is a small-farm, hill-grown spice that has become one of Meghalaya's best-known products.",
    whyTakeHome: "Useful every day, light to carry, and a taste of Meghalaya in your kitchen.",
    authenticityTips: "Look for packs that name the growing area or a farmers' group. The colour should be a deep orange-yellow.",
    carryTips: "Keep powder sealed — a zip bag inside your luggage avoids yellow stains.",
    priceMin: 150,
    priceMax: 600,
    audiences: ["FAMILY", "PARENTS", "FRIENDS"],
    interests: ["FOOD"],
    qualities: ["LOCALLY_MADE", "REGIONAL_SPECIALTY"],
  },
  {
    slug: "khasi-bamboo-cane-craft",
    name: "Khasi bamboo & cane craft",
    category: "home-decor",
    destinations: ["shillong"],
    sellers: [{ slug: "iewduh-bara-bazar-shillong" }],
    shortDescription: "Baskets, trays and small boxes woven from bamboo and cane in the Khasi Hills.",
    description:
      "Bamboo and cane are part of daily life in the Khasi Hills, from the conical carrying basket (khoh) to trays, fish traps and stools. Smaller woven pieces make good souvenirs.\n\nMarkets in Shillong have whole lanes of it.",
    whySpecial: "These are everyday objects made with skills passed down in families, from materials grown in the hills.",
    whyTakeHome: "Natural, sustainable and useful at home — and each weave is a little different.",
    authenticityTips: "Check the weave is tight and the edges are finished; locally made pieces are often lighter than imported ones.",
    carryTips: "Light but bulky. Smaller trays and boxes nest inside a bag.",
    priceMin: 200,
    priceMax: 2500,
    audiences: ["FAMILY", "PARENTS", "MYSELF"],
    interests: ["CRAFTS", "HOME_DECOR"],
    qualities: ["HANDMADE", "TRADITIONAL", "ARTISAN_MADE"],
  },
  {
    slug: "naga-shawl",
    name: "Naga shawl",
    category: "textiles",
    destinations: ["dzukou-valley"],
    sellers: [{ slug: "mao-market-kohima", note: "Ask which community the pattern belongs to" }],
    shortDescription: "Bold, banded shawls whose colours and motifs identify the tribe — and sometimes the wearer's standing.",
    description:
      "Every Naga community has its own shawl designs, woven in wide bands of red, black and white with symbolic motifs. Some patterns were traditionally earned — by warriors or by families who hosted feasts of merit.\n\nKohima's markets, a short drive from the Dzukou trailhead, have the widest choice.",
    whySpecial: "A Naga shawl is identity woven in cloth: its pattern says who you are and where you are from.",
    whyTakeHome: "Warm, striking and meaningful — a keepsake that carries a story you can retell.",
    authenticityTips: "Ask the seller what the pattern means. Some designs are reserved for particular people, and a good seller will tell you what's respectful to wear.",
    carryTips: "Folds well, but thick handwoven shawls take space. Carry it on the flight — it's warm.",
    priceMin: 1500,
    priceMax: 8000,
    audiences: ["PARENTS", "PARTNER", "COLLECTORS"],
    interests: ["FASHION", "CULTURE"],
    qualities: ["HANDMADE", "TRADITIONAL", "REGIONAL_SPECIALTY"],
    isFeatured: true,
  },
  {
    slug: "naga-king-chilli",
    name: "Naga king chilli (raja mircha)",
    category: "food",
    destinations: ["dzukou-valley"],
    sellers: [{ slug: "mao-market-kohima" }],
    shortDescription: "One of the world's hottest chillies, sold dried, as flakes or in fiery local pickles.",
    description: "The king chilli is grown across Nagaland and features in many Naga dishes. Dried whole chillies, flakes and pickles are the easiest way to take it home.",
    whySpecial: "It is central to Naga cooking and famous far beyond the state for its heat and fruity aroma.",
    whyTakeHome: "A fun, fiery gift for anyone who loves food — use a very small amount.",
    carryTips: "Sealed jars and dry chillies travel well. Pickles and pastes may need to go in checked baggage.",
    availabilityNote: "Fresh chillies are seasonal; dried and pickled ones are available all year.",
    priceMin: 150,
    priceMax: 500,
    audiences: ["FRIENDS", "MYSELF"],
    interests: ["FOOD", "UNIQUE"],
    qualities: ["LOCALLY_MADE", "REGIONAL_SPECIALTY"],
  },
];

async function ensureCategory(prisma, category) {
  const existing = await prisma.souvenirCategory.findFirst({ where: { OR: [{ slug: category.slug }, { name: { equals: category.name, mode: "insensitive" } }] } });
  if (existing) return { record: existing, created: false };
  return { record: await prisma.souvenirCategory.create({ data: category }), created: true };
}

async function ensureSeller(prisma, { village, ...seller }) {
  const existing = await prisma.localSeller.findUnique({ where: { slug: seller.slug } });
  if (existing) return { record: existing, created: false };

  const villageRecord = village ? await prisma.village.findFirst({ where: { name: village.name, state: village.state }, select: { id: true } }) : null;
  return { record: await prisma.localSeller.create({ data: { ...seller, villageId: villageRecord?.id ?? null, isVerified: false } }), created: true };
}

/** Adds the starter souvenirs, categories and sellers that are missing. Returns counts. */
export async function seedSouvenirs(prisma, { log = console.log } = {}) {
  const counts = { categories: 0, sellers: 0, souvenirs: 0, skipped: 0 };
  const categories = new Map();
  const sellers = new Map();

  for (const category of CATEGORIES) {
    const { record, created } = await ensureCategory(prisma, category);
    categories.set(category.slug, record);
    if (created) counts.categories += 1;
  }

  for (const seller of SELLERS) {
    const { record, created } = await ensureSeller(prisma, seller);
    sellers.set(seller.slug, record);
    if (created) counts.sellers += 1;
  }

  for (const { category, destinations: destinationSlugs, sellers: sellerLinks, ...souvenir } of SOUVENIRS) {
    if (await prisma.souvenir.findUnique({ where: { slug: souvenir.slug }, select: { id: true } })) {
      counts.skipped += 1;
      continue;
    }

    const destinations = await prisma.destination.findMany({ where: { slug: { in: destinationSlugs } }, select: { id: true } });
    if (!destinations.length) {
      log(`  – ${souvenir.name}: skipped (destination ${destinationSlugs.join(", ")} not found)`);
      counts.skipped += 1;
      continue;
    }

    await prisma.souvenir.create({
      data: {
        ...souvenir,
        categoryId: categories.get(category).id,
        availability: souvenir.availability ?? "YEAR_ROUND",
        needsVerification: true,
        destinations: { create: destinations.map((destination) => ({ destinationId: destination.id })) },
        sellers: { create: sellerLinks.filter((link) => sellers.has(link.slug)).map((link) => ({ sellerId: sellers.get(link.slug).id, note: link.note ?? null })) },
      },
    });
    counts.souvenirs += 1;
  }

  log(`Souvenirs: +${counts.souvenirs} souvenirs, +${counts.categories} categories, +${counts.sellers} places to buy (${counts.skipped} already present or skipped).`);
  return counts;
}
