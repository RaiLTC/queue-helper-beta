// The add-on: the window's state, the shortcut, the game mode, and scanning. Everything registered here is undone
// by the SDK when the add-on stops (disabled, updated or removed).

import type { ReactNode } from 'react';
import { ReactAddon } from '@oss-idle/addon-sdk/react';
import { modeOf } from './core/modes/index.js';
import { ScanError, runScan } from './core/scan.js';
import { TEXT } from './text.js';
import { App } from './ui/App.js';
import { createStore } from './ui/store.js';
import styles from './ui/styles.css';

const TOGGLE = 'Alt+Shift+F';

type Ruleset = { current?: () => string, watch?: (fn: (id: string) => void) => (() => void) | void };
type Host = { api?: unknown, ruleset?: Ruleset };

export class QueueHelper extends ReactAddon {
	private readonly store = createStore({
		open: false, tab: 'overview', lookAhead: 6, scan: { status: 'idle' }, forecast: null, hoverT: null, unsupported: null,
	});
	private scanning?: AbortController;
	private escape?: () => void;

	constructor() {
		super({ name: TEXT.name, overlayId: 'queue-helper', styles });
	}

	private get game(): Host {
		return ((this.host as Host | undefined) ?? (globalThis as { ossIdle?: Host }).ossIdle ?? {});
	}

	protected override onReady(): void {
		this.own(this.hotkeys.register(TOGGLE, () => this.toggle(), { allowInText: true }));
		const ruleset = this.game.ruleset;
		if (ruleset?.current) this.followMode(ruleset.current());
		const stop = ruleset?.watch?.((id) => this.followMode(id));
		if (typeof stop === 'function') this.own(stop);
		this.own(this.store.subscribe(() => this.refreshEscape()));
	}

	/** Hold auto-updates while a scan runs. */
	canUpdate(): boolean {
		return !this.scanning;
	}

	protected override async onUnmount(): Promise<void> {
		this.scanning?.abort();
		this.escape?.();
		await super.onUnmount();
	}

	private followMode(id: string): void {
		const mode = modeOf(id);
		this.store.set({ unsupported: mode && !mode.forecast ? mode.name : null });
	}

	private toggle(open = !this.store.get().open): void {
		this.store.set({ open });
	}

	/** Esc closes the window, taken only while it's open: closed, Esc belongs to the game. */
	private refreshEscape(): void {
		const open = this.store.get().open;
		if (open && !this.escape) this.escape = this.hotkeys.register('Escape', () => this.toggle(false), { allowInText: true });
		else if (!open && this.escape) { this.escape(); this.escape = undefined; }
	}

	private async scan(): Promise<void> {
		const { store } = this;
		if (this.scanning || store.get().unsupported) return;
		const controller = new AbortController();
		this.scanning = controller;
		store.set({ scan: { status: 'scanning', done: 0, text: TEXT.scan.reading }, hoverT: null });
		try {
			const forecast = await runScan({
				api: this.game.api,
				hours: store.get().lookAhead,
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
				onClose={() => this.toggle(false)}
			/>
		);
	}
}
