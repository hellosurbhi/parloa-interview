import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { ApiError } from "./errors";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
  }
  return session.user;
}
