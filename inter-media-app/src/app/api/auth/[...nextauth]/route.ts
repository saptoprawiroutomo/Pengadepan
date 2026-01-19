import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyPassword } from '@/lib/utils-server';

const authOptions = {
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
      console.log('Redirect callback - url:', url, 'baseUrl:', baseUrl);
      // Force redirect to current domain
      const currentDomain = process.env.NEXTAUTH_URL || baseUrl;
      
      // Redirect setelah logout ke home
      if (url.includes('/api/auth/signout') || url.includes('callbackUrl')) {
        return currentDomain;
      }
      // Redirect setelah login
      if (url.startsWith('/')) return `${currentDomain}${url}`;
      return currentDomain;
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/',
  },
  session: {
    strategy: 'jwt' as const,
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
