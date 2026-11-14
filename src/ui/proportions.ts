// How big each stage is drawn on the gauge and the bar (the Proportions setting), and where a minute of strain falls.
//
// Even: every stage a fifth, as the game's own bar draws them.
// To scale: each stage by its real minutes of strain, so Peak grows with Stamina upgrades.
// Balanced: Cold and Warming up each take 15% with no Stamina upgrades, down to 10% at the most (they really do
// shorten); Peak, Pushing and Fatigued share the rest by their real minutes.

import type { Proportions } from '../settings.js';

const LOW_MAX = 0.15, LOW_MIN = 0.1;
// Cold's real share of the bar with no Stamina upgrades and with all ten (rules/fatigue.js barKnots)
const COLD_SHARE_0 = 47.1 / 2 / 420, COLD_SHARE_10 = 11.8 / 2 / 420;

/** The five stages' edges in minutes of strain, from the bar's turning points [0, Peak start, Peak end, XP Penalty, cap]. */
export const stageMinutes = (knots: number[]): number[] => {
	const [, peakFrom = 0, peakTo = 0, penalty = 0, cap = 1] = knots;
	return [0, peakFrom / 2, peakFrom, peakTo, penalty, cap];
};

/** The five stages' edges on the display, from 0 to 1. */
export const stageEdges = (minutes: number[], mode: Proportions): number[] => {
	const cap = minutes[5] || 1;
	const real = [0, 1, 2, 3, 4].map((i) => ((minutes[i + 1] ?? 0) - (minutes[i] ?? 0)) / cap);
	let shares: number[];
	if (mode === 'even') shares = [0.2, 0.2, 0.2, 0.2, 0.2];
	else if (mode === 'scale') shares = real;
	else {
		const t = (real[0]! - COLD_SHARE_10) / (COLD_SHARE_0 - COLD_SHARE_10);
		const low = Math.min(LOW_MAX, Math.max(LOW_MIN, LOW_MIN + t * (LOW_MAX - LOW_MIN)));
		const top = real[2]! + real[3]! + real[4]! || 1;
		shares = [low, low, ...real.slice(2).map((r) => (r / top) * (1 - 2 * low))];
	}
	const edges = [0];
	for (const share of shares) edges.push(edges[edges.length - 1]! + share);
	edges[5] = 1;
	return edges;
};

/** Where `m` minutes of strain fall on the display: a straight line through each stage. */
export const spotOf = (m: number, minutes: number[], edges: number[]): number => {
	for (let i = 1; i < 6; i++) {
		const hi = minutes[i]!, lo = minutes[i - 1]!;
		if (m <= hi) return edges[i - 1]! + ((m - lo) / Math.max(1e-9, hi - lo)) * (edges[i]! - edges[i - 1]!);
	}
	return 1;
};
