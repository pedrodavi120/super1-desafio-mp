// File: frontend/src/routes/meus-agendamentos/+page.ts
/** @type {import('./$types').PageLoad} */
export async function load({ fetch }: any) {
	try {
		const res = await fetch('/api/clientes/meus-agendamentos');
		if (!res.ok) {
			throw new Error('Não foi possível carregar os agendamentos.');
		}
		const agendamentos = await res.json();
		return { agendamentos };
	} catch (error) {
		return { agendamentos: [], error: (error as Error).message };
	}
}

