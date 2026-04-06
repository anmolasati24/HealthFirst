import NextAuth, { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {

  interface User {
    id: string;
    firstName: string;
    lastName?: string;
    image?: string;
    age?: number;
    email: string;
  }

  interface Session {
    user: {
      id: string;
      firstName?: string;
      lastName?: string;
      image?: string;
      age?: number;
      email: string;
      gender?: string;
      allergies?: string[];
      diseases?: string[];
    } & DefaultSession["user"];

    url?: {
      previousUrl?: string;
    };
  }

  interface JWT extends DefaultJWT {
    id?: string;
    firstName?: string;
    lastName?: string;
    age?: number;
    gender?: string;
    allergies?: string[];
    diseases?: string[];
  }
}
