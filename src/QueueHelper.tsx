// The add-on: the window's state, the shortcut, the game mode, settings and scanning. Everything registered here is
// undone by the SDK when the add-on stops (disabled, updated or removed), and the window's game hooks exist only
// while it's open.

import type { ReactNode } from 'react';
import { ReactAddon } from '@oss-idle/addon-sdk/react';
import { modeOf } from './core/modes/index.js';
import { ScanError, runScan } from './core/scan.js';
import { LIMITS, type Settings, settingsStore } from './settings.js';
import { TEXT } from './text.js';
import { App } from './ui/App.js';
import { latestVersion } from './ui/pages/WhatsNew.js';
import { type View, createStore } from './ui/store.js';
import styles from './ui/styles.css';
import { attachWindowBehaviours } from './ui/window/behaviours.js';

const TOGGLE = 'Alt+Shift+F';

type Ruleset = { current?: () => string, watch?: (fn: (id: string) => void) => (() => void) | void };
type Host = { api?: unknown, ruleset?: Ruleset };

const clamp = (v: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, Math.round(v)));

/** Saved settings, kept within their limits (a hand-edited or old save can't break the window). */
const loadSettings = (): Settings => {
	const s = settingsStore.load();
	return { ...s, lookAhead: clamp(s.lookAhead, LIMITS.lookAhead), runsPerPlay: clamp(s.runsPerPlay, LIMITS.runsPerPlay), fadeOpacity: clamp(s.fadeOpacity, LIMITS.fadeOpacity) };
};

export class QueueHelper extends ReactAddon {
	private readonly store = (() => {
		const settings = loadSettings();
		return createStore({
			open: false, view: 'overview', lookAhead: settings.lookAhead, scan: { status: 'idle' }, forecast: null, hoverT: null,
			unsupported: null, settings, undo: null, passThrough: null, chatHole: '',
		});
	})();
	private scanning?: AbortController;
	private detach?: () => void;
	/** The version seen before What's new was opened this time, so its New tags stay for the visit. */
	private seenBefore = '';

	constructor() {
		super({ name: TEXT.name, overlayId: 'queue-helper', styles });
	}

	private get game(): Host {
		return ((this.host as Host | undefined) ?? (globalThis as { ossIdle?: Host }).ossIdle ?? {});
	}

	protected override onReady(): void {
		this.own(this.hotkeys.register(TOGGLE, () => this.setOpen(!this.store.get().open), { allowInText: true }));
		const ruleset = this.game.ruleset;
		if (ruleset?.current) this.followMode(ruleset.current());
		const stop = ruleset?.watch?.((id) => this.followMode(id));
		if (typeof stop === 'function') this.own(stop);
	}

	/** Hold auto-updates while a scan runs. */
	canUpdate(): boolean {
		return !this.scanning;
	}

	protected override async onUnmount(): Promise<void> {
		this.scanning?.abort();
		this.detach?.();
		await super.onUnmount();
	}

	private followMode(id: string): void {
		const mode = modeOf(id);
		this.store.set({ unsupported: mode && !mode.forecast ? mode.name : null });
	}

	private setOpen(open: boolean): void {
		if (open === this.store.get().open) return;
		this.store.set({ open, hoverT: null });
		if (open) {
			this.detach = attachWindowBehaviours({
				store: this.store,
				windowEl: () => document.getElementById('queue-helper')?.shadowRoot?.querySelector<HTMLElement>('.window') ?? null,
				close: () => this.setOpen(false),
				rescan: () => void this.scan(true),
			});
		} else {
			this.detach?.();
			this.detach = undefined;
			this.scanning?.abort();
		}
	}

	private setView(view: View): void {
		if (view === 'whatsnew') {
			const { settings } = this.store.get();
			this.seenBefore = settings.seenVersion;
			const latest = latestVersion();
			if (latest && settings.seenVersion !== latest) this.changeSettings({ seenVersion: latest });
		}
		this.store.set({ view, hoverT: null });
	}

	private changeSettings(patch: Partial<Settings>): void {
		const { settings, lookAhead } = this.store.get();
		const next = { ...settings, ...patch };
		settingsStore.save(next);
		// a new default look-ahead also sets the scan bar's field
		this.store.set({ settings: next, lookAhead: patch.lookAhead !== undefined ? next.lookAhead : lookAhead });
	}

	private async scan(quick = false): Promise<void> {
		const { store } = this;
		if (this.scanning || store.get().unsupported) return;
		const controller = new AbortController();
		this.scanning = controller;
		store.set({ scan: { status: 'scanning', done: 0, text: TEXT.scan.reading }, hoverT: null });
		try {
			const forecast = await runScan({
				api: this.game.api,
				hours: store.get().lookAhead,
				runs: store.get().settings.runsPerPlay,
				quick,
				signal: controller.signal,
				onProgress: (p) => {
					const text = p.text === 'waiting' ? TEXT.scan.waiting(p.waitSec ?? 0) : p.text === 'reading' ? TEXT.scan.reading : TEXT.scan.simulating;
					store.set({ scan: { status: 'scanning', done: p.done, text } });
				},
			});
			store.set({ forecast, scan: { status: 'idle' } });
		} catch (e) {
			if (controller.signal.aborted) { store.set({ scan: { status: 'idle' } }); return; }
			const known = e instanceof ScanError ? TEXT.errors[e.message] : undefined;
			this.log.error('scan failed', e);
			store.set({ scan: { status: 'error', message: typeof known === 'string' ? known : TEXT.errors.unknown as string } });
		} finally {
			if (this.scanning === controller) this.scanning = undefined;
		}
	}

	protected render(): ReactNode {
		return (
			<App
				store={this.store}
				version={this.meta.version ?? ''}
				onScan={() => void this.scan()}
				onStop={() => this.scanning?.abort()}
				onClose={() => this.setOpen(false)}
				onView={(view) => this.setView(view)}
				onSettings={(patch) => this.changeSettings(patch)}
				seenBefore={() => this.seenBefore}
			/>
		);
	}
}
