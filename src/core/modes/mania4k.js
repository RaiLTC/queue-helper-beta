/** @type {import('./index.js').Mode} */
export const MANIA_4K = {
	id: 'mania4k',
	name: '4K',
	skills: ['accuracy', 'speed', 'stamina', 'jackspeed', 'coordination', 'release', 'reading', 'consistency', 'concentration', 'speedjam', 'memory'],
	skillNames: {
		accuracy: 'Accuracy', speed: 'Speed', stamina: 'Stamina', jackspeed: 'Jack Speed', coordination: 'Coordination', release: 'Release',
		reading: 'Technical', consistency: 'Consistency', concentration: 'Concentration', speedjam: 'Speed Jam', memory: 'Memory',
	},
	physical: ['speed', 'stamina', 'jackspeed', 'coordination'],
	progress: { table: 'character', key: 'id' },
	// the genetics ring (shared/rulesets/mania/4k/genes.ts RING)
	ring: ['accuracy', 'release', 'coordination', 'speed', 'stamina', 'consistency', 'jackspeed', 'reading', 'speedjam', 'memory', 'concentration'],
	forecast: true,
};
