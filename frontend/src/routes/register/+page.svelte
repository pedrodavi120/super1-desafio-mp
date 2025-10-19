<!-- File: frontend/src/routes/register/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';

	let nome = '';
	let email = '';
	let senha = '';
	let erro = '';
	let sucesso = '';

	async function register() {
		erro = '';
		sucesso = '';
		const response = await fetch('/api/clientes', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ nome, email, senha }),
		});

		const data = await response.json();

		if (response.ok) {
			sucesso = 'Conta criada com sucesso! A redirecionar para o login...';
			setTimeout(() => goto('/login'), 2000);
		} else {
			erro = data.error || 'Falha ao criar a conta.';
		}
	}
</script>

<div class="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
	<h1 class="mb-6 text-center text-2xl font-bold">Criar Conta de Cliente</h1>
	<form on:submit|preventDefault={register} class="space-y-4">
		<div>
			<label for="nome" class="block font-medium">Nome</label>
			<input type="text" id="nome" bind:value={nome} required class="w-full rounded-md border p-2" />
		</div>
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
			<label for="senha" class="block font-medium">Senha (mín. 8 caracteres)</label>
			<input
				type="password"
				id="senha"
				bind:value={senha}
				required
				minlength="8"
				class="w-full rounded-md border p-2"
			/>
		</div>
		{#if erro}
			<p class="text-red-500">{erro}</p>
		{/if}
		{#if sucesso}
			<p class="text-green-500">{sucesso}</p>
		{/if}
		<button type="submit" class="w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700"
			>Registar</button
		>
	</form>
</div>

