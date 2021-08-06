import { NextApiHandler } from 'next';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { env } from 'process';
// import Adapters from 'next-auth/adapters';
import prisma from '../../../lib/prisma';

let userAccount = null;

// const prisma = new PrismaClient();

const options = {
    cookie: {
        secure: process.env.NODE_ENV && process.env.NODE_ENV === 'production',
    },
    session: {
        jwt: true,
        maxAge: 30 * 24 * 60 * 60
    },
    providers: [
        Providers.Credentials({
            name: "Login",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                passw: { label: "Password", type: "password"},
              },
            async authorize(credentials) {
                try {
                    const user = await prisma.user.findFirst({
                        where: {
                            name: credentials.username,
                        }
                    });
    
                    if (user !== null && credentials.passw === process.env.NEXTAUTH_PASSWORD)
                    {
                        userAccount = user;
                        return user;
                    }
                    else {
                        return null;
                    }
                } catch (e) {
                    const errorMessage = e.response.data.message
                    throw new Error(errorMessage + '&username=' + credentials.username)
                }
            }
        })
    ],
    // adapter: Adapters.Prisma.Adapter({prisma}),
    callbacks: {
        // async signIn(user, account, profile) {
        //     if (typeof user.userId !== typeof undefined)
        //     {
        //         if (user.isActive === '1')
        //         {
        //             return user;
        //         }
        //         else
        //         {
        //             return false;
        //         }
        //     }
        //     else
        //     {
        //         return false;
        //     }
        // },
        async session(session, token) {
            if (userAccount !== null)
            {
                session.user = userAccount;
            }
            else if (typeof token.user !== typeof undefined && (typeof session.user === typeof undefined 
                || (typeof session.user !== typeof undefined && typeof session.user.userId === typeof undefined)))
            {
                session.user = token.user;
            }
            else if (typeof token !== typeof undefined)
            {
                session.token = token;
            }
            return session;
        },
        async jwt(token, user) {
            if (typeof user !== typeof undefined)
            {
                token.user = user;
            }
            return token;
        }
    },
    pages: {
        error: '/' // Changing the error redirect page to our custom login page
      }
}
// export default (req, res) => NextAuth(req, res, configuration)

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;

// const options = {
//     providers: [
//         Providers.GitHub({
//             clientId: process.env.GITHUB_ID,
//             clientSecret: process.env.GITHUB_SECRET,
//         }),
//     ],
//     adapter: Adapters.Prisma.Adapter({prisma}),
//     secret: process.env.SECRET,
// };