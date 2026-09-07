import { createInterface } from "node:readline/promises";
import { randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (question: string) => rl.question(question);

  console.log("Onboard a new business — creates the business and its first admin login.\n");

  const name = await ask("Business name: ");
  const suggestedSlug = slugify(name);
  const slugInput = await ask(`Page URL slug [${suggestedSlug}]: `);
  const slug = slugInput.trim() ? slugify(slugInput) : suggestedSlug;
  const category = await ask("Category (e.g. Cafe, Barber) [optional]: ");
  const address = await ask("Address [optional]: ");
  const adminEmail = await ask("Admin email: ");

  let adminPassword = await ask("Admin password [leave blank to auto-generate]: ");
  const generated = !adminPassword.trim();
  if (generated) {
    adminPassword = randomBytes(9).toString("base64url");
  }

  rl.close();

  const existingSlug = await prisma.business.findUnique({ where: { slug } });
  if (existingSlug) {
    console.error(`\nA business with slug "${slug}" already exists. Aborting.`);
    process.exit(1);
  }
  const existingEmail = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingEmail) {
    console.error(`\nA user with email "${adminEmail}" already exists. Aborting.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const business = await prisma.business.create({
    data: {
      name,
      slug,
      category: category.trim() || null,
      address: address.trim() || null,
      admins: {
        create: {
          email: adminEmail,
          passwordHash,
          role: "BUSINESS_ADMIN",
        },
      },
    },
  });

  console.log(`\nCreated "${business.name}" at /businesses/${business.slug}`);
  console.log(`Admin login: ${adminEmail}`);
  if (generated) {
    console.log(`Generated password: ${adminPassword}`);
    console.log("Share this with the business and have them change it later.");
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
