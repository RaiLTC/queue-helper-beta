// Strain as it is now, for a mode the forecast doesn't support yet (7K): the game's own strain for that mode, put
// on the bar with that mode's warm-up (its Stamina upgrades and genetics). The strain rules are the same for every
// mode (oss!idle shared/fatigue.ts); only the character's progress differs.

import { gameRows, num } from './game.js';
import { barKnots, barOf, stageOf } from './rules/fatigue.js';
import { fatigueGenesOf } from './rules/genes.js';
import { ScanError } from './scan.js';

/** @typedef {{ minutes: number, bar: number, stage: string, knots: number[] }} StrainNow */

/**
 * @param {any} api
 * @param {import('./modes/index.js').Mode} mode
 * @returns {Promise<StrainNow>}
 */
export async function readStrainNow(api, mode) {
	let me = null;
	try { me = await api.me({ ruleset: mode.id }); } catch { me = null; }
	if (!me) throw new ScanError('noCharacter');
	const { table, key } = mode.progress;
	const rows = await gameRows(`SELECT staminaUpgrades AS gear, geneticsJson AS genetics FROM ${table} WHERE ${key} = ? LIMIT 1`, [num(me.character_id)]);
	if (rows === null) throw new ScanError('noDatabase');
	const row = rows[0] || {};
	const knots = barKnots(num(row.gear), fatigueGenesOf(row.genetics || '', mode.ring));
	const minutes = num(me.fatigue && me.fatigue.minutes);
	const bar = barOf(minutes, knots);
	return { minutes, bar, stage: stageOf(bar), knots };
}
