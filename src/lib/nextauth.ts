import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { sha256 } from "./crypto";
import Credentials from "next-auth/providers/credentials";
import { Prisma } from "./prisma";

export const handler = NextAuth({
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const bearerSecret: string | undefined = process.env.BEARER_SECRET;

        if (!bearerSecret) {
          throw new Error("BEARER_SECRET is not defined");
        }

        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }

        // Get the user from the database
        const user = await Prisma.getUserByEmail(credentials.email);
        if (!user) {
          return null;
        }

        // Check the password
        const hashedProvidedPassword = await sha256(credentials.password);
        if (hashedProvidedPassword !== user.password) {
          return null;
        }

        // Return the user
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          secret: user.secret,
          permissions: user.permissions,
        };
      },
    }),
  ],

  callbacks: {
    async session({ session }) {
      const bearerSecret: string | undefined = process.env.BEARER_SECRET;

      if (!bearerSecret) {
        throw new Error("BEARER_SECRET is not defined");
      }

      if (!session) {
        throw new Error("Session is not defined");
      }

      if (!session.user) {
        throw new Error("User is not defined");
      }

      const email: string | null = session.user.email;
      const name: string | null = session.user.name;
      const image: string = session.user.image || "/images/default-pfp.png";
      const secret: string | null = email
        ? await sha256(email + bearerSecret)
        : null;

      // Verify the user is updated in the database
      if (secret && email && name) {
        const res = await import("@/app/api/users/route");
        const response = await res.POST({
          // @ts-ignore
          headers: {},
          json: async () => ({
            name,
            email,
            image,
          }),
        });

        if (response.ok) {
          const json = await response.json();

          session.user.name = json.user.name;
          session.user.image = json.user.image;
          session.user.id = json.user.id;
          session.user.permissions = json.user.permissions;
        }
      }

      return session;
    },
  },
});
