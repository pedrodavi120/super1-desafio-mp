// FILE: backend/src/routes/search.ts
import { Elysia } from 'elysia';
import { prisma } from '../db';
import { buscarServicos } from '../lib/elasticsearch';

export const searchRoutes = new Elysia({ prefix: '/search' })
  .get('/', async ({ query }) => {
    const { termo, cidade } = query;

    try {
      const ids = await buscarServicos(termo || '', cidade || '');

      if (ids.length === 0) {
        return [];
      }

      const servicos = await prisma.servico.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        include: {
          prestador: true,
          tipoServico: true,
          variacoesServico: true,
          avaliacoes: true,
        },
      });

      const servicosOrdenados = ids.map(id => servicos.find(s => s.id === id)).filter(Boolean);

      return servicosOrdenados;
    } catch (error) {
      console.error('Erro na busca:', error);
      return [];
    }
  });

