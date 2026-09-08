import { auth } from "@/lib/auth";

export async function requireBusinessAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "BUSINESS_ADMIN" || !session.user.businessId) {
    return null;
  }
  return { businessId: session.user.businessId, userId: session.user.id };
}

export async function requirePlatformAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PLATFORM_ADMIN") {
    return null;
  }
  return { userId: session.user.id };
}
