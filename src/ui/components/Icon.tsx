// The few icons the window uses, drawn inline (an add-on can't load an icon font). Outline style, 24px grid.

const PATHS = {
	gauge: 'M12 13l3-3 M5.6 18.4a9 9 0 1 1 12.8 0 M12 13a1 1 0 1 0 0.01 0',
	chart: 'M4 19h16 M4 15l4-5 4 3 4-6 4 4',
	stairs: 'M4 18h4v-4h4v-4h4V6h4',
	brain: 'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1z M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1',
	bulb: 'M9 18h6 M10 21h4 M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z',
	close: 'M6 6l12 12 M18 6L6 18',
	refresh: 'M20 11a8 8 0 1 0-2.3 5.7 M20 4v7h-7',
} as const;

export type IconName = keyof typeof PATHS;

export const Icon = ({ name }: { name: IconName }) => (
	<svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
		<path d={PATHS[name]} />
	</svg>
);
