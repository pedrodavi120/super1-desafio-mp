// FILE: backend/src/routes/tiposServico.ts
import { Elysia, t } from 'elysia';
import { prisma } from '../db';

export const tiposServicoRoutes = new Elysia({ prefix: '/tipos-servico' })
  .get('/', async () => {
    return await prisma.tipoServico.findMany();
  })
  .post(
    '/',
    async ({ body }) => {
      const novoTipo = await prisma.tipoServico.create({
        data: {
          nome: body.nome,
        },
      });
      return novoTipo;
    },
    {
      body: t.Object({
        nome: t.String(),
      }),
    }
  );

