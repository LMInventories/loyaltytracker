import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPasswordHash = await bcrypt.hash("password123", 12);
  const customerPasswordHash = await bcrypt.hash("password123", 12);

  const cafe = await prisma.business.upsert({
    where: { slug: "corner-cafe" },
    update: {},
    create: {
      slug: "corner-cafe",
      name: "Corner Cafe",
      description: "Independent coffee shop on the high street.",
      category: "Cafe",
      address: "12 High Street, Anytown",
      admins: {
        create: {
          email: "admin@cornercafe.test",
          passwordHash: adminPasswordHash,
          name: "Corner Cafe Admin",
          role: "BUSINESS_ADMIN",
        },
      },
      schemes: {
        create: [
          {
            name: "Coffee Stamps",
            type: "STAMPS",
            stampsRequired: 10,
            stampRewardText: "One free coffee",
          },
        ],
      },
      offers: {
        create: [
          {
            title: "20% off pastries this week",
            description: "Valid on all baked goods until Sunday.",
          },
        ],
      },
    },
  });

  const barber = await prisma.business.upsert({
    where: { slug: "high-street-barbers" },
    update: {},
    create: {
      slug: "high-street-barbers",
      name: "High Street Barbers",
      description: "Traditional barbershop, walk-ins welcome.",
      category: "Barber",
      address: "45 High Street, Anytown",
      admins: {
        create: {
          email: "admin@highstreetbarbers.test",
          passwordHash: adminPasswordHash,
          name: "High Street Barbers Admin",
          role: "BUSINESS_ADMIN",
        },
      },
      schemes: {
        create: [
          {
            name: "Haircut Points",
            type: "POINTS",
            pointsPerScan: 10,
            rewardTiers: {
              create: [
                { threshold: 50, rewardText: "£5 off your next cut", sortOrder: 0 },
                { threshold: 100, rewardText: "One free haircut", sortOrder: 1 },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@example.test" },
    update: {},
    create: {
      email: "customer@example.test",
      passwordHash: customerPasswordHash,
      name: "Test Customer",
      role: "CUSTOMER",
    },
  });

  console.log("Seeded businesses:", cafe.name, "/", barber.name);
  console.log("Admin logins (password: password123):");
  console.log("  admin@cornercafe.test");
  console.log("  admin@highstreetbarbers.test");
  console.log("Customer login (password: password123): customer@example.test");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
