// A scan: reads the character and the queue, runs the forecast, and returns what the Overview shows.
// No DOM: everything here can run in a test.

import { forecast, initCache, saveCache } from './forecast.js';
import { MINDBLOCK, SKILLS, gameRows, geneticsFor, num, queueKey, readQueue, setting } from './game.js';
import { barKnots, barOf, stageOf } from './rules/fatigue.js';
import { fatigueGenesOf } from './rules/genes.js';
import { SETTINGS } from './settings.js';

/** A scan that can't go on, with a message for the player. */
export class ScanError extends Error {}

/**
 * @typedef {{ done: number, text: 'reading' | 'simulating' | 'waiting', waitSec?: number }} ScanProgress
 * @typedef {{ t: number, bar: number, minutes: number }} Sample
 * @typedef {{ start: number, title: string, xp: number, strained: number, lengthMin: number, bar: number, trend: number, passed: boolean }} Play
 * @typedef {{ hours: number, now: Sample & { stage: string }, samples: Sample[], plays: Play[], loop: { plays: number, sec: number }, scannedAt: number, queueKey: string[], knots: number[] }} Forecast
 */

/**
 * @param {{ api: any, hours: number, runs: number, quick?: boolean, signal: AbortSignal, onProgress: (p: ScanProgress) => void }} options
 * @returns {Promise<Forecast>}
 */
export async function runScan({ api, hours, runs, quick = false, signal, onProgress }) {
	if (!api || typeof api.simulate !== 'function') throw new ScanError('noSimulator');
	onProgress({ done: 0, text: 'reading' });
	await initCache();

	let me = null;
	try { me = await api.me(); } catch { me = null; }
	if (!me) throw new ScanError('noCharacter');
	const rows = await gameRows('SELECT * FROM character WHERE id = ? LIMIT 1', [num(me.character_id)]);
	if (rows === null) throw new ScanError('noDatabase');
	const row = rows[0];
	if (!row) throw new ScanError('noCharacter');

	const queue = readQueue();
	if (!queue) throw new ScanError('noQueue');
	if (!queue.entries.length) throw new ScanError('emptyQueue');

	const geneSource = await geneticsFor(row);
	const genes = fatigueGenesOf(geneSource.genetics);
	const gear = num(row.staminaUpgrades);
	const knots = barKnots(gear, genes);
	const startMinutes = num(me.fatigue && me.fatigue.minutes);
	const nowBar = barOf(startMinutes, knots);
	const mods = setting('mods', []);

	const ctx = {
		api, row, genes, geneSource, gear, startMinutes, hours,
		runs: runs || SETTINGS.runsPerPlay,
		quick,
		delaySec: Math.max(0, num(setting('autopilotDelay', 30))),
		rate: num(setting('rate', 1)) || 1,
		mods: Array.isArray(mods) ? mods : [],
		onRetry: (_n, _of, pauseMs) => onProgress({ done: 0, text: 'waiting', waitSec: Math.round(pauseMs / 1000) }),
	};
	const endSec = hours * 3600;
	let result;
	try {
		result = await forecast(queue, ctx, (p) => {
			if (p.t !== undefined) onProgress({ done: Math.min(1, p.t / endSec), text: 'simulating' });
		}, signal);
	} finally {
		saveCache();
	}

	// each play's XP as the server counts it: mindblock, then medals (or what calibration learned) and genetics
	const bonusOf = (sk) => (result.medals.ok ? result.medals.multiplier : result.calib.factors[sk] > 0 ? result.calib.factors[sk] : 1)
		* (result.genetics[sk] ? result.genetics[sk].total : 1);
	const xpOf = (p) => SKILLS.reduce((sum, sk) => sum + num(p.xp[sk]) * (MINDBLOCK.has(sk) ? num(p.block ?? 1) : 1) * bonusOf(sk), 0);

	return {
		hours,
		now: { t: 0, minutes: startMinutes, bar: nowBar, stage: stageOf(nowBar) },
		samples: result.samples,
		plays: result.plays.map((p) => ({
			start: p.start,
			title: queue.entries[p.entry].title,
			xp: xpOf(p),
			strained: p.strained,
			lengthMin: p.lengthMin,
			bar: p.bar,
			trend: p.trend,
			passed: p.passed,
		})),
		loop: { plays: result.loopPlays, sec: result.loopSec },
		scannedAt: Date.now(),
		queueKey: queueKey(queue.entries),
		// the bar's turning points in minutes of strain: 0, Peak's start and end, the XP Penalty, the cap
		knots: result.knots,
	};
}

/**
 * Where the bar is at `t` seconds, between the samples around it.
 * @param {Sample[]} samples
 * @param {number} t
 * @returns {Sample}
 */
export const sampleAt = (samples, t) => {
	const i = samples.findIndex((s) => s.t >= t);
	if (i < 0) return samples[samples.length - 1];
	if (i === 0) return samples[0];
	const a = samples[i - 1], b = samples[i], f = (t - a.t) / Math.max(1, b.t - a.t);
	return { t, bar: a.bar + (b.bar - a.bar) * f, minutes: a.minutes + (b.minutes - a.minutes) * f };
};

/**
 * The first time (seconds) the bar meets `test`, after now, or undefined.
 * @param {Sample[]} samples
 * @param {(bar: number) => boolean} test
 * @returns {number | undefined}
 */
export const firstTime = (samples, test) => {
	const s = samples.find((x, i) => i > 0 && test(x.bar));
	return s ? s.t : undefined;
};
