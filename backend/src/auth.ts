// FILE: backend/src/auth.ts
import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';

// Criamos e exportamos a constante 'auth' que os outros ficheiros precisam de importar.
export const auth = new Elysia().use(
  jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET!,
    exp: '7d', // Opcional: define que o token expira em 7 dias
  })
);

