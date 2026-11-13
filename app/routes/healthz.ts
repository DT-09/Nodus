import { prisma } from "../db.server";

export async function loader() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json(
      { status: "ok", service: "nodus" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "unavailable", service: "nodus" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
