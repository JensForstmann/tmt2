import { RouteSectionProps } from '@solidjs/router';
import { Component, Match, Switch, onMount } from 'solid-js';
import { SvgComputer, SvgDarkMode, SvgLightMode } from './assets/Icons';
import logo from './assets/logo.svg';

import { isLoggedIn } from './utils/fetcher';
import { t } from './utils/locale';
import { currentTheme, cycleDarkMode, updateDarkClasses } from './utils/theme';
import { NavLink } from './components/NavLink';

const NavBar: Component = () => {
	return (
		<nav class="bg-base-300 flex items-center justify-center space-x-1 p-2 lg:space-x-10">
			<div class="w-1 lg:w-20"></div>
			<div>
				<img class="mr-1 inline-block h-10 w-auto align-middle" src={logo} alt="Logo" />
				<div class="inline-block align-middle text-xs lg:hidden">TMT</div>
				<div class="hidden align-middle text-xs lg:inline-block">
					Tournament
					<br />
					MatchTracker
				</div>
			</div>
			<div class="grow"></div>
			<NavLink href="/stats">{t('Statistics')}</NavLink>
			<NavLink href="/create">{t('Create')}</NavLink>
			<NavLink href="/matches">{t('Matches')}</NavLink>
			<NavLink href="/gameservers">{t('Game Servers')}</NavLink>
			<Switch>
				<Match when={isLoggedIn() === undefined}>...</Match>
				<Match when={isLoggedIn() === false}>
					<NavLink href="/login">{t('Login')}</NavLink>
				</Match>
				<Match when={isLoggedIn() === true}>
					<NavLink href="/logout">{t('Logout')}</NavLink>
				</Match>
			</Switch>
			<div class="grow"></div>
			<div onClick={() => cycleDarkMode()}>
				<Switch>
					<Match when={currentTheme() === 'system'}>
						<SvgComputer class="fill-base-content cursor-pointer" />
					</Match>
					<Match when={currentTheme() === 'dark'}>
						<SvgDarkMode class="fill-base-content cursor-pointer" />
					</Match>
					<Match when={currentTheme() === 'light'}>
						<SvgLightMode class="fill-base-content cursor-pointer" />
					</Match>
				</Switch>
			</div>
			{/* <div onClick={() => cycleLocale()}>
				<Switch>
					<Match when={currentLocale() === 'de'}>
						<SvgFlagDE class="h-6 w-auto cursor-pointer" />
					</Match>
					<Match when={currentLocale() === 'en'}>
						<SvgFlagUS class="h-6 w-auto cursor-pointer" />
					</Match>
				</Switch>
			</div> */}
			<div class="w-1 lg:w-20"></div>
		</nav>
	);
};

export const App: Component<RouteSectionProps> = (props) => {
	onMount(updateDarkClasses);
	return (
		<>
			<header class="sticky top-0 z-10 pb-8">
				<NavBar />
			</header>
			<main class="container mx-auto px-4">{props.children}</main>
			<footer class="pt-8"></footer>
		</>
	);
};
