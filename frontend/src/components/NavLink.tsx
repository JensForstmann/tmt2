import { AnchorProps, A } from '@solidjs/router';

export const NavLink = (props: AnchorProps) => {
	return (
		<A {...props} class="btn btn-ghost hover:no-underline">
			{props.children}
		</A>
	);
};
