import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [solidPlugin(), tailwindcss()],
	build: {
		target: 'esnext',
	},
	server: {
		watch: {
			usePolling: true, // Needed to get HMR working within Docker
		},
	},
});
