import { AnchorProps, A } from '@solidjs/router';

export const NavLink = (props: AnchorProps) => {
	return (
		<A
			{...props}
			class="btn btn-ghost hover:no-underline"
			activeClass="ring-2 ring-neutral" // This class will be added when route matches
		>
			{props.children}
		</A>
	);
};
