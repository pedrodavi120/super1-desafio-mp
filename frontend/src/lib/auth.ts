// File: frontend/src/lib/auth.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Svelte Store para gerir o token de autenticação do cliente.
// O token é persistido no localStorage para manter o utilizador logado.
const initialValue = browser ? window.localStorage.getItem('authToken') : null;
export const authToken = writable<string | null>(initialValue);

authToken.subscribe((value) => {
	if (browser) {
		if (value) {
			window.localStorage.setItem('authToken', value);
		} else {
			window.localStorage.removeItem('authToken');
		}
	}
});

