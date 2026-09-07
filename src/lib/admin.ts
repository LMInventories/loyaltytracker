import { auth } from "@/lib/auth";

export async function requireBusinessAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "BUSINESS_ADMIN" || !session.user.businessId) {
    return null;
  }
  return { businessId: session.user.businessId, userId: session.user.id };
}
