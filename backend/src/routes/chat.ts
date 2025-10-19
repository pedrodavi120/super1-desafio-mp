// FILE: backend/src/routes/chat.ts
import { Elysia, t } from 'elysia';
import { prisma } from '../db';
import { auth } from '../auth';

// Este objeto irá guardar os metadados dos utilizadores por ID da conexão WebSocket
const userConnections = new Map<string, { id: string; nome: string; role: string }>();

export const chatRoutes = new Elysia({ prefix: '/api/chat' })
  .use(auth)
  // Rota para um utilizador (cliente ou prestador) ver as suas conversas
  .get(
    '/conversas',
    async ({ jwt, set }) => {
      const user = await jwt.verify();
      if (!user) {
        set.status = 401;
        return { error: 'Não autorizado' };
      }

      const userId = user.sub as string;

      return prisma.conversa.findMany({
        where: {
          OR: [{ clienteId: userId }, { prestadorId: userId }],
        },
        include: {
          cliente: { select: { id: true, nome: true } },
          prestador: { select: { id: true, nome: true } },
          mensagens: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Pega apenas a última mensagem para a pré-visualização
          },
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
  )
  // Rota para um cliente iniciar uma conversa com um prestador
  .post(
    '/conversas',
    async ({ jwt, body, set }) => {
      const user = await jwt.verify();
      if (!user || user.role !== 'cliente') {
        set.status = 401;
        return { error: 'Apenas clientes podem iniciar conversas.' };
      }

      const clienteId = user.sub as string;
      const { prestadorId } = body;

      // Verifica se já existe uma conversa entre eles
      let conversa = await prisma.conversa.findFirst({
        where: { clienteId, prestadorId },
      });

      // Se não existir, cria uma nova
      if (!conversa) {
        conversa = await prisma.conversa.create({
          data: { clienteId, prestadorId },
        });
      }

      return conversa;
    },
    {
      body: t.Object({
        prestadorId: t.String(),
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
  // Lógica do WebSocket para a comunicação em tempo real
  .ws('/:conversaId', {
    // Validação do corpo da mensagem
    body: t.Object({
      conteudo: t.String(),
    }),

    // Executado quando um cliente se conecta
    async open(ws) {
      const { conversaId } = ws.data.params;
      const token = ws.data.query.token;

      if (!token) {
        return ws.close(); // Fecha a conexão se não houver token
      }

      // Verifica o token para autenticar e autorizar o utilizador
      const user = await ws.data.jwt.verify(token);
      if (!user) {
        return ws.close();
      }

      const conversa = await prisma.conversa.findUnique({
        where: { id: conversaId },
      });

      // Garante que o utilizador pertence a esta conversa
      if (
        !conversa ||
        (user.sub !== conversa.clienteId && user.sub !== conversa.prestadorId)
      ) {
        return ws.close();
      }

      // Guarda os dados do utilizador na conexão
      const dbUser =
        user.role === 'cliente'
          ? await prisma.cliente.findUnique({ where: { id: user.sub as string } })
          : await prisma.prestador.findUnique({ where: { id: user.sub as string } });

      if (dbUser) {
        userConnections.set(ws.id, { id: dbUser.id, nome: dbUser.nome, role: user.role });
      }

      // Subscreve o utilizador ao "tópico" desta conversa
      ws.subscribe(conversaId);
      console.log(`Utilizador ${dbUser?.nome} entrou no chat ${conversaId}`);
    },

    // Executado quando uma mensagem é recebida
    async message(ws, message) {
      const { conversaId } = ws.data.params;
      const user = userConnections.get(ws.id);

      if (!user) return; // Se o utilizador não estiver mapeado, ignora

      const { conteudo } = message;

      // Guarda a mensagem na base de dados
      const novaMensagem = await prisma.mensagem.create({
        data: {
          conversaId,
          conteudo,
          // Associa o remetente com base no seu papel (role)
          remetenteClienteId: user.role === 'cliente' ? user.id : null,
          remetentePrestadorId: user.role === 'prestador' ? user.id : null,
        },
      });

      // Envia a mensagem para todos os subscritos no tópico da conversa
      ws.publish(conversaId, {
        ...novaMensagem,
        remetente: { nome: user.nome }, // Adiciona o nome do remetente
      });
    },

    // Executado quando um cliente se desconecta
    async close(ws) {
      const user = userConnections.get(ws.id);
      if (user) {
        const { conversaId } = ws.data.params;
        console.log(`Utilizador ${user.nome} saiu do chat ${conversaId}`);
        userConnections.delete(ws.id); // Limpa os dados da conexão
      }
    },
  });

