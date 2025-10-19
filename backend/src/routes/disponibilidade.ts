// FILE: backend/src/routes/disponibilidade.ts
import { Elysia, t } from 'elysia';
import { prisma } from '../db';
import { auth } from '../auth';

export const disponibilidadeRoutes = new Elysia({ prefix: '/api/agenda' })
  .use(auth)
  .get(
    '/',
    async ({ jwt, set }) => {
      const user = await jwt.verify();
      if (!user || user.role !== 'prestador') {
        set.status = 401;
        return { error: 'Não autorizado' };
      }
      
      return prisma.disponibilidade.findMany({
        where: { prestadorId: user.sub as string },
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
  )
  .post(
    '/',
    async ({ jwt, body, set }) => {
      const user = await jwt.verify();
      if (!user || user.role !== 'prestador') {
        set.status = 401;
        return { error: 'Não autorizado' };
      }

      const prestadorId = user.sub as string;
      await prisma.disponibilidade.deleteMany({ where: { prestadorId } });
      
      const novasDisponibilidades = await prisma.disponibilidade.createMany({
        data: body.agenda.map((item: any) => ({ ...item, prestadorId })),
      });
      
      return { success: true, count: novasDisponibilidades.count };
    },
    {
      body: t.Object({
        agenda: t.Array(
          t.Object({
            diaSemana: t.Numeric(),
            horaInicio: t.String(),
            horaFim: t.String(),
          })
        ),
      }),
      beforeHandle: async ({ jwt, set }) => {
        const user = await jwt.verify();
        if (!user) {
          set.status = 401;
          return { error: 'Token inválido' };
        }
      },
    }
  );

