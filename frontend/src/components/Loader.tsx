import { Component } from 'solid-js';

export const Loader: Component = () => (
	<div class="w-full text-center">
		<div class="lds-ellipsis">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	</div>
);
