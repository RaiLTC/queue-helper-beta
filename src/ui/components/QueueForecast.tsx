// The plays ahead, one row each (repeats and loops included): the map's number in the queue, its song over its
// difficulty, its XP, how much of it strains you, and the bar after it with the game's arrows (‹ cools on the
// left, › warms on the right).

import { TEXT } from '../../text.js';
import { durText, lengthText, mapParts, pctText, xpText } from '../format.js';
import { type Store, useStore } from '../store.js';
import { zoneOf } from '../zones.js';

export const QueueForecast = ({ store }: { store: Store }) => {
	const f = useStore(store, (s) => s.forecast);
	if (!f) return null;
	const shown = f.plays.slice(0, Math.min(200, Math.max(20, f.loop.plays * 2 + 5)));
	const cols = TEXT.overview.cols;

	return (
		<div className="card queue">
			<div className="card-head">
				<span className="card-title">{TEXT.overview.queue}</span>
				{f.loop.sec > 0 && <span className="muted">{TEXT.overview.loop(f.loop.plays, durText(f.loop.sec))}</span>}
			</div>
			<div className="row row-head">
				<span>{cols.number}</span><span>{cols.map}</span><span>{cols.xp}</span><span>{cols.strain}</span><span className="bar-head">{cols.bar}</span>
			</div>
			<div className="rows">
				{shown.map((p, i) => {
					const warm = p.trend > 0, cool = p.trend < 0;
					const { title, difficulty } = mapParts(p.title);
					return (
						<div className="row" key={i}>
							<span className="muted">{p.entry + 1}</span>
							<span className="map-cell" title={p.title}>
								<span className="ellipsis">{title}{p.passed ? '' : <span className="error"> · {TEXT.overview.failed}</span>}</span>
								{difficulty && <span className="ellipsis muted">{difficulty}</span>}
							</span>
							<span>{xpText(p.xp)}</span>
							<span>{lengthText(p.strained)} <span className="muted">/ {lengthText(p.lengthMin)}</span></span>
							<span className="bar-cell" title={warm ? TEXT.overview.heats : cool ? TEXT.overview.cools : undefined}>
								<span className="arrows cool">{cool ? '‹'.repeat(-p.trend) : ''}</span>
								<span style={{ color: zoneOf(p.bar).color }}>{pctText(p.bar)}</span>
								<span className="arrows warm">{warm ? '›'.repeat(p.trend) : ''}</span>
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};
