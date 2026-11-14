// What the add-on needs to know about the game's own screens. Each is one cheap query, run only after the player
// does something (see behaviours.ts), never on a timer.

export const editQueueOpen = (): boolean => !document.querySelector('.dock__source') && !!document.querySelector('.dock');
export const modsMenuOpen = (): boolean => editQueueOpen() && !!document.querySelector('.mod-select');
export const optionsOpen = (): boolean => !!document.querySelector('.options__container.open');
export const addonsPageOpen = (): boolean => [...document.querySelectorAll('.page__title')].some((el) => el.textContent?.trim() === 'Add-ons');
export const openChat = (): Element | null => document.querySelector('.community-chat-container.is-enabled');

/** A click on the dock, or on a button that opens Edit Queue: the window makes way instead of closing. */
export const opensEditQueue = (el: Element): boolean => {
	if (el.closest('.dock, [class*="dock__"]')) return true;
	const btn = el.closest('button, a, [role="button"]');
	return !!btn && /edit\s+(the\s+)?queue/i.test(`${btn.textContent} ${btn.getAttribute('title') ?? ''} ${btn.getAttribute('aria-label') ?? ''}`);
};
