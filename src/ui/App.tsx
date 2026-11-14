// The window: header, side menu, scan bar and the open view. A part that fails shows a short message instead of
// taking the whole window down.

import { Component, type ReactNode } from 'react';
import { TEXT } from '../text.js';
import { Gauge } from './components/Gauge.js';
import { Header } from './components/Header.js';
import { QueueForecast } from './components/QueueForecast.js';
import { Rail } from './components/Rail.js';
import { ScanBar } from './components/ScanBar.js';
import { StrainGraph } from './components/StrainGraph.js';
import { type Store, useStore } from './store.js';

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
	override state = { failed: false };
	static getDerivedStateFromError() { return { failed: true }; }
	override render() { return this.state.failed ? <div className="card error">{TEXT.errors.crashed as string}</div> : this.props.children; }
}

const Overview = ({ store }: { store: Store }) => {
	const has = useStore(store, (s) => !!s.forecast);
	const unsupported = useStore(store, (s) => s.unsupported);
	if (unsupported) return <div className="card empty">{(TEXT.errors.noForecast as (m: string) => string)(unsupported)}</div>;
	if (!has) return <div className="card empty">{TEXT.overview.start}</div>;
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

export type AppProps = { store: Store, version: string, onScan: () => void, onStop: () => void, onClose: () => void };

export const App = ({ store, version, onScan, onStop, onClose }: AppProps) => {
	const open = useStore(store, (s) => s.open);
	const tab = useStore(store, (s) => s.tab);
	return (
		<div className="window" hidden={!open} role="dialog" aria-label={TEXT.name}>
			<Header version={version} onClose={onClose} />
			<div className="body">
				<Rail tab={tab} onTab={(t) => store.set({ tab: t })} />
				<main className="content">
					<ScanBar store={store} onScan={onScan} onStop={onStop} />
					{tab === 'overview' ? <Overview store={store} /> : <div className="card empty">{TEXT.comingSoon}</div>}
				</main>
			</div>
		</div>
	);
};
