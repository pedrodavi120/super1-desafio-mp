// FILE: backend/src/routes/avaliacoes.ts
import { Elysia, t } from 'elysia';
import { prisma } from '../db';
import { auth } from '../auth';

export const avaliacoesRoutes = new Elysia({ prefix: '/api/avaliacoes' })
  .use(auth)
  .post(
    '/',
    async ({ jwt, body, set }) => {
      const user = await jwt.verify();
      if (!user || user.role !== 'cliente') {
        set.status = 401;
        return { error: 'Não autorizado' };
      }

      const clienteId = user.sub as string;
      const { contratacaoId, nota, comentario } = body;

      // 1. Verifica se a contratação existe, pertence ao cliente e está concluída
      const contratacao = await prisma.contratacao.findFirst({
        where: {
          id: contratacaoId,
          clienteId: clienteId,
        },
        include: {
          variacao: {
            include: {
              servico: true,
            },
          },
        },
      });

      if (!contratacao) {
        set.status = 404;
        return { error: 'Contratação não encontrada ou não pertence a este cliente.' };
      }

      if (contratacao.status !== 'CONCLUIDO') {
        set.status = 400;
        return { error: 'Só é possível avaliar serviços já concluídos.' };
      }

      // 2. Verifica se esta contratação já foi avaliada
      const avaliacaoExistente = await prisma.avaliacao.findUnique({
        where: { contratacaoId },
      });

      if (avaliacaoExistente) {
        set.status = 400;
        return { error: 'Esta contratação já foi avaliada.' };
      }

      // 3. Cria a nova avaliação no banco de dados
      const novaAvaliacao = await prisma.avaliacao.create({
        data: {
          contratacaoId,
          clienteId,
          prestadorId: contratacao.variacao.servico.prestadorId,
          servicoId: contratacao.variacao.servicoId,
          nota,
          comentario,
        },
      });

      return novaAvaliacao;
    },
    {
      body: t.Object({
        contratacaoId: t.String(),
        nota: t.Number({
          minimum: 1,
          maximum: 5,
        }),
        comentario: t.Optional(t.String()),
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

