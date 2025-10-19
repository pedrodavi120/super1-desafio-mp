<!-- FILE: frontend/src/routes/servico/[id]/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { authToken } from '../../../lib/auth';
	import { page } from '$app/stores';

	export let data; // Dados do +page.ts
	let servico = data.servico;

	let variacaoSelecionadaId: string | null = null;
	let dataSelecionada: string | null = null;
	let horarioSelecionado: string | null = null;
	let diaSelecionado: string | null = null;

	let horariosDisponiveis: string[] = [];
	let diasDisponiveis: { dia: string; label: string }[] = [];
	let carregandoHorarios = false;
	let mensagemContratacao = '';

	let unidadeDuracao = 'MINUTOS';
	let duracao = 0;

	// Derivados
	$: variacaoSelecionada = servico.variacoesServico.find((v: any) => v.id === variacaoSelecionadaId);
	$: if (variacaoSelecionada) {
		unidadeDuracao = variacaoSelecionada.unidadeDuracao;
		duracao = variacaoSelecionada.duracao;
	}

	async function buscarDisponibilidade() {
		if (!variacaoSelecionadaId) return;

		carregandoHorarios = true;
		horariosDisponiveis = [];

		if (unidadeDuracao === 'MINUTOS' && dataSelecionada) {
			try {
				const res = await fetch(
					`http://localhost:3000/api/servicos/variacoes/${variacaoSelecionadaId}/disponibilidade?data=${dataSelecionada}`
				);
				if (res.ok) {
					horariosDisponiveis = await res.json();
				}
			} catch (error) {
				console.error('Erro ao buscar horários:', error);
			}
		} else if (unidadeDuracao === 'DIAS') {
			try {
				const res = await fetch(
					`http://localhost:3000/api/servicos/variacoes/${variacaoSelecionadaId}/disponibilidade-dias`
				);
				if (res.ok) {
					diasDisponiveis = await res.json();
				}
			} catch (error) {
				console.error('Erro ao buscar dias:', error);
			}
		}
		carregandoHorarios = false;
	}

	async function contratar() {
		if (
			!variacaoSelecionadaId ||
			(unidadeDuracao === 'MINUTOS' && (!dataSelecionada || !horarioSelecionado)) ||
			(unidadeDuracao === 'DIAS' && !diaSelecionado)
		) {
			mensagemContratacao = 'Por favor, selecione todas as opções.';
			return;
		}

		let token;
		const unsubscribe = authToken.subscribe((value) => {
			token = value;
		});
		unsubscribe();

		if (!token) {
			window.location.href = '/login';
			return;
		}

		const dataHoraInicio =
			unidadeDuracao === 'MINUTOS'
				? `${dataSelecionada}T${horarioSelecionado}:00.000Z`
				: `${diaSelecionado}T00:00:00.000Z`;

		try {
			const res = await fetch('http://localhost:3000/api/contratacoes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					variacaoId: variacaoSelecionadaId,
					dataHoraInicio
				})
			});

			if (res.ok) {
				mensagemContratacao = 'Serviço contratado com sucesso!';
				// Resetar seleções
				setTimeout(() => (window.location.href = '/meus-agendamentos'), 2000);
			} else {
				const errorData = await res.json();
				mensagemContratacao = `Erro: ${errorData.error || 'Não foi possível contratar.'}`;
			}
		} catch (error) {
			mensagemContratacao = 'Erro de rede. Tente novamente.';
		}
	}

	// Re-buscar horários quando a variação ou a data mudar
	$: if (variacaoSelecionadaId) buscarDisponibilidade();
	$: if (dataSelecionada) buscarDisponibilidade();
</script>

<svelte:head>
	<title>{servico.nome}</title>
</svelte:head>

<div class="container mx-auto p-4">
	<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
		<!-- Coluna da Esquerda: Imagem e Descrição -->
		<div>
			<img
				src="https://placehold.co/800x600/a7a7a7/ffffff?text={servico.nome}"
				alt={servico.nome}
				class="mb-4 w-full rounded-lg object-cover"
			/>
			<h1 class="mb-2 text-3xl font-bold">{servico.nome}</h1>
			<p class="mb-4 text-gray-600">Oferecido por {servico.prestador.nome}</p>
			<p class="mb-4">{servico.descricao}</p>
			{#if servico.mediaAvaliacoes > 0}
				<div class="my-2 flex items-center">
					<span class="text-yellow-500">{'★'.repeat(Math.round(servico.mediaAvaliacoes))}</span>
					<span class="ml-2 text-gray-500">({servico.totalAvaliacoes} avaliações)</span>
				</div>
			{/if}
		</div>

		<!-- Coluna da Direita: Contratação -->
		<div class="rounded-lg border p-6 shadow-lg">
			<h2 class="mb-6 text-2xl font-bold">Agende este Serviço</h2>

			<!-- 1. Variação -->
			<div class="mb-4">
				<label for="variacao-select" class="block font-semibold">1. Escolha a Variação</label>
				<select
					id="variacao-select"
					bind:value={variacaoSelecionadaId}
					class="w-full rounded-md border p-2"
				>
					<option value={null}>Selecione...</option>
					{#each servico.variacoesServico as variacao (variacao.id)}
						<option value={variacao.id}>
							{variacao.nome} (R$ {parseFloat(variacao.preco).toFixed(2)})
						</option>
					{/each}
				</select>
			</div>

			<!-- 2. Data -->
			{#if variacaoSelecionadaId}
				<div class="mb-4">
					{#if unidadeDuracao === 'DIAS'}
						<label for="dia-select" class="block font-semibold">2. Escolha o Dia de Início</label>
						<select id="dia-select" bind:value={diaSelecionado} class="w-full rounded-md border p-2">
							<option value={null}>Selecione...</option>
							{#each diasDisponiveis as dia}
								<option value={dia.dia}>{dia.label}</option>
							{/each}
						</select>
					{:else}
						<label for="data-input" class="block font-semibold">2. Escolha a Data</label>
						<input
							id="data-input"
							type="date"
							bind:value={dataSelecionada}
							class="w-full rounded-md border p-2"
						/>
					{/if}
				</div>
			{/if}

			<!-- 3. Horário -->
			{#if unidadeDuracao === 'MINUTOS' && dataSelecionada && horariosDisponiveis.length > 0}
				<div class="mb-4">
					<label for="horario-grid" class="block font-semibold">3. Escolha o Horário</label>
					<div id="horario-grid" class="grid grid-cols-3 gap-2">
						{#each horariosDisponiveis as horario}
							<button
								class="rounded-md border p-2 text-center transition-colors {horarioSelecionado ===
								horario
									? 'bg-blue-600 text-white'
									: 'hover:bg-blue-100'}"
								on:click={() => (horarioSelecionado = horario)}
							>
								{horario}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Botão de Contratar -->
			<button
				on:click={contratar}
				class="w-full rounded-md bg-blue-600 py-3 font-bold text-white transition-colors hover:bg-blue-700"
			>
				Contratar
			</button>

			{#if mensagemContratacao}
				<p class="mt-4 text-center">{mensagemContratacao}</p>
			{/if}
		</div>
	</div>
</div>

