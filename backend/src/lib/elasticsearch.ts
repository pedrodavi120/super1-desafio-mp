// FILE: backend/src/lib/elasticsearch.ts
import { Client } from '@elastic/elasticsearch';
import { HttpConnection } from '@elastic/transport';
import { prisma } from '../db';

// Usamos o HttpConnection para garantir a compatibilidade no ambiente Docker.
const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200',
  Connection: HttpConnection,
});

export async function sincronizarServicosComElasticsearch() {
  console.log('Iniciando sincronização com Elasticsearch...');
  const servicos = await prisma.servico.findMany({
    include: {
      prestador: true,
      tipoServico: true,
      variacoesServico: true,
      avaliacoes: true,
    },
  });

  if (servicos.length === 0) {
    console.log('Nenhum serviço para sincronizar.');
    return;
  }

  const operations = servicos.flatMap((servico) => [
    { index: { _index: 'servicos', _id: servico.id } },
    {
      nome: servico.nome,
      descricao: servico.descricao,
      prestador: servico.prestador.nome,
      cidade: servico.prestador.cidade,
      bairro: servico.prestador.bairro,
      tipo: servico.tipoServico.nome,
      precoMinimo: Math.min(...servico.variacoesServico.map((v) => v.preco)),
      notaMedia:
        servico.avaliacoes.length > 0
          ? servico.avaliacoes.reduce((acc, a) => acc + a.nota, 0) /
            servico.avaliacoes.length
          : 0,
    },
  ]);

  await elasticClient.bulk({ refresh: true, operations });
  console.log('Sincronização com Elasticsearch concluída com sucesso!');
}

export async function buscarServicos(termo: string, cidade: string) {
  const query: any = {
    bool: {
      must: [],
      filter: [],
    },
  };

  if (termo) {
    query.bool.must.push({
      multi_match: {
        query: termo,
        fields: ['nome', 'descricao', 'prestador', 'tipo'],
        fuzziness: 'AUTO',
      },
    });
  }

  if (cidade) {
    query.bool.filter.push({
      term: {
        'cidade.keyword': cidade,
      },
    });
  }

  if (!termo && !cidade) {
    query.bool.must.push({ match_all: {} });
  }

  const { hits } = await elasticClient.search({
    index: 'servicos',
    query,
  });

  const ids = hits.hits.map((hit: any) => hit._id);
  return ids;
}