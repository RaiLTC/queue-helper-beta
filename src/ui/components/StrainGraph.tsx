// The bar over the look-ahead, with the Peak and XP Penalty bands. Hovering snaps to 10 minutes and moves the
// gauge's ghost needle there.

import { useMemo, useRef, type PointerEvent } from 'react';
import { sampleAt, type Sample } from '../../core/scan.js';
import { TEXT } from '../../text.js';
import { type Store, useStore } from '../store.js';
import { PEAK, PENALTY } from '../zones.js';

const W = 600, H = 190, X0 = 84, X1 = 584, Y0 = 8, Y1 = 164, STEP = 600;

// The bar's height on the graph, stretched so the Peak band (40-60%) and the XP Penalty band (80-100%) get room
// to read: each [bar, height] pair is a point of a piecewise-linear scale.
const SCALE: [number, number][] = [[0, 0], [0.4, 0.3], [0.6, 0.62], [0.8, 0.78], [1, 1]];
const y = (bar: number) => {
	const b = Math.max(0, Math.min(1, bar));
	let i = 1;
	while (i < SCALE.length - 1 && b > SCALE[i]![0]) i++;
	const [b0, h0] = SCALE[i - 1]!, [b1, h1] = SCALE[i]!;
	return Y1 - (h0 + ((b - b0) / (b1 - b0)) * (h1 - h0)) * (Y1 - Y0);
};

// The line: the bar averaged over a few minutes either side (plays and the rests between them make a sawtooth that
// says nothing), drawn as a smooth curve through the averages.
const AVERAGE_SEC = 300, POINTS = 160;
const averageAt = (samples: Sample[], span: number, t: number): number => {
	if (t <= 0) return samples[0]!.bar;
	let sum = 0;
	for (let k = -4; k <= 4; k++) sum += sampleAt(samples, Math.max(0, Math.min(span, t + (k * AVERAGE_SEC) / 4))).bar;
	return sum / 9;
};
const smoothPath = (samples: Sample[], span: number, x: (t: number) => number): string => {
	const pts: [number, number][] = [];
	for (let i = 0; i <= POINTS; i++) {
		const t = (span * i) / POINTS;
		pts.push([x(t), y(averageAt(samples, span, t))]);
	}
	// Catmull-Rom through the points, as cubic Béziers
	let d = `M${pts[0]![0].toFixed(1)} ${pts[0]![1].toFixed(1)}`;
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[Math.max(0, i - 1)]!, p1 = pts[i]!, p2 = pts[i + 1]!, p3 = pts[Math.min(pts.length - 1, i + 2)]!;
		const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
		const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
		d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
	}
	return d;
};

export const StrainGraph = ({ store }: { store: Store }) => {
	const f = useStore(store, (s) => s.forecast);
	const hoverT = useStore(store, (s) => s.hoverT);
	const svgRef = useRef<SVGSVGElement>(null);
	const frame = useRef(0);

	const span = (f?.hours ?? 1) * 3600;
	const x = (t: number) => X0 + (t / span) * (X1 - X0);
	const line = useMemo(() => (f ? smoothPath(f.samples, span, x) : ''), [f]);
	if (!f) return null;

	// one store update a frame at most, however fast the pointer moves
	const onMove = (e: PointerEvent<SVGSVGElement>) => {
		const box = svgRef.current?.getBoundingClientRect();
		if (!box) return;
		const px = ((e.clientX - box.left) / box.width) * W;
		cancelAnimationFrame(frame.current);
		frame.current = requestAnimationFrame(() => {
			if (px < X0 || px > X1) return;
			const t = Math.max(STEP, Math.min(span, Math.round(((px - X0) / (X1 - X0)) * span / STEP) * STEP));
			if (t !== store.get().hoverT) store.set({ hoverT: t });
		});
	};
	const onLeave = () => { cancelAnimationFrame(frame.current); store.set({ hoverT: null }); };

	const hours = Array.from({ length: f.hours + 1 }, (_, h) => h);
	const dot = hoverT === null ? null : sampleAt(f.samples, hoverT);

	return (
		<div className="card graph-card">
			<div className="card-title">{TEXT.overview.graph}<span className="muted"> · {TEXT.overview.graphNext(f.hours)}</span></div>
			<svg ref={svgRef} className="graph" viewBox={`0 0 ${W} ${H}`} onPointerMove={onMove} onPointerLeave={onLeave} aria-hidden="true">
				<rect className="band penalty" x={X0} y={y(1)} width={X1 - X0} height={y(PENALTY.from) - y(1)} />
				<line className="penalty-line" x1={X0} x2={X1} y1={y(PENALTY.from)} y2={y(PENALTY.from)} />
				<rect className="band peak" x={X0} y={y(PEAK.to)} width={X1 - X0} height={y(PEAK.from) - y(PEAK.to)} />
				<text className="band-label penalty" x={X0 - 10} y={(y(1) + y(PENALTY.from)) / 2 + 4}>{TEXT.overview.penalty}</text>
				<text className="band-label peak" x={X0 - 10} y={(y(PEAK.to) + y(PEAK.from)) / 2 + 4}>{TEXT.overview.peak}</text>
				{hours.map((h) => (
					<g key={h}>
						<line className="grid" x1={x(h * 3600)} x2={x(h * 3600)} y1={Y0} y2={Y1} />
						<text className="axis" x={x(h * 3600)} y={Y1 + 20}>{h ? `${h} h` : TEXT.overview.now}</text>
					</g>
				))}
				<path className="strain" d={line} />
				{dot && (
					<>
						<line className="cursor" x1={x(dot.t)} x2={x(dot.t)} y1={Y0} y2={Y1} />
						<circle className="cursor-dot" cx={x(dot.t)} cy={y(averageAt(f.samples, span, dot.t))} r={4} />
					</>
				)}
			</svg>
		</div>
	);
};
