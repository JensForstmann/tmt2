import { DatabaseViewCard } from "../components/DatabaseViewCard";
import { t } from "../utils/locale";

export const StatsPage = () => {
	return (
		<>
			<DatabaseViewCard title={t('Match statistics')} />
			<div class="h-8" />
			<DatabaseViewCard title={t('Player statistics')} />
		</>
	);
};