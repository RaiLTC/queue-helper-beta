// The bar over the look-ahead, with the Peak and XP Penalty bands. Hovering snaps to 10 minutes and moves the
// gauge's ghost needle there.

import { useMemo, useRef, type PointerEvent } from 'react';
import { sampleAt } from '../../core/scan.js';
import { TEXT } from '../../text.js';
import { type Store, useStore } from '../store.js';
import { PEAK, PENALTY } from '../zones.js';

const W = 600, H = 190, X0 = 84, X1 = 584, Y0 = 8, Y1 = 164, STEP = 600;

const y = (bar: number) => Y1 - Math.max(0, Math.min(1, bar)) * (Y1 - Y0);

export const StrainGraph = ({ store }: { store: Store }) => {
	const f = useStore(store, (s) => s.forecast);
	const hoverT = useStore(store, (s) => s.hoverT);
	const svgRef = useRef<SVGSVGElement>(null);
	const frame = useRef(0);

	const span = (f?.hours ?? 1) * 3600;
	const x = (t: number) => X0 + (t / span) * (X1 - X0);
	const line = useMemo(() => (f ? f.samples.map((s) => `${x(s.t).toFixed(1)},${y(s.bar).toFixed(1)}`).join(' ') : ''), [f]);
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
				<polyline className="strain" points={line} />
				{dot && (
					<>
						<line className="cursor" x1={x(dot.t)} x2={x(dot.t)} y1={Y0} y2={Y1} />
						<circle className="cursor-dot" cx={x(dot.t)} cy={y(dot.bar)} r={4} />
					</>
				)}
			</svg>
		</div>
	);
};
