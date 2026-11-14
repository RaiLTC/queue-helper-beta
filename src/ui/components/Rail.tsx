// The side menu: the ARIA tabs pattern, so arrow keys move between the views.

import type { KeyboardEvent } from 'react';
import { TEXT } from '../../text.js';
import type { TabId, View } from '../store.js';
import { Icon, type IconName } from './Icon.js';

const TABS: { id: TabId, icon: IconName }[] = [
	{ id: 'overview', icon: 'gauge' },
	{ id: 'xp', icon: 'chart' },
	{ id: 'levels', icon: 'stairs' },
	{ id: 'jam', icon: 'brain' },
	{ id: 'suggest', icon: 'bulb' },
];

export const Rail = ({ tab, onTab }: { tab: View, onTab: (tab: TabId) => void }) => {
	const onKey = (e: KeyboardEvent<HTMLElement>) => {
		const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
		if (!step) return;
		e.preventDefault();
		const i = Math.max(0, TABS.findIndex((t) => t.id === tab));
		const next = TABS[(i + step + TABS.length) % TABS.length]!;
		onTab(next.id);
		(e.currentTarget.querySelector(`[data-tab="${next.id}"]`) as HTMLElement | null)?.focus();
	};
	const i0 = TABS.findIndex((t) => t.id === tab);
	return (
		<nav className="card rail" role="tablist" aria-orientation="vertical" onKeyDown={onKey}>
			{TABS.map((t) => (
				<button
					key={t.id}
					type="button"
					role="tab"
					data-tab={t.id}
					aria-selected={t.id === tab}
					tabIndex={t.id === tab || (i0 < 0 && t.id === 'overview') ? 0 : -1}
					className={t.id === tab ? 'rail-item on' : 'rail-item'}
					onClick={() => onTab(t.id)}
				>
					<span className="rail-icon"><Icon name={t.icon} /></span>
					{TEXT.tabs[t.id]}
				</button>
			))}
		</nav>
	);
};
