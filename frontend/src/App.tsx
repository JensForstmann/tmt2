import { Route, Routes } from '@solidjs/router';
import { Component, onMount } from 'solid-js';
import { MainNavigation } from './components/MainNavigation';
import { CreatePage } from './pages/create';
import { LoginPage } from './pages/login';
import { LogoutPage } from './pages/logout';
import { MatchPage } from './pages/match';
import { MatchesPage } from './pages/matches';
import { NotFoundPage } from './pages/notFound';

export const setTheme = () => {
	if (isDark()) {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
};

export const isDark = () => {
	return (
		localStorage.theme === 'dark' ||
		(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
	);
};

export const cycleDarkMode = () => {
	if (isDark()) {
		localStorage.setItem('theme', 'light');
	} else {
		localStorage.setItem('theme', 'dark');
	}
	setTheme();
};

export const App: Component = () => {
	onMount(setTheme);
	return (
		<>
			<header>
				<MainNavigation />
			</header>
			<main class="container mx-auto px-4">
				<Routes>
					<Route path="/matches" element={<MatchesPage />} />
					<Route path="/matches/:id" element={<MatchPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/logout" element={<LogoutPage />} />
					<Route path={['/', '/create']} element={<CreatePage />} />
					<Route path="/*" element={<NotFoundPage />} />
				</Routes>
			</main>
		</>
	);
};
