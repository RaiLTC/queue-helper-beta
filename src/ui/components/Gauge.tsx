// The warm-up gauge: the bar's zones on a 240° arc with Peak at the top. The zone you're in is highlighted, a solid
// needle marks now and a dashed one where you'll be (at the end of the look-ahead, or the graph's hovered time).

import { firstTime, sampleAt, type Forecast } from '../../core/scan.js';
import { TEXT } from '../../text.js';
import { durShort, durText, pctText } from '../format.js';
import { type Store, useStore } from '../store.js';
import { PEAK, PENALTY, ZONES, stageName, zoneOf } from '../zones.js';

const START = 150, SWEEP = 240, CX = 85, CY = 72, R = 64;

const point = (bar: number, r: number): [number, number] => {
	const a = ((START + SWEEP * bar) * Math.PI) / 180;
	return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};
const arc = (from: number, to: number): string => {
	const [x1, y1] = point(from, R), [x2, y2] = point(to, R);
	return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 ${SWEEP * (to - from) > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
};
const Needle = ({ bar, from, to, className }: { bar: number, from: number, to: number, className: string }) => {
	const [x1, y1] = point(bar, from), [x2, y2] = point(bar, to);
	return <line className={className} x1={x1} y1={y1} x2={x2} y2={y2} />;
};

/** The main line under the gauge: the next thing that happens. */
const headline = (f: Forecast): string => {
	const inPeak = (b: number) => b >= PEAK.from && b < PEAK.to;
	const now = f.now.bar;
	if (now >= PENALTY.from) return TEXT.overview.penaltyNow;
	if (now < PEAK.from) {
		const t = firstTime(f.samples, (b) => b >= PEAK.from);
		if (t !== undefined) return TEXT.overview.peakIn(durText(t));
	} else if (inPeak(now)) {
		const t = firstTime(f.samples, (b) => !inPeak(b));
		return t !== undefined ? TEXT.overview.leavesPeakIn(durText(t)) : TEXT.overview.peakAll(f.hours);
	} else {
		const t = firstTime(f.samples, (b) => b >= PENALTY.from);
		if (t !== undefined) return TEXT.overview.penaltyIn(durText(t));
	}
	const end = f.samples[f.samples.length - 1]!;
	return TEXT.overview.endIn(stageName(end.bar), f.hours);
};

export const Gauge = ({ store }: { store: Store }) => {
	const f = useStore(store, (s) => s.forecast);
	const hoverT = useStore(store, (s) => s.hoverT);
	if (!f) return null;

	const now = f.now.bar;
	const end = f.samples[f.samples.length - 1]!;
	const ghostT = hoverT ?? f.hours * 3600;
	const ghost = hoverT === null ? end : sampleAt(f.samples, hoverT);
	const current = zoneOf(now);
	const penaltyAt = firstTime(f.samples, (b) => b >= PENALTY.from);
	const [lx, ly] = point(ghost.bar, 88);

	return (
		<div className="card gauge-card">
			<div className="gauge">
				<svg viewBox="-10 -12 190 145" aria-hidden="true">
					{ZONES.map((z) => (
						<path key={z.id} d={arc(z.from + 0.006, z.to - 0.006)} stroke={z.color} className={z === current ? 'zone on' : 'zone'} />
					))}
					<Needle className="needle ghost" bar={ghost.bar} from={52} to={76} />
					<text className="ghost-label" x={lx} y={ly + 4}>{durShort(ghostT)}</text>
					<Needle className="needle" bar={now} from={53} to={75} />
				</svg>
				<div className="gauge-center">
					<div className="gauge-stage" style={{ color: current.color }}>{stageName(now)}</div>
					<div className="muted">{pctText(now)}</div>
				</div>
			</div>
			{hoverT === null ? (
				<>
					<div className="gauge-line">{headline(f)}</div>
					<div className="muted">
						{TEXT.overview.endLine(f.hours, pctText(end.bar), stageName(end.bar))} · {penaltyAt === undefined ? TEXT.overview.noPenalty : TEXT.overview.penaltyLine(durText(penaltyAt))}
					</div>
				</>
			) : (
				<>
					<div className="gauge-line">
						{TEXT.overview.hoverLine(durText(hoverT))}
						<span style={{ color: zoneOf(ghost.bar).color }}>{pctText(ghost.bar)}</span>
					</div>
					<div className="muted">{TEXT.overview.hoverSub(stageName(ghost.bar), Math.round(ghost.minutes))}</div>
				</>
			)}
		</div>
	);
};
