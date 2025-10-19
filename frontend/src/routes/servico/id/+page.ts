// File: frontend/src/routes/servico/[id]/+page.ts
/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }: any) {
	const res = await fetch(`/api/servicos/${params.id}`);
	const servico = await res.json();

	if (res.ok) {
		return { servico };
	}

	return {
		status: res.status,
		error: new Error('Não foi possível carregar o serviço.'),
	};
}

