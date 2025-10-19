// FILE: backend/prisma/seed.ts
import { prisma } from '../src/db'; // CORREÇÃO: O caminho de importação foi corrigido.
import bcrypt from 'bcryptjs';

async function main() {
  console.log('--- Iniciando o script de seed... ---');

  // Limpeza para garantir que o seed possa ser executado várias vezes
  console.log('Limpando dados antigos...');
  await prisma.avaliacao.deleteMany({});
  await prisma.contratacao.deleteMany({});
  await prisma.variacaoServico.deleteMany({});
  await prisma.servico.deleteMany({});
  await prisma.tipoServico.deleteMany({});
  await prisma.cliente.deleteMany({});
  await prisma.prestador.deleteMany({});
  console.log('Banco de dados limpo.');

  const senhaHash = bcrypt.hashSync('password123', 10);

  // --- CRIAÇÃO DOS PRESTADORES ---
  console.log('Criando prestadores...');
  const prestador1 = await prisma.prestador.create({
    data: {
      nome: 'Ana Manicure',
      email: 'ana.manicure@example.com',
      senhaHash,
      cidade: 'São Paulo',
      bairro: 'Vila Madalena',
    },
  });
  console.log('-> Prestador "Ana Manicure" criado.');

  const prestador2 = await prisma.prestador.create({
    data: {
      nome: 'Carlos Pintor',
      email: 'carlos.pintor@example.com',
      senhaHash,
      cidade: 'Rio de Janeiro',
      bairro: 'Copacabana',
    },
  });
  console.log('-> Prestador "Carlos Pintor" criado.');

  // --- CRIAÇÃO DO CLIENTE ---
  console.log('Criando cliente...');
  const cliente1 = await prisma.cliente.create({
    data: {
      nome: 'Mariana Cliente',
      email: 'mariana.cliente@example.com',
      senhaHash,
    },
  });
  console.log('-> Cliente "Mariana Cliente" criado.');

  // --- CRIAÇÃO DOS TIPOS DE SERVIÇO ---
  console.log('Criando tipos de serviço...');
  const tipoManicure = await prisma.tipoServico.create({ data: { nome: 'Manicure' } });
  const tipoPintura = await prisma.tipoServico.create({ data: { nome: 'Pintura' } });
  console.log('-> Tipos de serviço criados.');

  // --- CRIAÇÃO DOS SERVIÇOS E VARIAÇÕES ---
  console.log('Criando serviços...');
  await prisma.servico.create({
    data: {
      prestadorId: prestador1.id,
      tipoServicoId: tipoManicure.id,
      nome: 'Manicure Profissional',
      descricao: 'Serviço de manicure com 20 anos de experiência.',
      variacoesServico: {
        create: [
          { nome: 'Pé', preco: 25.0, duracao: 30, unidadeDuracao: 'MINUTOS' },
          { nome: 'Mãos', preco: 30.0, duracao: 45, unidadeDuracao: 'MINUTOS' },
        ],
      },
    },
  });
  console.log('-> Serviço de Manicure criado.');

  await prisma.servico.create({
    data: {
      prestadorId: prestador2.id,
      tipoServicoId: tipoPintura.id,
      nome: 'Pintura Residencial Rápida',
      descricao: 'Pintura de apartamentos e casas com agilidade.',
      variacoesServico: {
        create: [
          { nome: 'Pintura por cômodo', preco: 350.0, duracao: 1, unidadeDuracao: 'DIAS' },
          { nome: 'Pintura completa (Apê 2 quartos)', preco: 1200.0, duracao: 3, unidadeDuracao: 'DIAS' },
        ],
      },
    },
  });
  console.log('-> Serviço de Pintura criado.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('--- Seed concluído com sucesso! ---');
  })
  .catch(async (e) => {
    console.error('--- Ocorreu um erro no script de seed: ---', e);
    await prisma.$disconnect();
    process.exit(1);
  });