import { defineConfig } from "drizzle-kit";

// Validate required environment variable
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required for PostgreSQL connection");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema-postgres.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
