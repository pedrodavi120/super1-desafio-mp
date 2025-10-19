<!-- FILE: frontend/src/routes/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';

	let servicos: any[] = [];
	let tiposServico: any[] = [];
	let cidades: string[] = [];
	let busca = '';
	let cidadeSelecionada = '';
	let tipoServicoSelecionado = '';
	let resultadosBusca: any[] = [];

	function getMinPrice(variacoes: any[]): number {
		if (!variacoes || variacoes.length === 0) {
			return 0;
		}
		const prices = variacoes.map((v) => parseFloat(v.preco));
		return Math.min(...prices);
	}

	async function carregarDadosIniciais() {
		try {
			const [servicosRes, tiposRes] = await Promise.all([
				fetch('http://localhost:3000/api/servicos'),
				fetch('http://localhost:3000/api/tipos-servico')
			]);
			if (!servicosRes.ok || !tiposRes.ok) throw new Error('Falha ao carregar dados');

			const servicosData = await servicosRes.json();
			servicos = servicosData;
			tiposServico = await tiposRes.json();

			const cidadesUnicas = new Set(
				servicosData.map((s: any) => s.prestador.cidade).filter(Boolean)
			);
			cidades = [...cidadesUnicas];
		} catch (error) {
			console.error('Erro ao carregar dados:', error);
		}
	}

	async function pesquisar() {
		if (busca.length < 2) {
			resultadosBusca = [];
			return;
		}
		try {
			const res = await fetch(`http://localhost:3000/api/search?q=${busca}`);
			if (res.ok) {
				resultadosBusca = await res.json();
			}
		} catch (error) {
			console.error('Erro na busca:', error);
		}
	}

	function selecionarServicoDaBusca(servico: any) {
		servicos = [servico];
		busca = servico.nome;
		resultadosBusca = [];
	}

	onMount(carregarDadosIniciais);

	$: {
		async function filtrarServicos() {
			let url = `http://localhost:3000/api/servicos?`;
			if (cidadeSelecionada) url += `cidade=${cidadeSelecionada}&`;
			if (tipoServicoSelecionado) url += `tipoId=${tipoServicoSelecionado}&`;

			try {
				const res = await fetch(url);
				if (res.ok) {
					servicos = await res.json();
				}
			} catch (error) {
				console.error('Erro ao filtrar:', error);
			}
		}
		if (cidadeSelecionada || tipoServicoSelecionado) {
			filtrarServicos();
		} else if (!cidadeSelecionada && !tipoServicoSelecionado) {
			carregarDadosIniciais();
		}
	}
</script>

<svelte:head>
	<title>Marketplace de Serviços</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">

	<!-- Hero Section -->
	<div class="container mx-auto px-4 py-16">
		<div class="text-center mb-16">
			<h1 class="text-5xl font-bold text-gray-900 mb-6 leading-tight">
				Encontre o
				<span class="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
					Serviço Perfeito
				</span>
				para Você
			</h1>
			<p class="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
				Conectamos você aos melhores profissionais locais. Qualidade garantida e preços acessíveis.
			</p>
		</div>

		<!-- Search and Filters -->
		<div class="max-w-6xl mx-auto mb-20">
			<div class="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
				<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
					<!-- Search Input -->
					<div class="lg:col-span-2 relative">
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
								<svg class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
							<input
								type="text"
								placeholder="Buscar por serviço (ex: Pintura, Encanador, Design)"
								class="w-full pl-12 pr-4 py-4 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-purple-50 focus:bg-white"
								bind:value={busca}
								on:input={pesquisar}
							/>
						</div>
						
						<!-- Search Results Dropdown -->
						{#if resultadosBusca.length > 0}
							<div class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-purple-100 max-h-96 overflow-y-auto">
								{#each resultadosBusca as servico (servico.id)}
									<div
										class="p-4 hover:bg-purple-50 cursor-pointer border-b border-purple-100 last:border-b-0 transition-colors duration-200"
										on:click={() => selecionarServicoDaBusca(servico)}
									>
										<div class="flex items-center justify-between">
											<div>
												<h3 class="font-semibold text-gray-900">{servico.nome}</h3>
												<p class="text-sm text-gray-600 mt-1">por {servico.prestador.nome}</p>
											</div>
											<div class="text-right">
												{#if servico.variacoesServico.length > 0}
													<p class="text-lg font-bold text-purple-600">
														R$ {getMinPrice(servico.variacoesServico).toFixed(2)}
													</p>
												{/if}
												<p class="text-sm text-gray-500">{servico.prestador.cidade}</p>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- City Filter -->
					<div class="relative">
						<select 
							class="w-full pl-4 pr-10 py-4 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none transition-all duration-300 bg-purple-50 focus:bg-white cursor-pointer"
							bind:value={cidadeSelecionada}
						>
							<option value="">Todas as Cidades</option>
							{#each cidades as cidade}
								<option value={cidade}>{cidade}</option>
							{/each}
						</select>
						<div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
							<svg class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</div>
					</div>

					<!-- Service Type Filter -->
					<div class="relative">
						<select 
							class="w-full pl-4 pr-10 py-4 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none transition-all duration-300 bg-purple-50 focus:bg-white cursor-pointer"
							bind:value={tipoServicoSelecionado}
						>
							<option value="">Todos os Tipos</option>
							{#each tiposServico as tipo}
								<option value={tipo.id}>{tipo.nome}</option>
							{/each}
						</select>
						<div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
							<svg class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Services Grid -->
		<div class="max-w-7xl mx-auto">
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
				{#each servicos as servico (servico.id)}
					<a
						href="/servico/{servico.id}"
						class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-purple-100 hover:border-purple-300"
					>
						<div class="relative overflow-hidden">
							<img
								src="https://placehold.co/600x400/b6a4ff/ffffff?text={servico.nome}"
								alt={servico.nome}
								class="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
							/>
							<div class="absolute top-4 right-4">
								<span class="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
									{servico.prestador.cidade}
								</span>
							</div>
							{#if servico.mediaAvaliacoes > 0}
								<div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
									<div class="flex items-center space-x-1">
										<span class="text-yellow-500 text-sm">★</span>
										<span class="text-gray-900 text-sm font-semibold">{servico.mediaAvaliacoes.toFixed(1)}</span>
										<span class="text-gray-600 text-sm">({servico.totalAvaliacoes})</span>
									</div>
								</div>
							{/if}
						</div>

						<div class="p-6">
							<div class="flex items-start justify-between mb-3">
								<h2 class="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
									{servico.nome}
								</h2>
							</div>

							<p class="text-gray-600 mb-4 flex items-center">
								<svg class="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
								por {servico.prestador.nome}
							</p>

							<div class="flex items-center justify-between pt-4 border-t border-purple-100">
								{#if servico.variacoesServico.length > 0}
									<div>
										<p class="text-sm text-gray-500">A partir de</p>
										<p class="text-2xl font-bold text-purple-600">
											R$ {getMinPrice(servico.variacoesServico).toFixed(2)}
										</p>
									</div>
								{/if}
								<span class="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-purple-200 transition-colors">
									Ver Detalhes
								</span>
							</div>
						</div>
					</a>
				{:else}
					<div class="col-span-full text-center py-16">
						<svg class="w-24 h-24 text-purple-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<h3 class="text-xl font-semibold text-purple-600 mb-2">Nenhum serviço encontrado</h3>
						<p class="text-purple-500">Tente ajustar os filtros ou buscar por outro termo.</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>