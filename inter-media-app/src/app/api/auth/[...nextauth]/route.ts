import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyPassword } from '@/lib/utils-server';

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('Login attempt:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email, isActive: true });
          
          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }

          console.log('User found:', user.email, 'Role:', user.role);
          
          const isValid = await verifyPassword(credentials.password, user.passwordHash);
          
          if (!isValid) {
            console.log('Invalid password for:', credentials.email);
            return null;
          }

          console.log('Login successful for:', user.email);
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      // Allow API routes to work normally
      if (url.startsWith('/api/')) {
        return url;
      }
      
      console.log('Redirect callback - url:', url, 'baseUrl:', baseUrl);
      
      // Always use the configured NEXTAUTH_URL
      const trustedDomain = process.env.NEXTAUTH_URL || baseUrl;
      
      // Handle logout
      if (url.includes('/api/auth/signout')) {
        return trustedDomain;
      }
      
      // Handle relative URLs
      if (url.startsWith('/')) {
        return `${trustedDomain}${url}`;
      }
      
      // Handle absolute URLs - only allow same domain
      try {
        const urlObj = new URL(url);
        const trustedObj = new URL(trustedDomain);
        if (urlObj.hostname === trustedObj.hostname) {
          return url;
        }
      } catch (e) {
        // Invalid URL, fallback to trusted domain
      }
      
      return trustedDomain;
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/',
  },
  session: {
    strategy: 'jwt' as const,
  },
  cookies: {
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false // Set to false for development
      }
    }
  },
  trustHost: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
