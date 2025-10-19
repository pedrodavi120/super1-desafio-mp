<!-- File: frontend/src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { authToken } from '$lib/auth';
	import { prestadorAuthToken } from '$lib/prestadorAuth';
	import { goto } from '$app/navigation';

	function logoutCliente() {
		authToken.set(null);
		goto('/');
	}
	function logoutPrestador() {
		prestadorAuthToken.set(null);
		goto('/prestador/login');
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 font-sans text-gray-800">
	<!-- Header Moderno -->
	<header class="bg-white shadow-lg sticky top-0 z-50 border-b border-purple-100">
		<div class="container mx-auto px-4">
			<nav class="flex items-center justify-between py-4">
				<!-- Logo -->
				<a href="/" class="flex items-center space-x-3 group">
					<img 
						src="/logomp.png" 
						alt="Marketplace Logo" 
						class="h-10 w-auto object-contain transition-transform group-hover:scale-105"
					/>
				</a>

				<!-- Auth Section -->
				<div class="flex items-center space-x-4">
					{#if $authToken}
						<!-- Usuário Cliente Logado -->
						<div class="flex items-center space-x-4">
							<a 
								href="/meus-agendamentos" 
								class="flex items-center space-x-2 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 px-4 py-2 rounded-lg hover:bg-purple-50"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
								</svg>
								<span>Meus Agendamentos</span>
							</a>
							<button 
								on:click={logoutCliente}
								class="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
								</svg>
								<span>Sair</span>
							</button>
						</div>
					{:else if $prestadorAuthToken}
						<!-- Prestador Logado -->
						<div class="flex items-center space-x-4">
							<a 
								href="/prestador/dashboard" 
								class="flex items-center space-x-2 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 px-4 py-2 rounded-lg hover:bg-purple-50"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
								</svg>
								<span>Meu Painel</span>
							</a>
							<button 
								on:click={logoutPrestador}
								class="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
								</svg>
								<span>Sair</span>
							</button>
						</div>
					{:else}
						<!-- Usuário Não Logado -->
						<div class="flex items-center space-x-4">
							<a 
								href="/login" 
								class="text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 px-4 py-2 rounded-lg hover:bg-purple-50"
							>
								Entrar
							</a>
							<a 
								href="/register" 
								class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:from-purple-600 hover:to-indigo-700"
							>
								Criar Conta
							</a>
						</div>
					{/if}
				</div>

				<!-- Mobile Menu Button -->
				<button class="md:hidden p-2 rounded-lg hover:bg-purple-50 transition-colors">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
					</svg>
				</button>
			</nav>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1">
		<slot />
	</main>

	<!-- Footer -->
	<footer class="bg-gray-900 text-white mt-20">
		<div class="container mx-auto px-4 py-12">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
				<div class="md:col-span-2">
					<img 
						src="/logomp.png" 
						alt="Marketplace Logo" 
						class="h-12 w-auto mb-4 filter brightness-0 invert"
					/>
					<p class="text-gray-400 max-w-md leading-relaxed">
						Conectando você aos melhores profissionais de serviço. Qualidade, confiança e satisfação garantida.
					</p>
				</div>
				<div>
					<h3 class="font-semibold text-lg mb-4">Links Rápidos</h3>
					<ul class="space-y-2">
						<li><a href="/" class="text-gray-400 hover:text-purple-300 transition-colors">Início</a></li>
						<li><a href="/servicos" class="text-gray-400 hover:text-purple-300 transition-colors">Serviços</a></li>
						<li><a href="/sobre" class="text-gray-400 hover:text-purple-300 transition-colors">Sobre Nós</a></li>
						<li><a href="/contato" class="text-gray-400 hover:text-purple-300 transition-colors">Contato</a></li>
					</ul>
				</div>
				<div>
					<h3 class="font-semibold text-lg mb-4">Contato</h3>
					<ul class="space-y-2 text-gray-400">
						<li class="flex items-center space-x-2">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
							</svg>
							<span>contato@marketplace.com</span>
						</li>
						<li class="flex items-center space-x-2">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
							</svg>
							<span>(11) 99999-9999</span>
						</li>
					</ul>
				</div>
			</div>
			<div class="border-t from-[#5f5686] mt-8 pt-8 text-center text-gray-400">
				<p>&copy; 2024 Marketplace. Todos os direitos reservados.</p>
			</div>
		</div>
	</footer>
</div>

<style>
	/* Estilos globais adicionais */
	:global(.container) {
		max-width: 1200px;
	}
	
	:global(.shadow-lg) {
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}
</style>