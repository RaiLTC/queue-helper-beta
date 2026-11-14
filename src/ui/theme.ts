// The accent colour: one of the stage colours (Peak by default), the stage you're in, osu! pink, or a custom one. From it come
// the soft highlight, the light text on dark highlights, and the text or knob colour that reads on the accent itself.

import type { CSSProperties } from 'react';
import type { Settings } from '../settings.js';
import { PEAK, colorOf } from './zones.js';

/** osu!'s own pink. */
export const OSU_PINK = '#ff66aa';

const rgb = (hex: string): [number, number, number] => {
	const n = Number.parseInt(hex.replace('#', ''), 16) || 0;
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const accentColor = (s: Settings, stage: string | null): string => {
	if (s.accent === 'custom') return /^#[0-9a-f]{6}$/i.test(s.customAccent) ? s.customAccent : PEAK.color;
	if (s.accent === 'stage') return stage ? colorOf(stage) : PEAK.color;
	if (s.accent === 'osu') return OSU_PINK;
	return colorOf(s.accent);
};

/** The accent as CSS variables for the window. */
export const accentVars = (hex: string): CSSProperties => {
	const [r, g, b] = rgb(hex);
	const light = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
	const mix = (v: number) => Math.round(v + (255 - v) * 0.45);
	return {
		'--a': hex,
		'--soft': `rgb(${r} ${g} ${b} / 18%)`,
		'--ink': `rgb(${mix(r)} ${mix(g)} ${mix(b)})`,
		'--on': light ? '#1a1a1a' : '#ffffff',
	} as CSSProperties;
};
