// Every word players see, in one place (Google developer style: sentence case, second person, plain words).

export const TEXT = {
	name: 'Queue Helper',
	shortcut: 'Alt+Shift+F · Esc',
	close: 'Close',

	tabs: {
		overview: 'Overview',
		xp: 'XP',
		levels: 'Levels',
		jam: 'Jam',
		suggest: 'Suggest',
	},
	comingSoon: 'Coming soon',

	scan: {
		lookAhead: 'Look ahead',
		hoursUnit: 'h',
		scan: 'Scan',
		stop: 'Stop',
		never: 'Not scanned yet',
		reading: 'Reading your character and queue',
		simulating: 'Simulating the queue',
		waiting: (sec: number) => `The simulator is busy, trying again in ${sec}s`,
		stopped: 'Scan stopped',
		ago: (text: string) => `Scanned ${text}`,
	},

	// the game's stages, by the ids the rules use
	stages: {
		cold: ['Cold', 'Play harder maps to warm up.'],
		warming: ['Warming up', 'Play harder maps to reach Peak.'],
		peak: ['Peak', 'Your physical skills are at their best.'],
		pushing: ['Past Peak', 'Play easier maps to come back to it.'],
		fatigued: ['Fatigued', 'You earn less XP. Play easier maps to rest.'],
	} as Record<string, [string, string]>,

	overview: {
		start: 'Press Scan to forecast the queue you’re playing.',
		peakIn: (d: string) => `Peak in ${d}`,
		leavesPeakIn: (d: string) => `Leaves Peak in ${d}`,
		peakAll: (h: number) => `In Peak for the next ${h} h`,
		penaltyIn: (d: string) => `XP Penalty in ${d}`,
		penaltyNow: 'XP Penalty now',
		endIn: (stage: string, h: number) => `${stage} in ${h} h`,
		endLine: (h: number, pct: string, stage: string) => `In ${h} h: ${pct}, ${stage}`,
		noPenalty: 'No XP Penalty',
		penaltyLine: (d: string) => `XP Penalty in ${d}`,
		hoverLine: (d: string) => `In ${d}: `,
		hoverSub: (stage: string, minutes: number) => `${stage} · ${minutes} min of strain`,
		graph: 'Strain over time',
		graphNext: (h: number) => `next ${h} hours`,
		now: 'Now',
		peak: 'Peak',
		penalty: 'XP Penalty',
		queue: 'Queue Forecast',
		loop: (n: number, d: string) => `Loop of ${n}, ${d}`,
		cols: { starts: 'Starts', map: 'Map', xp: 'XP', strain: 'Strain / length', bar: 'Bar' },
		failed: 'Fails',
		heats: 'Warms you up',
		cools: 'Cools you down',
	},

	errors: {
		noSimulator: 'This version of the game gives add-ons no simulator. Update oss!idle.',
		noCharacter: 'Your character couldn’t be read. Sign in, then scan again.',
		noDatabase: 'The game hasn’t opened its database yet. Try again in a moment.',
		noQueue: 'No queue found. Start a playlist or queue so the dock at the bottom shows it.',
		emptyQueue: 'The queue is empty.',
		noForecast: (mode: string) => `Forecasts aren’t available for ${mode} yet.`,
		unknown: 'Something went wrong. Scan again, or tell Rai if it keeps happening.',
		crashed: 'This part of Queue Helper stopped working.',
	} as Record<string, string | ((mode: string) => string)>,
};
