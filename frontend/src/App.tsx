import { Link, LinkProps, Route, Routes, useLocation } from '@solidjs/router';
import { Component, Match, Switch, onMount } from 'solid-js';
import { SvgComputer, SvgDarkMode, SvgFlagDE, SvgFlagUS, SvgLightMode } from './assets/Icons';
import logo from './assets/logo.svg';
import { CreatePage } from './pages/create';
import { LoginPage } from './pages/login';
import { LogoutPage } from './pages/logout';
import { MatchPage } from './pages/match';
import { MatchEditPage } from './pages/matchEdit';
import { MatchesPage } from './pages/matches';
import { NotFoundPage } from './pages/notFound';
import { isLoggedIn } from './utils/fetcher';
import { currentLocale, cycleLocale, t } from './utils/locale';
import { currentTheme, cycleDarkMode, updateDarkClasses } from './utils/theme';
import { GameServersPage } from './pages/gameServers';

const NavLink = (props: LinkProps) => {
	const l = useLocation();

	return (
		<Link
			{...props}
			class={
				l.pathname === props.href
					? 'rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white'
					: 'rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
			}
		>
			{props.children}
		</Link>
	);
};

const NavBar: Component = () => {
	return (
		<nav class="flex h-12 items-center justify-center space-x-1 bg-gray-800 lg:space-x-10">
			<div class="w-1 lg:w-20"></div>
			<div>
				<img class="mr-1 inline-block h-10 w-auto align-middle" src={logo} alt="Logo" />
				<div class="inline-block align-middle text-xs text-teal-400 lg:hidden">TMT</div>
				<div class="hidden align-middle text-xs text-teal-400 lg:inline-block">
					Tournament
					<br />
					MatchTracker
				</div>
			</div>
			<div class="grow"></div>
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
						<SvgComputer class="cursor-pointer fill-gray-300 hover:fill-white" />
					</Match>
					<Match when={currentTheme() === 'dark'}>
						<SvgDarkMode class="cursor-pointer fill-gray-300 hover:fill-white" />
					</Match>
					<Match when={currentTheme() === 'light'}>
						<SvgLightMode class="cursor-pointer fill-gray-300 hover:fill-white" />
					</Match>
				</Switch>
			</div>
			<div onClick={() => cycleLocale()}>
				<Switch>
					<Match when={currentLocale() === 'de'}>
						<SvgFlagDE class="h-6 w-auto cursor-pointer" />
					</Match>
					<Match when={currentLocale() === 'en'}>
						<SvgFlagUS class="h-6 w-auto cursor-pointer" />
					</Match>
				</Switch>
			</div>
			<div class="w-1 lg:w-20"></div>
		</nav>
	);
};

export const App: Component = () => {
	onMount(updateDarkClasses);
	return (
		<>
			<header class="sticky top-0 z-10">
				<NavBar />
			</header>
			<main class="container mx-auto px-4">
				<Routes>
					<Route path="/matches" element={<MatchesPage />} />
					<Route path="/matches/:id" element={<MatchPage />} />
					<Route path="/matches/:id/edit" element={<MatchEditPage />} />
					<Route path="/gameservers" element={<GameServersPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/logout" element={<LogoutPage />} />
					<Route path={['/', '/create']} element={<CreatePage />} />
					<Route path="/*" element={<NotFoundPage />} />
				</Routes>
			</main>
			<footer></footer>
		</>
	);
};
