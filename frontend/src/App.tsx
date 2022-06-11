import { Component } from 'solid-js';
import { Route, Routes } from 'solid-app-router';
import { MatchesPage } from './pages/matches';
import { MatchPage } from './pages/match';

import styles from './App.module.css';

const App: Component = () => {
	return (
		<main class={styles.main}>
			<Routes>
				<Route path="/matches" element={<MatchesPage />} />
				<Route path="/matches/:id" element={<MatchPage />} />
			</Routes>
		</main>
	);
};

export default App;
