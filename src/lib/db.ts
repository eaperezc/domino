import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { parseDbUrl } from "@/lib/pg-url";

function makeClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is not set");
  const { connectionString, schema, ssl } = parseDbUrl(raw);
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString, ssl }, { schema }),
  });
}

type Client = ReturnType<typeof makeClient>;

const globalForDb = globalThis as unknown as { dominoDb?: Client };

function client(): Client {
  // Lazy: `next build` imports this module with no DATABASE_URL; the client
  // must only be constructed when a query actually runs. Cached on globalThis
  // so dev hot-reload reuses one connection pool.
  return (globalForDb.dominoDb ??= makeClient());
}

export const db: Client = new Proxy({} as Client, {
  get(_target, prop) {
    const value = Reflect.get(client(), prop);
    return typeof value === "function" ? value.bind(client()) : value;
  },
});
