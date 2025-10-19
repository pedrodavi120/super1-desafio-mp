// FILE: backend/src/routes/clientes.ts
import { Elysia, t } from 'elysia';
import { prisma } from '../db';
import { auth } from '../auth';
import bcrypt from 'bcryptjs';

export const clientesRoutes = new Elysia({ prefix: '/api/clientes' })
  .use(auth)
  .post(
    '/',
    async ({ body }) => {
      const clienteExistente = await prisma.cliente.findUnique({
        where: { email: body.email },
      });

      if (clienteExistente) {
        throw new Error('Este email já está em uso.');
      }

      const senhaHash = await bcrypt.hash(body.senha, 10);

      const novoCliente = await prisma.cliente.create({
        data: {
          nome: body.nome,
          email: body.email,
          senhaHash: senhaHash,
        },
        select: {
          id: true,
          nome: true,
          email: true,
        },
      });
      return novoCliente;
    },
    {
      body: t.Object({
        nome: t.String(),
        email: t.String({ format: 'email' }),
        senha: t.String(),
      }),
    }
  )
  .post(
    '/login',
    async ({ jwt, body, set }) => {
      const cliente = await prisma.cliente.findUnique({
        where: { email: body.email },
      });

      if (!cliente) {
        set.status = 401;
        return { error: 'Credenciais inválidas.' };
      }

      const senhaValida = await bcrypt.compare(body.senha, cliente.senhaHash);

      if (!senhaValida) {
        set.status = 401;
        return { error: 'Credenciais inválidas.' };
      }

      const token = await jwt.sign({
        sub: cliente.id,
        role: 'cliente',
      });

      return { token };
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        senha: t.String(),
      }),
    }
  )
  .get(
    '/me/contratacoes',
    async ({ jwt, set }) => {
      const user = await jwt.verify();
      if (!user || user.role !== 'cliente') {
        set.status = 401;
        return { error: 'Não autorizado' };
      }

      return prisma.contratacao.findMany({
        where: { clienteId: user.sub as string },
        include: {
          variacao: {
            include: {
              servico: {
                include: {
                  prestador: true,
                },
              },
            },
          },
          avaliacao: true,
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

