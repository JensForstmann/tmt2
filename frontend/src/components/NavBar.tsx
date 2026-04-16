import { A, AnchorProps } from '@solidjs/router';
import { Component, Match, Show, Switch } from 'solid-js';
import { globalStore } from '../App';
import {
	SvgCheck,
	SvgInfo,
	SvgLogin,
	SvgLogout,
	SvgNotifications,
	SvgSettings,
	SvgTheme,
} from '../assets/Icons';
import logo from '../assets/logo.svg';
import { MatchesNeedingAttention } from '../pages/matches';
import { isLoggedIn } from '../utils/auth';
import { t } from '../utils/locale';
import { currentTheme, setTheme } from '../utils/theme';

const NavLink = (props: AnchorProps) => {
	return (
		<A {...props} class="btn btn-ghost hover:no-underline">
			{props.children}
		</A>
	);
};

export const NavBar: Component = () => {
	const matchesNeedingAttention = () =>
		globalStore.matches?.filter((m) => m.data.isLive && m.data.needsAttentionSince);
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
			<Show when={isLoggedIn() === true}>
				<NavLink href="/gameservers">{t('Game Servers')}</NavLink>
			</Show>
			<div class="grow"></div>
			<A
				tabindex="0"
				role="button"
				class="btn btn-ghost btn-circle"
				href={'/matches?filter=' + encodeURIComponent(MatchesNeedingAttention.filter)}
			>
				<div class="indicator">
					<SvgNotifications />
					<Show when={matchesNeedingAttention()?.length}>
						<span class="badge badge-sm badge-error text-error-content indicator-item">
							{matchesNeedingAttention()?.length}
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
			<div class="w-1 lg:w-20"></div>
		</nav>
	);
};
