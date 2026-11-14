// What the strain display says and draws, shared by the gauge and the bar: the summary lines, the stage edges as
// the Proportions setting draws them, and where now and the ghost needle fall.

import { firstTime, type Forecast, type Sample } from '../core/scan.js';
import type { Proportions } from '../settings.js';
import { TEXT } from '../text.js';
import { durText, pctText } from './format.js';
import { spotOf, stageEdges, stageMinutes } from './proportions.js';
import { PEAK, PENALTY, stageName } from './zones.js';

/** The main line: the next thing that happens. */
export const headline = (f: Forecast): string => {
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
	return TEXT.overview.endIn(stageName(f.samples[f.samples.length - 1]!.bar), f.hours);
};

/** The second line: where the look-ahead ends, and the XP Penalty. */
export const endLine = (f: Forecast): string => {
	const end = f.samples[f.samples.length - 1]!;
	const penaltyAt = firstTime(f.samples, (b) => b >= PENALTY.from);
	return `${TEXT.overview.endLine(f.hours, pctText(end.bar), stageName(end.bar))} · ${penaltyAt === undefined ? TEXT.overview.noPenalty : TEXT.overview.penaltyLine(durText(penaltyAt))}`;
};

export type Layout = {
	/** The five stages' edges on the display, 0 to 1. */
	edges: number[],
	now: number,
	/** Where the ghost needle falls, or null without a forecast. */
	ghost: number | null,
};

/** Where things fall on the gauge or bar: the stages sized by the Proportions setting, now, and the ghost needle. */
export const layoutOf = (knots: number[], nowMinutes: number, mode: Proportions, ghost: Sample | null): Layout => {
	const minutes = stageMinutes(knots);
	const edges = stageEdges(minutes, mode);
	return { edges, now: spotOf(nowMinutes, minutes, edges), ghost: ghost ? spotOf(ghost.minutes, minutes, edges) : null };
};
