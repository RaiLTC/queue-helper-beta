// What players can set, with the defaults. Saved by the SDK under its own namespaced key, so nothing collides with
// the game's options or with Queue Strain's; a setting added later simply starts at its default.

import { createSettings } from '@oss-idle/addon-sdk';

export type AccentId = 'cold' | 'warming' | 'peak' | 'pushing' | 'fatigued' | 'stage' | 'osu' | 'custom';
export type ClickOutside = 'close' | 'through' | 'nothing';
export type EscEditing = 'addon' | 'both';
export type StrainDisplay = 'gauge' | 'bar';
export type Proportions = 'even' | 'balanced' | 'scale';

export type Settings = {
	lookAhead: number,
	runsPerPlay: number,
	rescanOnChange: boolean,
	strainDisplay: StrainDisplay,
	proportions: Proportions,
	accent: AccentId,
	customAccent: string,
	animations: boolean,
	fade: boolean,
	/** How visible the window stays while faded, in %. */
	fadeOpacity: number,
	clickOutside: ClickOutside,
	escEditing: EscEditing,
	chatThrough: boolean,
	passModsMenu: boolean,
	passGameMenus: boolean,
	/** The newest version the player has seen in What's new. */
	seenVersion: string,
};

export const DEFAULTS: Settings = {
	lookAhead: 6,
	runsPerPlay: 2,
	rescanOnChange: true,
	strainDisplay: 'gauge',
	proportions: 'even',
	accent: 'peak',
	customAccent: '#4fd1c5',
	animations: true,
	fade: true,
	fadeOpacity: 20,
	clickOutside: 'close',
	escEditing: 'addon',
	chatThrough: true,
	passModsMenu: true,
	passGameMenus: true,
	seenVersion: '',
};

export const LIMITS = {
	lookAhead: [1, 24],
	runsPerPlay: [1, 5],
	fadeOpacity: [10, 90],
} as const;

export const settingsStore = createSettings<Settings>('queue-helper', DEFAULTS);
