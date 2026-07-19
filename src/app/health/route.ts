// Liveness probe for the ALB target group. Dependency-free so a DB blip can't
// fail the health check and make ECS kill an otherwise-serving task.
export const dynamic = "force-dynamic";

export function GET() {
  return new Response("ok", {
    status: 200,
    headers: { "content-type": "text/plain", "cache-control": "no-store" },
  });
}
