// The window: header, side menu and the open view. A part that fails shows a short message instead of taking the
// whole window down.

import { Component, type CSSProperties, type ReactNode } from 'react';
import type { Settings } from '../settings.js';
import { TEXT } from '../text.js';
import { Gauge } from './components/Gauge.js';
import { Header } from './components/Header.js';
import { QueueForecast } from './components/QueueForecast.js';
import { Rail } from './components/Rail.js';
import { ScanBar } from './components/ScanBar.js';
import { StrainBar } from './components/StrainBar.js';
import { StrainGraph } from './components/StrainGraph.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { WhatsNew, latestVersion, newer } from './pages/WhatsNew.js';
import { type Store, type View, useStore } from './store.js';
import { accentColor, accentVars } from './theme.js';

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
	override state = { failed: false };
	static getDerivedStateFromError() { return { failed: true }; }
	override render() { return this.state.failed ? <div className="card error">{TEXT.errors.crashed as string}</div> : this.props.children; }
}

const Overview = ({ store }: { store: Store }) => {
	const has = useStore(store, (s) => !!s.forecast);
	const unsupported = useStore(store, (s) => s.unsupported);
	const bar = useStore(store, (s) => s.settings.strainDisplay === 'bar');
	if (unsupported) return <div className="card empty">{(TEXT.errors.noForecast as (m: string) => string)(unsupported)}</div>;
	if (!has) return <div className="card empty">{TEXT.overview.start}</div>;
	if (bar) {
		return (
			<>
				<Boundary><StrainBar store={store} /></Boundary>
				<Boundary><StrainGraph store={store} wide /></Boundary>
				<Boundary><QueueForecast store={store} /></Boundary>
			</>
		);
	}
	return (
		<>
			<div className="overview-top">
				<Boundary><Gauge store={store} /></Boundary>
				<Boundary><StrainGraph store={store} /></Boundary>
			</div>
			<Boundary><QueueForecast store={store} /></Boundary>
		</>
	);
};

export type AppProps = {
	store: Store,
	version: string,
	onScan: () => void,
	onStop: () => void,
	onClose: () => void,
	onView: (view: View) => void,
	onSettings: (patch: Partial<Settings>) => void,
	/** The version the player had seen before opening What's new, for its New tags. */
	seenBefore: () => string,
};

export const App = ({ store, version, onScan, onStop, onClose, onView, onSettings, seenBefore }: AppProps) => {
	const open = useStore(store, (s) => s.open);
	const view = useStore(store, (s) => s.view);
	const settings = useStore(store, (s) => s.settings);
	const stage = useStore(store, (s) => s.forecast?.now.stage ?? null);
	const passThrough = useStore(store, (s) => s.passThrough);
	const chatHole = useStore(store, (s) => s.chatHole);
	const fadeState = useStore(store, (s) => s.fade);

	const latest = latestVersion();
	const unread = !!latest && (!settings.seenVersion || newer(latest, settings.seenVersion));
	const classes = ['window', settings.fade && fadeState === 'armed' && 'fade', !settings.animations && 'still', passThrough !== null && 'passing'].filter(Boolean).join(' ');
	const style = {
		...accentVars(accentColor(settings, stage)),
		'--fade-opacity': settings.fadeOpacity / 100,
		...(passThrough !== null ? { '--pass-opacity': passThrough } : {}),
		...(chatHole ? { clipPath: chatHole } : {}),
	} as CSSProperties;

	const tab = view === 'settings' || view === 'whatsnew' ? null : view;
	return (
		<div className={classes} style={style} hidden={!open} role="dialog" aria-label={TEXT.name} onPointerEnter={() => { if (store.get().fade === 'hold') store.set({ fade: 'entered' }); }}
			onPointerLeave={() => { if (store.get().fade === 'entered') store.set({ fade: 'armed' }); }}>
			<Header version={version} view={view} unread={unread} onView={onView} onClose={onClose} />
			<div className="body">
				<Rail tab={view} onTab={(t) => onView(t)} />
				<main className="content">
					{view === 'settings' ? <Boundary><SettingsPage store={store} onChange={onSettings} /></Boundary>
						: view === 'whatsnew' ? <Boundary><WhatsNew seenBefore={seenBefore()} /></Boundary>
							: (
								<>
									<ScanBar store={store} onScan={onScan} onStop={onStop} />
									{tab === 'overview' ? <Overview store={store} /> : <div className="card empty">{TEXT.comingSoon}</div>}
								</>
							)}
				</main>
			</div>
		</div>
	);
};
