// The bar's zones and their colours, as the game draws its strain bar (rules/fatigue.js BAR_ZONES: Peak 40-60%,
// the XP Penalty from 80%). styles.css holds the same colours as tokens.

import { TEXT } from '../text.js';

export type Zone = { id: 'cold' | 'warming' | 'peak' | 'pushing' | 'fatigued', from: number, to: number, color: string };

export const ZONES: Zone[] = [
	{ id: 'cold', from: 0, to: 0.2, color: '#4f9cf5' },
	{ id: 'warming', from: 0.2, to: 0.4, color: '#5fc3c0' },
	{ id: 'peak', from: 0.4, to: 0.6, color: '#e8c147' },
	{ id: 'pushing', from: 0.6, to: 0.8, color: '#f0883e' },
	{ id: 'fatigued', from: 0.8, to: 1, color: '#c084fc' },
];

export const PEAK = ZONES[2]!;
export const PENALTY = ZONES[4]!;

export const zoneOf = (bar: number): Zone => ZONES.find((z) => bar < z.to) ?? PENALTY;
export const stageName = (bar: number): string => TEXT.stages[zoneOf(bar).id]?.[0] ?? '';
export const colorOf = (id: string): string => ZONES.find((z) => z.id === id)?.color ?? PEAK.color;
