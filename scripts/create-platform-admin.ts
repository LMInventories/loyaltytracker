import { createInterface } from "node:readline/promises";
import { randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (question: string) => rl.question(question);

  console.log("Create a platform admin login (access to /platform, can onboard businesses).\n");

  const email = await ask("Platform admin email: ");
  let password = await ask("Password [leave blank to auto-generate]: ");
  const generated = !password.trim();
  if (generated) {
    password = randomBytes(9).toString("base64url");
  }

  rl.close();

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    console.error(`\nA user with email "${email}" already exists. Aborting.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "PLATFORM_ADMIN",
    },
  });

  console.log(`\nCreated platform admin login: ${email}`);
  if (generated) {
    console.log(`Generated password: ${password}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
