/* @refresh reload */
import { Navigate, Route, Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import { App } from './App';
import { StatsPage } from './pages/stats';
import { CreatePage } from './pages/create';
import { DebugPage } from './pages/debug';
import { GameServerPage } from './pages/gameServer';
import { GameServersPage } from './pages/gameServers';
import { LoginPage } from './pages/login';
import { LogoutPage } from './pages/logout';
import { MatchPage } from './pages/match';
import { MatchEditPage } from './pages/matchEdit';
import { MatchesPage } from './pages/matches';
import { NotFoundPage } from './pages/notFound';

import './index.css';

render(
	() => (
		<Router root={App}>
			<Route path="/" component={() => <Navigate href="/stats" />} />
			<Route path='/stats' component={StatsPage} />
			<Route path="/matches" component={MatchesPage} />
			<Route path="/matches/:id" component={MatchPage} />
			<Route path="/matches/:id/edit" component={MatchEditPage} />
			<Route path="/gameservers/:ipPort" component={GameServerPage} />
			<Route path="/gameservers" component={GameServersPage} />
			<Route path="/login" component={LoginPage} />
			<Route path="/logout" component={LogoutPage} />
			<Route path="/create" component={CreatePage} />
			<Route path="/debug" component={DebugPage} />
			<Route path="/*" component={NotFoundPage} />
		</Router>
	),
	document.getElementById('root') as HTMLElement
);
