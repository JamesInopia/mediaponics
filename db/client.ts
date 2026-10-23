import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const queryClient = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(queryClient, { schema });

export function createIngestDb() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL is not set (see .env.example)");
  const client = postgres(url, { max: 1 });
  return { db: drizzle(client, { schema }), close: () => client.end() };
}

export type IngestDb = ReturnType<typeof createIngestDb>["db"];
