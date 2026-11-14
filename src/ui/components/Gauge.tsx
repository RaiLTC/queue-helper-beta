// The warm-up gauge: the five stages on a 240° arc, sized by the Proportions setting. The stage you're in is
// highlighted, a solid needle marks now and, with a forecast, a dashed one where you'll be (the end of the
// look-ahead, or the graph's hovered time).

import { durShort, pctText } from '../format.js';
import { type Store, useStore } from '../store.js';
import { useStrainView } from '../strainView.js';
import { layoutOf } from '../summary.js';
import { ZONES, stageName, zoneOf } from '../zones.js';
import { StrainSummary } from './StrainSummary.js';

const START = 150, SWEEP = 240, CX = 85, CY = 72, R = 64, GAP = 0.006;

const point = (at: number, r: number): [number, number] => {
	const a = ((START + SWEEP * at) * Math.PI) / 180;
	return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};
const arc = (from: number, to: number): string => {
	const [x1, y1] = point(from, R), [x2, y2] = point(to, R);
	return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 ${SWEEP * (to - from) > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
};
const Needle = ({ at, from, to, className }: { at: number, from: number, to: number, className: string }) => {
	const [x1, y1] = point(at, from), [x2, y2] = point(at, to);
	return <line className={className} x1={x1} y1={y1} x2={x2} y2={y2} />;
};

export const Gauge = ({ store }: { store: Store }) => {
	const view = useStrainView(store);
	const mode = useStore(store, (s) => s.settings.proportions);
	if (!view) return null;

	const { edges, now, ghost } = layoutOf(view.knots, view.minutes, mode, view.ghost?.sample ?? null);
	const current = zoneOf(view.bar);
	const label = ghost === null ? null : point(ghost, 88);

	return (
		<div className="card gauge-card">
			<div className="gauge">
				<svg viewBox="-10 -12 190 145" aria-hidden="true">
					{ZONES.map((z, i) => (
						<path key={z.id} d={arc(edges[i]! + GAP, Math.max(edges[i]! + GAP, edges[i + 1]! - GAP))} stroke={z.color} className={z === current ? 'zone on' : 'zone'} />
					))}
					{ghost !== null && label && view.ghost && (
						<>
							<Needle className="needle ghost" at={ghost} from={52} to={76} />
							<text className="ghost-label" x={label[0]} y={label[1] + 4}>{durShort(view.ghost.t)}</text>
						</>
					)}
					<Needle className="needle" at={now} from={53} to={75} />
				</svg>
				<div className="gauge-center">
					<div className="stage-name" style={{ color: current.color }}>{stageName(view.bar)}</div>
					<div className="muted">{pctText(view.bar)}</div>
				</div>
			</div>
			<StrainSummary view={view} />
		</div>
	);
};
