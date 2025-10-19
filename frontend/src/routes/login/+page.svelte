<!-- File: frontend/src/routes/login/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { authToken } from '$lib/auth';

	let email = '';
	let senha = '';
	let erro = '';

	async function login() {
		erro = '';
		const response = await fetch('/api/clientes/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, senha }),
		});

		const data = await response.json();

		if (response.ok) {
			authToken.set(data.token);
			goto('/');
		} else {
			erro = data.error || 'Falha no login.';
		}
	}
</script>

<div class="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
	<h1 class="mb-6 text-center text-2xl font-bold">Entrar como Cliente</h1>
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
			>Entrar</button
		>
	</form>
	<p class="mt-4 text-center">
		Não tem uma conta? <a href="/register" class="text-indigo-600 hover:underline">Registe-se</a>
	</p>
</div>

