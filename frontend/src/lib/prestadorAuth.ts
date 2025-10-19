// File: frontend/src/lib/prestadorAuth.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Svelte Store para gerir o token de autenticação do prestador.
const initialValue = browser ? window.localStorage.getItem('prestadorAuthToken') : null;
export const prestadorAuthToken = writable<string | null>(initialValue);

prestadorAuthToken.subscribe((value) => {
	if (browser) {
		if (value) {
			window.localStorage.setItem('prestadorAuthToken', value);
		} else {
			window.localStorage.removeItem('prestadorAuthToken');
		}
	}
});

