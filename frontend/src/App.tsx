import { Route, Routes } from 'solid-app-router';
import { Component } from 'solid-js';
import { LoginPage } from './pages/login';
import { MatchPage } from './pages/match';
import { MatchesPage } from './pages/matches';

import styles from './App.module.css';
import { LogoutPage } from './pages/logout';

const App: Component = () => {
	return (
		<main class={styles.main}>
			<Routes>
				<Route path="/matches" element={<MatchesPage />} />
				<Route path="/matches/:id" element={<MatchPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/logout" element={<LogoutPage />} />
			</Routes>
		</main>
	);
};

export default App;
