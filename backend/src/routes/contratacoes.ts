// FILE: backend/src/routes/contratacoes.ts
import { Elysia, t } from 'elysia';
import { prisma } from '../db';
import { auth } from '../auth';

export const contratacoesRoutes = new Elysia({ prefix: '/api/contratacoes' })
  .use(auth)
  .post(
    '/',
    async ({ jwt, body, set }) => {
        const user = await jwt.verify();
        if (!user || user.role !== 'cliente') {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
        
        // Lógica de contratação...
        return { success: true };
    },
    {
        body: t.Object({
            variacaoId: t.String(),
            dataHoraInicio: t.String(),
        }),
        beforeHandle: async ({ jwt, set }) => {
            const user = await jwt.verify();
            if (!user) {
                set.status = 401;
                return { error: 'Token inválido' };
            }
        },
    }
  )
  .patch(
    '/:id/cancelar',
    async ({ jwt, params, set }) => {
        const user = await jwt.verify();
        if (!user || user.role !== 'prestador') {
            set.status = 401;
            return { error: 'Não autorizado' };
        }
        
        // Lógica de cancelamento...
        return { success: true };
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

