// A scan: reads the character and the queue, runs the forecast, and returns what the Overview shows.
// No DOM: everything here can run in a test.

import { forecast, initCache, localPlaysOf, saveCache } from './forecast.js';
import { MODES } from './modes/index.js';
import { MINDBLOCK, SKILLS, gameRows, geneticsFor, num, queueKey, readQueue, setting } from './game.js';
import { barKnots, barOf, stageOf } from './rules/fatigue.js';
import { fatigueGenesOf } from './rules/genes.js';
import { SETTINGS } from './settings.js';

/** A scan that can't go on, with a message for the player. */
export class ScanError extends Error {}

/**
 * @typedef {{ done: number, text: 'reading' | 'simulating' | 'waiting', waitSec?: number }} ScanProgress
 * @typedef {{ t: number, bar: number, minutes: number }} Sample
 * @typedef {{ start: number, entry: number, title: string, xp: number, strained: number, lengthMin: number, bar: number, trend: number, passed: boolean }} Play
 * @typedef {{ id: string, total: number, sim: number, same: number, real: number, checked: boolean }} SkillXp
 * @typedef {{ span: number, skills: SkillXp[], perLoop: number, medals: number | null, genetics: { min: number, max: number } | null, mapsPlayed: number, mapsTotal: number }} XpSummary
 * @typedef {{ xp: XpSummary, hours: number, now: Sample & { stage: string }, samples: Sample[], plays: Play[], loop: { plays: number, sec: number }, scannedAt: number, queueKey: string[], knots: number[] }} Forecast
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
	// the API answers for the mode picked in game unless told: the forecast is 4K's, so it asks for 4K
	try { me = await api.me({ ruleset: MODES['4k'].id }); } catch { me = null; }
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
	const gainOf = (p, sk) => num(p.xp[sk]) * (MINDBLOCK.has(sk) ? num(p.block ?? 1) : 1) * bonusOf(sk);
	const xpOf = (p) => SKILLS.reduce((sum, sk) => sum + gainOf(p, sk), 0);

	const xp = await xpSummary(result, queue, gainOf, await localPlaysOf(row, queue, ctx.rate, SETTINGS.localPlays, ctx.mods));

	return {
		xp,
		hours,
		now: { t: 0, minutes: startMinutes, bar: nowBar, stage: stageOf(nowBar) },
		samples: result.samples,
		plays: result.plays.map((p) => ({
			start: p.start,
			// the map's place in the queue (0-based)
			entry: p.entry,
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

/** Speed Jam and Memory rise and fall with a map's Tries, so an average of past plays says nothing about the next. */
const NO_LOCAL = new Set(['speedjam', 'memory']);

/**
 * The XP page's numbers: each skill's XP over the forecast (with the bonuses, and the simulator's own before them),
 * per loop, the bonuses, and a check against the player's real plays of the same maps (last 24 hours).
 * @returns {XpSummary}
 */
async function xpSummary(result, queue, gainOf, local) {
	const span = Math.max(1, result.samples[result.samples.length - 1].t);
	const realAvg = {};
	for (const d of local) {
		const a = realAvg[d.beatmapId] || (realAvg[d.beatmapId] = { n: 0, xp: {} });
		a.n++;
		for (const sk of SKILLS) a.xp[sk] = (a.xp[sk] || 0) + num(d.real[sk]);
	}
	const skills = SKILLS.map((id) => {
		let total = 0, sim = 0, same = 0, real = 0;
		for (const p of result.plays) {
			const gain = gainOf(p, id);
			total += gain;
			sim += num(p.xp[id]);
			const a = realAvg[queue.entries[p.entry].beatmapId];
			if (a && !NO_LOCAL.has(id)) { same += gain; real += a.xp[id] / a.n; }
		}
		return { id, total, sim, same, real, checked: !NO_LOCAL.has(id) };
	}).filter((s) => s.total > 0 || s.sim > 0 || s.real > 0);

	const loopPlays = result.plays.slice(result.loopStart, result.loopStart + result.loopPlays);
	const geneBonus = SKILLS.map((sk) => (result.genetics[sk] ? result.genetics[sk].total : 1)).filter((g) => g > 1);
	const maps = [...new Set(queue.entries.map((e) => e.beatmapId))];
	return {
		span,
		skills,
		perLoop: result.loopSec ? loopPlays.reduce((t, p) => t + SKILLS.reduce((s, sk) => s + gainOf(p, sk), 0), 0) : 0,
		medals: result.medals.ok ? result.medals.multiplier : null,
		genetics: geneBonus.length ? { min: Math.min(...geneBonus), max: Math.max(...geneBonus) } : null,
		mapsPlayed: maps.filter((id) => realAvg[id]).length,
		mapsTotal: maps.length,
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
