import { defineConfig } from "drizzle-kit";

for (const file of [".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
  }
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DIRECT_URL! },
});
