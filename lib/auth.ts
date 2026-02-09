import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { sql } from './db';
import * as speakeasy from 'speakeasy';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const users = await sql`
            SELECT * FROM users WHERE email = ${credentials.email}
          `;

          if (users.length === 0) {
            return null;
          }

          const user = users[0];
          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          // If MFA is enabled, require MFA token
          if (user.mfa_enabled && user.mfa_secret) {
            const mfaToken = req?.body?.mfaToken;
            if (!mfaToken) {
              // Return user with mfaRequired flag
              return {
                id: user.id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                organizationId: user.organization_id,
                mfaRequired: true,
              };
            }

            // Verify MFA token
            const verified = speakeasy.totp.verify({
              secret: user.mfa_secret,
              encoding: 'base32',
              token: mfaToken,
              window: 2
            });

            if (!verified) {
              return null;
            }
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organization_id,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as number;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

declare module 'next-auth' {
  interface User {
    role: string;
    organizationId: number;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      organizationId: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    organizationId: number;
  }
}
