
import { PrismaClient } from "../generated/prisma";

declare global {
    var PrismaClient: PrismaClient | undefined
}

export const database = new PrismaClient() || global.PrismaClient

if(process.env.NODE_ENV !== "production") globalThis.PrismaClient = database