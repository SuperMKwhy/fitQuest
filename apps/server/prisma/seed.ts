import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mirrors the item grid in design/Shop.html. Placeholder catalog until real
// shop art exists — see todo.md.
const SHOP_ITEMS = [
  { name: 'Basic Tee', category: 'shirt', priceCoins: 0, priceGems: null, iconKey: 'checkroom' },
  { name: 'Crimson Tee', category: 'shirt', priceCoins: 500, priceGems: null, iconKey: 'checkroom' },
  { name: 'Mint Hoodie', category: 'shirt', priceCoins: 800, priceGems: null, iconKey: 'checkroom' },
  { name: 'Gold Armor', category: 'shirt', priceCoins: null, priceGems: 50, iconKey: 'checkroom' },
  { name: 'Striped Shirt', category: 'shirt', priceCoins: 400, priceGems: null, iconKey: 'checkroom' },
  { name: 'Tank Top', category: 'shirt', priceCoins: 300, priceGems: null, iconKey: 'checkroom' },
];

async function main() {
  for (const item of SHOP_ITEMS) {
    await prisma.shopItem.upsert({
      where: { id: item.name },
      update: item,
      create: { id: item.name, ...item },
    });
  }
  console.log(`Seeded ${SHOP_ITEMS.length} shop items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
