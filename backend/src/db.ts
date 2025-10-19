import { PrismaClient } from '@prisma/client';

// Exporta uma instância única do Prisma Client para ser usada em toda a aplicação.
// Esta é uma boa prática para evitar criar múltiplas conexões com a base de dados.
export const prisma = new PrismaClient();
