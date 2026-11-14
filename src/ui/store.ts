// The add-on's state: one object, changed only through setState. Components read the slice they need with
// useStore, so a change redraws only the components whose slice changed.

import { useSyncExternalStore } from 'react';
import type { Forecast } from '../core/scan.js';

export type TabId = 'overview' | 'xp' | 'levels' | 'jam' | 'suggest';

export type ScanState =
	| { status: 'idle' }
	| { status: 'scanning', done: number, text: string }
	| { status: 'error', message: string };

export type State = {
	open: boolean,
	tab: TabId,
	lookAhead: number,
	scan: ScanState,
	forecast: Forecast | null,
	/** The time (seconds) the graph is hovered at, or null: the gauge's ghost needle follows it. */
	hoverT: number | null,
	/** The game mode's name when the forecast doesn't support it, or null. */
	unsupported: string | null,
};

export const createStore = (initial: State) => {
	let state = initial;
	const listeners = new Set<() => void>();
	return {
		get: (): State => state,
		set: (patch: Partial<State>): void => {
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
