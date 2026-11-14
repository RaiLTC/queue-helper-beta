// Game modes ("rulesets" in the game). Each one is a single description of what the add-on needs to know about it,
// so supporting a new mode means adding a file here, not editing the rest of the add-on.
//
// id: the game's ruleset id (host.ruleset.current()), for example 'mania4k'.
// skills: the mode's skill ids, as the game's database and API name them.
// skillNames: what players see for each.
// physical: the skills strain wears down.
// progress: where the game keeps the character's levels, upgrades and genetics for the mode.
// ring: the mode's genetics ring, which decides how strong its Stamina genes are.
// forecast: whether the server's simulator supports the mode, which the forecast needs.

import { MANIA_4K } from './mania4k.js';
import { MANIA_7K } from './mania7k.js';

/** @typedef {{ id: string, name: string, skills: string[], skillNames: Record<string, string>, physical: string[], progress: { table: string, key: string }, ring: string[], forecast: boolean }} Mode */

/** @type {Record<string, Mode>} */
export const MODES = {
	'4k': MANIA_4K,
	'7k': MANIA_7K,
};

/** The mode for a ruleset id from the game, or undefined for one this version doesn't know. */
export const modeOf = (rulesetId) => Object.values(MODES).find((mode) => mode.id === rulesetId);
