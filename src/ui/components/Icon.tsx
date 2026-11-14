// The window's icons, drawn inline (an add-on can't load an icon font).
// Paths from Tabler Icons 3.19.0 (outline), MIT licence, https://tabler.io/icons

const PATHS = {
	gauge: ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0', 'M13.41 10.59l2.59 -2.59', 'M7 12a5 5 0 0 1 5 -5'],
	chart: ['M4 19l16 0', 'M4 15l4 -6l4 2l4 -5l4 4'],
	stairs: ['M22 6h-5v5h-5v5h-5v5h-5', 'M6 10v-7', 'M3 6l3 -3l3 3'],
	brain: [
		'M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8', 'M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8',
		'M17.5 16a3.5 3.5 0 0 0 0 -7h-.5', 'M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0', 'M6.5 16a3.5 3.5 0 0 1 0 -7h.5', 'M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10',
	],
	bulb: ['M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7', 'M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3', 'M9.7 17l4.6 0'],
	close: ['M18 6l-12 12', 'M6 6l12 12'],
} as const;

export type IconName = keyof typeof PATHS;

export const Icon = ({ name }: { name: IconName }) => (
	<svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
		{PATHS[name].map((d) => <path key={d} d={d} />)}
	</svg>
);
