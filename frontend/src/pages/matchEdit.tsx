import { A, useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { Component, Show, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import { IMatchCreateDto, IMatchResponse, IMatchUpdateDto } from '../../../common';
import { SvgNavigateBefore } from '../assets/Icons';
import { Card } from '../components/Card';
import { CreateUpdateMatch } from '../components/CreateUpdateMatch';
import { Loader } from '../components/Loader';
import { NotLiveCard } from '../components/NotLiveCard';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';

const getUpdateDtoAttribute = <T,>(pre: T, post: T): T | undefined => {
	if (Array.isArray(pre) || (pre && typeof pre === 'object')) {
		return JSON.stringify(pre) !== JSON.stringify(post) ? post : undefined;
	}
	return pre !== post ? post : undefined;
};

const getUpdateDto = (
	match: IMatchResponse,
	dto: IMatchCreateDto & IMatchUpdateDto
): IMatchUpdateDto => {
	const newDto = {
		passthrough: getUpdateDtoAttribute(match.passthrough, dto.passthrough),
		mapPool: getUpdateDtoAttribute(match.mapPool, dto.mapPool),
		teamA: getUpdateDtoAttribute(match.teamA, dto.teamA),
		teamB: getUpdateDtoAttribute(match.teamB, dto.teamB),
		electionSteps: getUpdateDtoAttribute(match.electionSteps, dto.electionSteps),
		gameServer: getUpdateDtoAttribute(match.gameServer, dto.gameServer),
		webhookUrl: getUpdateDtoAttribute(match.webhookUrl, dto.webhookUrl),
		rconCommands: dto.rconCommands
			? {
					init: getUpdateDtoAttribute(match.rconCommands.init, dto.rconCommands.init),
					knife: getUpdateDtoAttribute(match.rconCommands.knife, dto.rconCommands.knife),
					match: getUpdateDtoAttribute(match.rconCommands.match, dto.rconCommands.match),
					end: getUpdateDtoAttribute(match.rconCommands.end, dto.rconCommands.end),
				}
			: undefined,
		canClinch: getUpdateDtoAttribute(match.canClinch, dto.canClinch),
		matchEndAction: getUpdateDtoAttribute(match.matchEndAction, dto.matchEndAction),
		tmtLogAddress: getUpdateDtoAttribute(match.tmtLogAddress, dto.tmtLogAddress),
		mode: getUpdateDtoAttribute(match.mode, dto.mode),
	};
	if (
		newDto.rconCommands?.init === undefined &&
		newDto.rconCommands?.knife === undefined &&
		newDto.rconCommands?.match === undefined &&
		newDto.rconCommands?.end === undefined
	) {
		delete newDto.rconCommands;
	}
	return newDto;
};

export const MatchEditPage: Component = () => {
	const navigate = useNavigate();
	const params = useParams();
	const [searchParams] = useSearchParams();
	const fetcher = createFetcher(searchParams.secret);
	const [data, setData] = createStore<{
		match?: IMatchResponse;
	}>({});

	onMount(async () => {
		fetcher<IMatchResponse>('GET', `/api/matches/${params.id}`).then((match) => {
			setData('match', match);
		});
	});

	return (
		<>
			<A href={`/matches/${params.id}`} class="btn">
				<SvgNavigateBefore class="inline-block" />
				{t('Back to the Match')}
			</A>
			<div class="h-4"></div>
			<Show when={data.match} fallback={<Loader />}>
				{(match) => (
					<div class="space-y-5">
						<Show when={!match().isLive}>
							<NotLiveCard match={match()} />
						</Show>
						<Show when={match().isLive}>
							<Card>
								<CreateUpdateMatch
									mode="UPDATE"
									match={match()}
									callback={async (dto) => {
										await fetcher(
											'PATCH',
											`/api/matches/${params.id}`,
											getUpdateDto(match(), dto)
										);
										navigate(`/matches/${params.id}`);
									}}
									getFinalDto={(dto) =>
										JSON.stringify(getUpdateDto(match(), dto), undefined, 4)
									}
								/>
							</Card>
						</Show>
					</div>
				)}
			</Show>
		</>
	);
};
