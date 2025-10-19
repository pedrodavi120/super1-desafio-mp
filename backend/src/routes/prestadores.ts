// FILE: backend/src/routes/prestadores.ts
import { Elysia, t } from 'elysia';
import { prisma } from '../db';
import { auth } from '../auth';
import bcrypt from 'bcryptjs';

export const prestadoresRoutes = new Elysia({ prefix: '/api/prestadores' })
  .use(auth)
  .post(
    '/',
    async ({ body }) => {
      const prestadorExistente = await prisma.prestador.findUnique({
        where: { email: body.email },
      });

      if (prestadorExistente) {
        throw new Error('Este email já está em uso.');
      }

      const senhaHash = await bcrypt.hash(body.senha, 10);

      const novoPrestador = await prisma.prestador.create({
        data: {
          nome: body.nome,
          email: body.email,
          senhaHash: senhaHash,
          cidade: body.cidade,
          bairro: body.bairro,
        },
        select: {
          id: true,
          nome: true,
          email: true,
          createdAt: true,
        },
      });

      return novoPrestador;
    },
    {
      body: t.Object({
        nome: t.String(),
        email: t.String({ format: 'email' }),
        senha: t.String(),
        cidade: t.Optional(t.String()),
        bairro: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/login',
    async ({ jwt, body, set }) => {
      const prestador = await prisma.prestador.findUnique({
        where: { email: body.email },
      });

      if (!prestador) {
        set.status = 401;
        return { error: 'Credenciais inválidas.' };
      }

      const senhaValida = await bcrypt.compare(body.senha, prestador.senhaHash);

      if (!senhaValida) {
        set.status = 401;
        return { error: 'Credenciais inválidas.' };
      }

      const token = await jwt.sign({
        sub: prestador.id,
        role: 'prestador',
      });

      return { token };
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        senha: t.String(),
      }),
    }
  );

