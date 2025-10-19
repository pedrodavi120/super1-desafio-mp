<!-- File: frontend/src/routes/chat/[conversaId]/+page.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { authToken } from '$lib/auth';
	import { prestadorAuthToken } from '$lib/prestadorAuth';

	const conversaId = $page.params.conversaId;
	let mensagens: any[] = [];
	let novaMensagem = '';
	let socket: WebSocket;
	let token: string | null = null;

	onMount(async () => {
		// Determina qual token usar
		const clienteToken = localStorage.getItem('authToken');
		const prestadorToken = localStorage.getItem('prestadorAuthToken');
		token = clienteToken || prestadorToken;

		if (!token) return;

		// Carregar mensagens antigas
		const res = await fetch(`/api/chat/conversas/${conversaId}/mensagens`);
		mensagens = await res.json();

		// Conectar ao WebSocket
		const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		socket = new WebSocket(`${wsProtocol}//${window.location.host}/ws/chat/${conversaId}`);

		socket.onmessage = (event) => {
			const msg = JSON.parse(event.data);
			mensagens = [...mensagens, msg];
		};

		socket.onclose = () => console.log('WebSocket desconectado.');
		socket.onerror = (err) => console.error('WebSocket erro:', err);
	});

	onDestroy(() => {
		if (socket) {
			socket.close();
		}
	});

	function enviarMensagem() {
		if (!novaMensagem.trim() || !socket || socket.readyState !== WebSocket.OPEN) return;
		socket.send(JSON.stringify({ token: token, conteudo: novaMensagem }));
		novaMensagem = '';
	}
</script>

<div class="mx-auto max-w-2xl rounded-lg border bg-white shadow-md">
	<div class="h-[60vh] overflow-y-auto p-4">
		{#each mensagens as msg}
			<div
				class="mb-2 flex {msg.remetente_tipo === 'CLIENTE' ? 'justify-end' : 'justify-start'}"
			>
				<div
					class="max-w-xs rounded-lg px-4 py-2 {msg.remetente_tipo === 'CLIENTE'
						? 'bg-indigo-500 text-white'
						: 'bg-gray-200 text-gray-800'}"
				>
					{msg.conteudo}
				</div>
			</div>
		{/each}
	</div>
	<div class="border-t p-4">
		<form on:submit|preventDefault={enviarMensagem} class="flex gap-2">
			<input
				type="text"
				bind:value={novaMensagem}
				placeholder="Escreva a sua mensagem..."
				class="flex-grow rounded-md border p-2"
			/>
			<button type="submit" class="rounded-md bg-indigo-600 px-4 py-2 text-white">Enviar</button>
		</form>
	</div>
</div>

