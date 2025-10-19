// FILE: backend/src/routes/painelPrestador.ts
import { Elysia } from 'elysia';
import { prisma } from '../db';
import { auth } from '../auth';

export const painelPrestadorRoutes = new Elysia({ prefix: '/api/painel-prestador' })
  .use(auth)
  .get(
    '/contratacoes',
    async ({ jwt, set }) => {
      const user = await jwt.verify();
      if (!user || user.role !== 'prestador') {
        set.status = 401;
        return { error: 'Não autorizado' };
      }

      const prestadorId = user.sub as string;

      // Busca todas as contratações para os serviços deste prestador
      return prisma.contratacao.findMany({
        where: {
          variacao: {
            servico: {
              prestadorId: prestadorId,
            },
          },
        },
        include: {
          cliente: {
            select: { id: true, nome: true },
          },
          variacao: {
            include: {
              servico: {
                select: { id: true, nome: true },
              },
            },
          },
        },
        orderBy: {
          dataHoraInicio: 'desc',
        },
      });
    },
    {
      beforeHandle: async ({ jwt, set }) => {
        const user = await jwt.verify();
        if (!user) {
          set.status = 401;
          return { error: 'Token inválido' };
        }
      },
    }
  );

