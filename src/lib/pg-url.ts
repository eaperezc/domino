/**
 * Split a Galleta DATABASE_URL into what the pg driver actually wants.
 * - `schema` param → PrismaPg option (pg ignores it)
 * - `sslmode=require|no-verify` → encrypted without CA verification (RDS certs
 *   aren't in the system trust store; this matches libpq's "require" semantics)
 */
export function parseDbUrl(raw: string): {
  connectionString: string;
  schema?: string;
  ssl?: { rejectUnauthorized: boolean };
} {
  const url = new URL(raw);
  const schema = url.searchParams.get("schema") ?? undefined;
  const sslmode = url.searchParams.get("sslmode");
  url.searchParams.delete("schema");
  url.searchParams.delete("sslmode");
  return {
    connectionString: url.toString(),
    schema,
    ssl:
      sslmode && sslmode !== "disable" ? { rejectUnauthorized: false } : undefined,
  };
}
