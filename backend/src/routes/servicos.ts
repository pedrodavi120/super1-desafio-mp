// FILE: backend/src/routes/servicos.ts
import { Elysia, t } from 'elysia';
import { prisma } from '../db';
import { auth } from '../auth'; // Importa o plugin de autenticação

export const servicosRoutes = new Elysia({ prefix: '/api/servicos' })
  .use(auth) // CORREÇÃO: Usa o plugin 'auth' com o nome correto
  .post(
    '/',
    async ({ jwt, body, set }) => {
      const user = await jwt.verify();
      if (!user || user.role !== 'prestador') {
        set.status = 401;
        return { error: 'Não autorizado' };
      }

      const { variacoes, ...dadosServico } = body;

      const servico = await prisma.servico.create({
        data: {
          ...dadosServico,
          prestadorId: user.sub as string,
          variacoesServico: {
            create: variacoes,
          },
        },
        include: {
          variacoesServico: true,
        },
      });

      return servico;
    },
    {
      body: t.Object({
        nome: t.String(),
        descricao: t.String(),
        tipoServicoId: t.Numeric(),
        variacoes: t.Array(
          t.Object({
            nome: t.String(),
            preco: t.Numeric(),
            duracao: t.Numeric(),
            unidadeDuracao: t.Optional(t.String()),
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

