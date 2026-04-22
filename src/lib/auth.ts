import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { getGitHubCredentials } from "./env";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider(getGitHubCredentials()),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.githubId = (profile as { id?: number }).id?.toString();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id =
          (token.githubId as string) ?? token.sub;
      }
      return session;
    },
  },
};
