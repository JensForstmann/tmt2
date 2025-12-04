import { A, AnchorProps, RouteSectionProps } from '@solidjs/router';
import { Component, Match, Show, Switch, createEffect, createSignal, onMount } from 'solid-js';
import {
	SvgCheck,
	SvgInfo,
	SvgLogin,
	SvgLogout,
	SvgNotifications,
	SvgSettings,
	SvgTheme,
} from './assets/Icons';
import logo from './assets/logo.svg';

import { createFetcher, isLoggedIn } from './utils/fetcher';
import { t } from './utils/locale';
import { currentTheme, setTheme, updateDarkClasses } from './utils/theme';
import { IMatchResponse } from '../../common';
import { MatchesNeedingAttention } from './pages/matches';

const NavLink = (props: AnchorProps) => {
	return (
		<A {...props} class="btn btn-ghost hover:no-underline">
			{props.children}
		</A>
	);
};

const NavBar: Component = () => {
	const [notificationCount, setNotificationCount] = createSignal(0);
	createEffect(() => {
		createFetcher()<IMatchResponse[]>(
			'GET',
			`/api/matches${MatchesNeedingAttention.search}`
		).then((matches) => {
			if (matches) {
				setNotificationCount(matches.length);
			}
		});
	});
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
			<div class="grow"></div>
			<A
				tabindex="0"
				role="button"
				class="btn btn-ghost btn-circle"
				href={'/matches?searchString=' + encodeURIComponent(MatchesNeedingAttention.search)}
			>
				<div class="indicator">
					<SvgNotifications />
					<Show when={notificationCount() > 0}>
						<span class="badge badge-sm badge-error text-error-content indicator-item">
							{notificationCount()}
						</span>
					</Show>
				</div>
			</A>
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-ghost btn-circle">
					<SvgSettings />
				</div>
				<ul
					tabindex="-1"
					class="menu dropdown-content bg-base-200 rounded-box z-1 mt-3 w-52 p-2 shadow"
				>
					<li>
						<details>
							<summary>
								<SvgTheme />
								{t('Theme')}
							</summary>
							<ul>
								<li>
									<a onClick={() => setTheme('system')}>
										{t('System')}
										<Show when={currentTheme() === 'system'}>
											<span class="justify-self-end">
												<SvgCheck />
											</span>
										</Show>
									</a>
								</li>
								<li>
									<a onClick={() => setTheme('light')}>
										{t('Light')}
										<Show when={currentTheme() === 'light'}>
											<span class="justify-self-end">
												<SvgCheck />
											</span>
										</Show>
									</a>
								</li>
								<li>
									<a onClick={() => setTheme('dark')}>
										{t('Dark')}
										<Show when={currentTheme() === 'dark'}>
											<span class="justify-self-end">
												<SvgCheck />
											</span>
										</Show>
									</a>
								</li>
							</ul>
						</details>
					</li>
					<li>
						<a href="/debug">
							<SvgInfo />
							{t('Info')}
						</a>
					</li>
					<li>
						<Switch>
							<Match when={isLoggedIn() === undefined}>
								<a>{t('Connecting ...')}</a>
							</Match>
							<Match when={isLoggedIn() === false}>
								<a href="/login">
									<SvgLogin /> {t('Login')}
								</a>
							</Match>
							<Match when={isLoggedIn() === true}>
								<a href="/logout">
									<SvgLogout /> {t('Logout')}
								</a>
							</Match>
						</Switch>
					</li>
				</ul>
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
