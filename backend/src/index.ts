// FILE: backend/src/index.ts
import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { tiposServicoRoutes } from './routes/tiposServico';
import { prestadoresRoutes } from './routes/prestadores';
import { servicosRoutes } from './routes/servicos';
import { disponibilidadeRoutes } from './routes/disponibilidade';
import { clientesRoutes } from './routes/clientes';
import { contratacoesRoutes } from './routes/contratacoes';
import { painelPrestadorRoutes } from './routes/painelPrestador';
import { avaliacoesRoutes } from './routes/avaliacoes';
import { searchRoutes } from './routes/search';
import { chatRoutes } from './routes/chat';
import { sincronizarServicosComElasticsearch } from './lib/elasticsearch';

const apiRoutes = new Elysia({ prefix: '/api' })
  .use(tiposServicoRoutes)
  .use(prestadoresRoutes)
  .use(servicosRoutes)
  .use(disponibilidadeRoutes)
  .use(clientesRoutes)
  .use(contratacoesRoutes)
  .use(painelPrestadorRoutes)
  .use(avaliacoesRoutes)
  .use(chatRoutes);

const app = new Elysia()
  .use(swagger())
  .use(cors())
  .get('/', () => ({ message: 'Olá! A API do Marketplace está a funcionar!' }))
  .use(apiRoutes)
  .use(searchRoutes)
  .listen(3000, async () => {
    console.log('🦊 Elysia está a correr em http://localhost:3000');

    // A lógica de espera agora está no docker-compose.yml,
    // então podemos chamar a sincronização diretamente com segurança.
    try {
      await sincronizarServicosComElasticsearch();
    } catch (error) {
      console.error('Falha ao sincronizar com Elasticsearch na inicialização:', error);
    }
  });

export type App = typeof app;