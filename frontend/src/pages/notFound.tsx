import { Component } from 'solid-js';

export const NotFoundPage: Component = () => {
	return (
		<div class="fixed inset-0 flex flex-col items-center justify-center">
			<h1 class="text-8xl font-bold text-error">404</h1>
			<p class="mt-2 text-2xl">Page not found</p>
		</div>
	);
};
