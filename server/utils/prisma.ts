import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `var` declarations
  var prismadb: PrismaClient | undefined;
}

const prisma = global.prismadb || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prismadb = prisma;
}

export default prisma;
