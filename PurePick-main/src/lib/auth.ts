import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { saveNewUser } from "@/lib/save-to-db/save-user";
import User from "@/models/user-model";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db-connect";

export const authOptions: any = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID_2 as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_2 as string,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          firstName: profile.given_name,
          lastName: profile.family_name || "",
          email: profile.email,
          image: profile.picture,
        };
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        firstName: { label: "First Name", type: "text" },
        lastName: { label: "Last Name", type: "text" },
        age: { label: "Age", type: "number" },
        gender: { label: "Gender", type: "text" },
        otp: { label: "OTP", type: "text" },
        type: { label: "Type", type: "text" },
      },
      async authorize(credentials) {
        const { email, password, firstName, lastName, age, gender, otp, type } = credentials as any;

        if (!email || !password) throw new Error("Missing required fields.");

        await connectDB();
        const existingUser = await User.findOne({ email });

        if (existingUser && existingUser.authType === 'Google') {
          throw new Error("Incorrect authentication method. Please sign in with Google.");
        }

        if (type === 'login') {
          if (existingUser && bcrypt.compareSync(password, existingUser.password)) {
            return existingUser;
          } else {
            throw new Error("Invalid credentials.");
          }
        } else if (type === 'signup') {
          if (existingUser) throw new Error("User already exists.");
          if (!firstName || !lastName || !age || !gender || !otp) {
            throw new Error("Missing required fields.");
          }
          const newUser = await saveNewUser({
            email, password, firstName,
            lastName, age: Number(age), gender,
            authType: 'Credentials',
          });
          return newUser;
        } else {
          throw new Error("Invalid type.");
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account.provider === "google") {
        await connectDB();
        let existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          existingUser = await User.create({
            firstName: user.firstName || user.name?.split(" ")[0] || "User",
            lastName: user.lastName || user.name?.split(" ")[1] || "",
            email: user.email,
            authType: "Google",
            googleId: user.id,
            // ✅ gender and age intentionally omitted — optional for Google users
          });
        }
        user.id = existingUser._id.toString();
      }
      return true;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.age = user.age;
        token.gender = user.gender;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.age = token.age;
        session.user.gender = token.gender;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
};