// The strain bar (Strain display: Bar): the gauge laid flat across the top of the Overview, sized by the Proportions
// setting. The stage name and % sit centred over the stage's section (lined up with an end when the section is at
// one), and the summary lines sit to its right. Plain elements placed by %, so it stretches with the card cleanly.

import { durShort, pctText } from '../format.js';
import { type Store, useStore } from '../store.js';
import { layoutOf } from '../summary.js';
import { ZONES, stageName, zoneOf } from '../zones.js';
import { StrainSummary } from './StrainSummary.js';

/** How close to an end a section's middle can be before its label lines up with that end instead. */
const EDGE = 0.08;
const pct = (at: number) => `${at * 100}%`;

export const StrainBar = ({ store }: { store: Store }) => {
	const f = useStore(store, (s) => s.forecast);
	const hoverT = useStore(store, (s) => s.hoverT);
	const mode = useStore(store, (s) => s.settings.proportions);
	if (!f) return null;

	const { edges, now, ghost, ghostT, ghostSample } = layoutOf(f, mode, hoverT);
	const current = zoneOf(f.now.bar);
	const i = ZONES.indexOf(current);
	const middle = (edges[i]! + edges[i + 1]!) / 2;
	const side = middle <= EDGE ? 'start' : middle >= 1 - EDGE ? 'end' : 'middle';

	return (
		<div className="card strain-bar">
			<div>
				<div className="bar-top">
					<div className={`bar-label ${side}`} style={side === 'middle' ? { left: pct(middle) } : undefined}>
						<span className="stage-name" style={{ color: current.color }}>{stageName(f.now.bar)}</span>
						<span className="muted">{pctText(f.now.bar)}</span>
					</div>
				</div>
				<div className="bar-track" aria-hidden="true">
					{ZONES.map((z, k) => (
						<span key={z.id} className={z === current ? 'bar-seg on' : 'bar-seg'}
							style={{ left: pct(edges[k]!), width: pct(edges[k + 1]! - edges[k]!), background: z.color }} />
					))}
					<span className="bar-needle ghost" style={{ left: pct(ghost) }} />
					{/* the forecast needle's time, centred right under it */}
					<span className="ghost-time" style={{ left: pct(ghost) }}>{durShort(ghostT)}</span>
					<span className="bar-needle" style={{ left: pct(now) }} />
				</div>
			</div>
			<div className="bar-summary"><StrainSummary f={f} hoverT={hoverT} at={ghostSample} /></div>
		</div>
	);
};
