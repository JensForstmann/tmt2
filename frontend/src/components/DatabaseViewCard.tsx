import { Component } from "solid-js";
import { Card } from './Card';

export const DatabaseViewCard: Component<{
	title: string;
}> = (props) => {
	return (
		<Card>
			<div class="prose pt-4">
				<h2>{props.title}</h2>
			</div>
		</Card>
	);
};