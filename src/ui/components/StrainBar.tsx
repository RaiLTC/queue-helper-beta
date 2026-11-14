// The strain bar (Strain display: Bar): the gauge laid flat across the top of the Overview, sized by the Proportions
// setting. The stage name and % sit centred over the stage's section (lined up with an end when the section is at
// one), and the summary lines sit to its right. Plain elements placed by %, so it stretches with the card cleanly.

import { durShort, pctText } from '../format.js';
import { type Store, useStore } from '../store.js';
import { useStrainView } from '../strainView.js';
import { layoutOf } from '../summary.js';
import { ZONES, stageName, zoneOf } from '../zones.js';
import { StrainSummary } from './StrainSummary.js';

/** How close to an end a section's middle can be before its label lines up with that end instead. */
const EDGE = 0.08;
/** How close to an end the forecast needle can be before its time moves beside it (Queue Strain's 4%). */
const TIME_EDGE = 0.04;
const pct = (at: number) => `${at * 100}%`;

export const StrainBar = ({ store }: { store: Store }) => {
	const view = useStrainView(store);
	const mode = useStore(store, (s) => s.settings.proportions);
	if (!view) return null;

	const { edges, now, ghost } = layoutOf(view.knots, view.minutes, mode, view.ghost?.sample ?? null);
	const current = zoneOf(view.bar);
	const i = ZONES.indexOf(current);
	const middle = (edges[i]! + edges[i + 1]!) / 2;
	const side = middle <= EDGE ? 'start' : middle >= 1 - EDGE ? 'end' : 'middle';

	return (
		<div className="card strain-bar">
			<div>
				<div className="bar-top">
					<div className={`bar-label ${side}`} style={side === 'middle' ? { left: pct(middle) } : undefined}>
						<span className="stage-name" style={{ color: current.color }}>{stageName(view.bar)}</span>
						<span className="muted">{pctText(view.bar)}</span>
					</div>
				</div>
				<div className="bar-track" aria-hidden="true">
					{ZONES.map((z, k) => (
						<span key={z.id} className={z === current ? 'bar-seg on' : 'bar-seg'}
							style={{ left: pct(edges[k]!), width: pct(edges[k + 1]! - edges[k]!), background: z.color }} />
					))}
					{ghost !== null && view.ghost && (
						<>
							<span className="bar-needle ghost" style={{ left: pct(ghost) }} />
							{/* the forecast needle's time, centred under it; near an end of the bar it sits beside the needle
							    instead, towards the middle (as Queue Strain's bar did) */}
							<span className={`ghost-time${ghost < TIME_EDGE ? ' after' : ghost > 1 - TIME_EDGE ? ' before' : ''}`} style={{ left: pct(ghost) }}>{durShort(view.ghost.t)}</span>
						</>
					)}
					<span className="bar-needle" style={{ left: pct(now) }} />
				</div>
			</div>
			<div className="bar-summary"><StrainSummary view={view} /></div>
		</div>
	);
};
