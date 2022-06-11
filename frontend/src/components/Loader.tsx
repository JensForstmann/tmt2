import { Component } from 'solid-js';
import classes from './Loader.module.scss';

export const Loader: Component = () => (
	<div class={classes.container}>
		<div class={classes['lds-ellipsis']}>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	</div>
);
