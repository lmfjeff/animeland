// TODO use sst config if not local

// todo check whether this is fine
import "dotenv/config"

export const NODE_ENV = process.env.NODE_ENV

export const DATABASE_URL = process.env.DATABASE_URL!
export const DIRECT_URL = process.env.DIRECT_URL!

export const NEXTAUTH_URL = process.env.NEXTAUTH_URL!
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

export const NEXT_PUBLIC_DOTENV = process.env.NEXT_PUBLIC_DOTENV!

export const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID!
