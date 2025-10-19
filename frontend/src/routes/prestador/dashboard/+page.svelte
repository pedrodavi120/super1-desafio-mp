<!-- File: frontend/src/routes/prestador/dashboard/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	let contratacoes: any[] = [];
	let loading = true;

	async function carregarContratacoes() {
		const response = await fetch('/api/painel-prestador/contratacoes');
		if (response.ok) {
			contratacoes = await response.json();
		}
		loading = false;
	}

	async function cancelarContratacao(id: string) {
		if (!confirm('Tem a certeza que deseja cancelar este agendamento?')) return;
		const response = await fetch(`/api/painel-prestador/contratacoes/${id}/cancelar`, {
			method: 'PATCH',
		});
		if (response.ok) {
			carregarContratacoes(); // Recarrega a lista
		} else {
			alert('Erro ao cancelar.');
		}
	}

	onMount(carregarContratacoes);
</script>

<div class="rounded-lg bg-white p-6 shadow-md">
	<h1 class="mb-6 text-3xl font-bold">Painel do Prestador</h1>
	<h2 class="mb-4 text-2xl">Agendamentos Recebidos</h2>
	{#if loading}
		<p>A carregar agendamentos...</p>
	{:else if contratacoes.length === 0}
		<p>Nenhum agendamento recebido até ao momento.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
							>Serviço</th
						>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
							>Cliente</th
						>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Data</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
							>Status</th
						>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Ações</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each contratacoes as c}
						<tr>
							<td class="whitespace-nowrap px-6 py-4"
								>{c.variacaoServico.servico.nome} ({c.variacaoServico.nome})</td
							>
							<td class="whitespace-nowrap px-6 py-4">{c.cliente.nome}</td>
							<td class="whitespace-nowrap px-6 py-4"
								>{new Date(c.data_hora_inicio).toLocaleString('pt-BR')}</td
							>
							<td class="whitespace-nowrap px-6 py-4">
								<span
									class="rounded-full px-2 py-1 text-xs font-semibold capitalize text-white {c.status ===
									'agendado'
										? 'bg-green-500'
										: 'bg-red-500'}"
								>
									{c.status.replace('_', ' ')}
								</span>
							</td>
							<td class="whitespace-nowrap px-6 py-4">
								{#if c.status === 'agendado'}
									<button
										on:click={() => cancelarContratacao(c.id)}
										class="text-red-600 hover:text-red-900">Cancelar</button
									>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

