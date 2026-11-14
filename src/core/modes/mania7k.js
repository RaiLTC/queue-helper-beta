// 7K (oss!idle 1.5.0.0, shared/rulesets/mania/7k). The server's simulator is still 4K only, so there is no forecast:
// the add-on shows 7K's strain as it is now. Its progress lives in its own table, character_mania7k.

/** @type {import('./index.js').Mode} */
export const MANIA_7K = {
	id: 'mania7k',
	name: '7K',
	skills: ['accuracy', 'speed', 'stamina', 'jacks', 'independence', 'ln', 'technical', 'focus', 'sv', 'memory'],
	skillNames: {
		accuracy: 'Accuracy', speed: 'Speed', stamina: 'Stamina', jacks: 'Jacks', independence: 'Independence', ln: 'LN',
		technical: 'Technical', focus: 'Focus', sv: 'SV', memory: 'Memory',
	},
	physical: ['speed', 'stamina', 'jacks', 'ln'],
	progress: { table: 'character_mania7k', key: 'characterId' },
	// the genetics ring (shared/rulesets/mania/7k/genes.ts RING_7K)
	ring: ['accuracy', 'ln', 'independence', 'speed', 'stamina', 'jacks', 'technical', 'sv', 'memory', 'focus'],
	forecast: false,
};
