import { Component } from "solid-js";
import { NavLink } from './NavLink';
import { t } from "../utils/locale";

export const StatsNavBar: Component = () => {
	return (
		<header class="sticky top-0 z-10 pb-8">
			<nav class="bg-base-200 flex items-center justify-center space-x-1 p-2 lg:space-x-10 rounded-lg">
				<NavLink href="/stats/players">{t('Players')}</NavLink>
				<NavLink href="/stats/matches">{t('Matches')}</NavLink>
			</nav>
		</header>
	);
};
