import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { randomUUID } from "crypto";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log({user, account, profile, email, credentials});
      if (!user.email?.endsWith("@portpro.io")) {
        console.log("Not a portpro.io email");
        return false;
      }
      return true;
    },
    async session({ session, token }) {
      // Optionally add custom session fields here
      // @ts-ignore
      session.user.sessionId = randomUUID();
      return session;
    },
    async jwt({ token, user }) {
      return token;
    },
  },
});

export { handler as GET, handler as POST };
