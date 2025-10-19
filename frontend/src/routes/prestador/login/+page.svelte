<!-- File: frontend/src/routes/prestador/login/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { prestadorAuthToken } from '$lib/prestadorAuth';

	let email = '';
	let senha = '';
	let erro = '';

	async function login() {
		erro = '';
		const response = await fetch('/api/prestadores/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, senha }),
		});

		const data = await response.json();

		if (response.ok) {
			prestadorAuthToken.set(data.token);
			goto('/prestador/dashboard');
		} else {
			erro = data.error || 'Falha no login.';
		}
	}
</script>

<div class="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
	<h1 class="mb-6 text-center text-2xl font-bold">Entrar como Prestador</h1>
	<form on:submit|preventDefault={login} class="space-y-4">
		<div>
			<label for="email" class="block font-medium">Email</label>
			<input
				type="email"
				id="email"
				bind:value={email}
				required
				class="w-full rounded-md border p-2"
			/>
		</div>
		<div>
			<label for="senha" class="block font-medium">Senha</label>
			<input
				type="password"
				id="senha"
				bind:value={senha}
				required
				class="w-full rounded-md border p-2"
			/>
		</div>
		{#if erro}
			<p class="text-red-500">{erro}</p>
		{/if}
		<button type="submit" class="w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700"
			>Entrar no Painel</button
		>
	</form>
</div>

