// The game's rules, checked against values from oss!idle 1.4.3.0 (run with `npm test`).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BAR_ZONES, barKnots, barOf, stageOf, warmupTrend, xpForLevel } from '../src/core/rules/fatigue.js';
import { MODES, modeOf } from '../src/core/modes/index.js';

test('the bar puts Peak in its middle fifth and the XP Penalty in its top fifth', () => {
	assert.deepEqual(BAR_ZONES, [0.4, 0.6, 0.8]);
	const knots = barKnots(0, {});
	assert.equal(barOf(0, knots), 0);
	assert.equal(barOf(knots[1], knots), 0.4);
	assert.equal(barOf(knots[2], knots), 0.6);
	assert.equal(barOf(knots[3], knots), 0.8);
	assert.equal(barOf(knots[4], knots), 1);
});

test('stages follow the bar', () => {
	assert.equal(stageOf(0.1), 'cold');
	assert.equal(stageOf(0.3), 'warming');
	assert.equal(stageOf(0.5), 'peak');
	assert.equal(stageOf(0.7), 'pushing');
	assert.equal(stageOf(0.9), 'fatigued');
});

test('a map that strains you for its whole length warms you up as hard as the game shows', () => {
	assert.equal(warmupTrend(2, 2), 3);
	assert.ok(warmupTrend(2, 0) < 0);
	assert.equal(warmupTrend(0, 0), 0);
});

test('the XP each level costs starts at 100', () => {
	assert.equal(Math.round(xpForLevel(0)), 100);
});

test('modes are found by the game\'s ruleset id', () => {
	assert.equal(modeOf('mania4k'), MODES['4k']);
	assert.equal(modeOf('mania7k')?.forecast, false);
	assert.equal(modeOf('taiko'), undefined);
});
