import { Card } from "../components/Card";
import { DatabaseView } from "../components/DatabaseView";
import { t } from "../utils/locale";

export const StatsPage = () => {
	return (
		<>
			<Card>
				<div class="prose">
					<h2>{t('Match statistics')}</h2>
				</div>
				<DatabaseView />
			</Card>
			<div class="h-8" />
			<Card>
				<div class="prose">
					<h2>{t('Per-match player statistics')}</h2>
				</div>
				<DatabaseView />
			</Card>
			<div class=" h-8" />
			<Card> #TODO: With a drop down for selecting the match
				<div class="prose">
					<h2>{t('Global player statistics')}</h2>
				</div>
				<DatabaseView />
			</Card>
		</>
	);
};