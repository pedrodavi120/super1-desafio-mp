<!-- File: frontend/src/routes/meus-agendamentos/+page.svelte -->
<script lang="ts">
	import { authToken } from '$lib/auth';
	import { onMount } from 'svelte';

	export let data: any;
	let { agendamentos } = data;

	let avaliacaoAberta: { [key: string]: boolean } = {};
	let nota: number = 5;
	let comentario: string = '';

	function toggleAvaliacao(id: string) {
		avaliacaoAberta[id] = !avaliacaoAberta[id];
	}

	async function enviarAvaliacao(contratacaoId: string) {
		const response = await fetch('/api/avaliacoes', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contratacao_id: contratacaoId,
				nota,
				comentario,
			}),
		});

		if (response.ok) {
			// Atualiza a UI para refletir que a avaliação foi feita
			const agendamento = agendamentos.find((a: any) => a.id === contratacaoId);
			if (agendamento) {
				agendamento.avaliacao = [{ nota }]; // Simula a avaliação para a UI
			}
			agendamentos = [...agendamentos];
			toggleAvaliacao(contratacaoId);
		} else {
			alert('Erro ao enviar avaliação.');
		}
	}
</script>

<div class="rounded-lg bg-white p-6 shadow-md">
	<h1 class="mb-6 text-3xl font-bold">Meus Agendamentos</h1>
	{#if agendamentos.length === 0}
		<p>Você ainda não fez nenhum agendamento.</p>
	{:else}
		<div class="space-y-4">
			{#each agendamentos as agendamento}
				<div class="rounded-md border p-4">
					<div class="flex flex-col justify-between md:flex-row">
						<div>
							<h2 class="text-xl font-semibold text-indigo-700">
								{agendamento.variacaoServico.servico.nome}
							</h2>
							<p class="text-gray-600">
								Variação: {agendamento.variacaoServico.nome}
							</p>
							<p class="text-gray-600">
								Prestador: {agendamento.variacaoServico.servico.prestador.nome}
							</p>
							<p class="font-medium">
								Data: {new Date(agendamento.data_hora_inicio).toLocaleString('pt-BR')}
							</p>
						</div>
						<div class="mt-4 flex flex-col items-start gap-2 md:mt-0 md:items-end">
							<span
								class="rounded-full px-3 py-1 text-sm font-semibold capitalize text-white {agendamento.status ===
								'agendado'
									? 'bg-green-500'
									: 'bg-red-500'}"
							>
								{agendamento.status.replace('_', ' ')}
							</span>

							{#if agendamento.status === 'concluido' && !agendamento.avaliacao}
								<button
									on:click={() => toggleAvaliacao(agendamento.id)}
									class="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
								>
									Avaliar Serviço
								</button>
							{/if}
						</div>
					</div>

					{#if avaliacaoAberta[agendamento.id]}
						<div class="mt-4 border-t pt-4">
							<h3 class="font-semibold">Deixe a sua avaliação:</h3>
							<div class="my-2 flex items-center">
								<span>Nota:</span>
								<select bind:value={nota} class="ml-2 rounded border p-1">
									<option value={5}>5 ★</option>
									<option value={4}>4 ★</option>
									<option value={3}>3 ★</option>
									<option value={2}>2 ★</option>
									<option value={1}>1 ★</option>
								</select>
							</div>
							<textarea
								bind:value={comentario}
								placeholder="Escreva um comentário (opcional)"
								class="w-full rounded border p-2"
							/>
							<button
								on:click={() => enviarAvaliacao(agendamento.id)}
								class="mt-2 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
							>
								Enviar Avaliação
							</button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

