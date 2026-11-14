// The add-on's state: one object, changed only through set. Components read the slice they need with useStore, so
// a change redraws only the components whose slice changed. Nothing here runs on a timer.

import { useSyncExternalStore } from 'react';
import type { Forecast } from '../core/scan.js';
import type { Settings } from '../settings.js';

export type TabId = 'overview' | 'xp' | 'levels' | 'jam' | 'suggest';
export type View = TabId | 'settings' | 'whatsnew';

export type ScanState =
	| { status: 'idle' }
	| { status: 'scanning', done: number, text: string }
	| { status: 'error', message: string };

export type State = {
	open: boolean,
	view: View,
	/** The look-ahead for the next scan: starts at the setting, the scan bar's field changes it for this session. */
	lookAhead: number,
	scan: ScanState,
	forecast: Forecast | null,
	/** The time (seconds) the graph is hovered at, or null: the gauge's ghost needle follows it. */
	hoverT: number | null,
	/** The game mode's name when the forecast doesn't support it, or null. */
	unsupported: string | null,
	settings: Settings,
	/** The settings before the last reset, while Undo is offered. */
	undo: Settings | null,
	/** While a game menu is open under the window: how visible the window stays (it lets clicks through), else null. */
	passThrough: number | null,
	/** The part of the window over the open chat, cut out: a CSS clip-path, or ''. */
	chatHole: string,
};

export const createStore = (initial: State) => {
	let state = initial;
	const listeners = new Set<() => void>();
	return {
		get: (): State => state,
		set: (patch: Partial<State>): void => {
			let changed = false;
			for (const k in patch) if (patch[k as keyof State] !== state[k as keyof State]) { changed = true; break; }
			if (!changed) return;
			state = { ...state, ...patch };
			for (const listener of listeners) listener();
		},
		subscribe: (listener: () => void): (() => void) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
	};
};

export type Store = ReturnType<typeof createStore>;

/** A slice of the state, redrawing the component only when that slice changes. */
export const useStore = <T,>(store: Store, pick: (s: State) => T): T =>
	useSyncExternalStore(store.subscribe, () => pick(store.get()));
