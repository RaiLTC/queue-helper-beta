// The bar's zones, as the game draws them (rules/fatigue.js BAR_ZONES: Peak 40-60%, XP Penalty from 80%).
// The colours are the add-on's design tokens for each stage (styles.css uses the same values).

import { TEXT } from '../text.js';

export type Zone = { id: string, from: number, to: number, color: string };

export const ZONES: Zone[] = [
	{ id: 'cold', from: 0, to: 0.2, color: '#5ea8f5' },
	{ id: 'warming', from: 0.2, to: 0.4, color: '#5dcaa5' },
	{ id: 'peak', from: 0.4, to: 0.6, color: '#ef9f27' },
	{ id: 'pushing', from: 0.6, to: 0.8, color: '#d85a30' },
	{ id: 'fatigued', from: 0.8, to: 1, color: '#e24b4a' },
];

export const PEAK = ZONES[2]!;
export const PENALTY = ZONES[4]!;

export const zoneOf = (bar: number): Zone => ZONES.find((z) => bar < z.to) ?? PENALTY;
export const stageName = (bar: number): string => TEXT.stages[zoneOf(bar).id]?.[0] ?? '';
