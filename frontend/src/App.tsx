import { Link, LinkProps, Route, Routes } from '@solidjs/router';
import { Component, Match, Switch, onMount } from 'solid-js';
import { SvgComputer, SvgDarkMode, SvgLightMode } from './assets/Icons';
import logo from './assets/logo.svg';
import { CreatePage } from './pages/create';
import { GameServersPage } from './pages/gameServers';
import { LoginPage } from './pages/login';
import { LogoutPage } from './pages/logout';
import { MatchPage } from './pages/match';
import { MatchEditPage } from './pages/matchEdit';
import { MatchesPage } from './pages/matches';
import { NotFoundPage } from './pages/notFound';
import { isLoggedIn } from './utils/fetcher';
import { t } from './utils/locale';
import { currentTheme, cycleDarkMode, updateDarkClasses } from './utils/theme';

const NavLink = (props: LinkProps) => {
	return (
		<Link {...props} class="btn btn-ghost hover:no-underline">
			{props.children}
		</Link>
	);
};

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

export const App: Component = () => {
	onMount(updateDarkClasses);
	return (
		<>
			<header class="sticky top-0 z-10 pb-8">
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
			<footer class="pt-8"></footer>
		</>
	);
};
