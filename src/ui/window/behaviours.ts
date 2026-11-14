// How the window lives alongside the game while it's open: click outside, Esc, click-through over game menus, the
// chat cut-out, and rescanning when the queue is edited.
//
// Performance: nothing here runs on a timer or on mouse moves. The game's menus, chat and queue only change when the
// player clicks or presses a key, so the checks run once after each of those (at most once a frame), and every
// listener exists only while the window is open. Sitting still, the add-on does nothing at all.
// Fading while the mouse is away is CSS (:hover), so it costs no script either.

import { movedOn, queueKey, readQueue } from '../../core/game.js';
import type { Store } from '../store.js';
import { addonsPageOpen, editQueueOpen, modsMenuOpen, openChat, optionsOpen, opensEditQueue } from './gameUi.js';

type Options = {
	store: Store,
	/** The window element, inside the overlay's shadow root. */
	windowEl: () => HTMLElement | null,
	close: () => void,
	/** A quick scan after the queue was edited. */
	rescan: () => void,
};

const RESCAN_WAIT_MS = 1000;

export const attachWindowBehaviours = ({ store, windowEl, close, rescan }: Options): (() => void) => {
	let frame = 0, rescanTimer: ReturnType<typeof setTimeout> | undefined;

	const check = () => {
		frame = 0;
		const s = store.get().settings;
		const win = windowEl();

		// a game menu open under the window: clicks go through it, and it turns see-through (hidden on Add-ons)
		const passThrough = s.passGameMenus && addonsPageOpen() ? 0
			: s.passGameMenus && optionsOpen() ? 0.1
				: s.passModsMenu && modsMenuOpen() ? s.fadeOpacity / 100 : null;

		// the open chat shows through: the part of the window over it is cut out
		let chatHole = '';
		const chat = s.chatThrough ? openChat() : null;
		if (chat && win) {
			const r = win.getBoundingClientRect(), c = chat.getBoundingClientRect();
			const x1 = Math.max(c.left, r.left) - r.left, y1 = Math.max(c.top, r.top) - r.top;
			const x2 = Math.min(c.right, r.right) - r.left, y2 = Math.min(c.bottom, r.bottom) - r.top;
			if (x2 > x1 && y2 > y1) {
				const px = (v: number) => `${Math.round(v)}px`, w = px(r.width), h = px(r.height);
				chatHole = `polygon(evenodd, 0 0, ${w} 0, ${w} ${h}, 0 ${h}, 0 0, ${px(x1)} ${px(y1)}, ${px(x2)} ${px(y1)}, ${px(x2)} ${px(y2)}, ${px(x1)} ${px(y2)}, ${px(x1)} ${px(y1)})`;
			}
		}
		// a game menu opening or closing under the window holds off the fade, as opening the window does
		const menuChanged = (passThrough === null) !== (store.get().passThrough === null);
		store.set({ passThrough, chatHole, ...(menuChanged ? { fade: 'hold' as const } : {}) });

		// the queue was edited (not just played through): scan again once the edits settle
		const { forecast, scan } = store.get();
		if (s.rescanOnChange && forecast && scan.status !== 'scanning') {
			const queue = readQueue();
			const now = queue && queue.entries.length ? queueKey(queue.entries) : null;
			if (now && now.join() !== forecast.queueKey.join() && !movedOn(forecast.queueKey, now)) {
				clearTimeout(rescanTimer);
				rescanTimer = setTimeout(rescan, RESCAN_WAIT_MS);
			}
		}
	};
	const soon = () => { if (!frame) frame = requestAnimationFrame(check); };

	// a click outside closes the window, as set; never while editing the queue, nor on a game menu it lets through
	const onPointerDown = (e: PointerEvent) => {
		const win = windowEl();
		// the overlay's host stands for everything inside its shadow root
		const host = win ? (win.getRootNode() as ShadowRoot).host : null;
		if (!win || (host && e.composedPath().includes(host))) return;
		const target = e.target instanceof Element ? e.target : null;
		const s = store.get();
		if (!target || editQueueOpen() || opensEditQueue(target) || s.passThrough !== null) return;
		if (target.closest('.options__container.open, .community-chat-container.is-enabled')) return;
		if (s.settings.clickOutside === 'nothing') return;
		if (s.settings.clickOutside === 'close') {
			// the game doesn't get this click: stop it, and the release and click after it
			e.preventDefault();
			e.stopPropagation();
			const swallow = (ev: Event) => { ev.preventDefault(); ev.stopPropagation(); };
			for (const type of ['pointerup', 'mouseup', 'click']) window.addEventListener(type, swallow, { capture: true, once: true });
			setTimeout(() => { for (const type of ['pointerup', 'mouseup', 'click']) window.removeEventListener(type, swallow, { capture: true }); }, 600);
		}
		close();
	};

	// Esc closes the window; while the game's menu or chat is open, that Esc is theirs. While editing the queue,
	// "close both" lets it go on to the game too, which closes Edit Queue.
	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key !== 'Escape') return;
		if (optionsOpen() || addonsPageOpen() || openChat()) return;
		if (!(store.get().settings.escEditing === 'both' && editQueueOpen())) {
			e.preventDefault();
			e.stopPropagation();
		}
		close();
	};

	const listen: [string, EventListener, AddEventListenerOptions][] = [
		['pointerdown', onPointerDown as EventListener, { capture: true }],
		['keydown', onKeyDown as EventListener, { capture: true }],
		['pointerup', soon, { capture: true, passive: true }],
		['keyup', soon, { capture: true, passive: true }],
		['resize', soon, { passive: true }],
	];
	for (const [type, fn, opts] of listen) window.addEventListener(type, fn, opts);
	soon();

	return () => {
		cancelAnimationFrame(frame);
		clearTimeout(rescanTimer);
		for (const [type, fn, opts] of listen) window.removeEventListener(type, fn, opts);
		store.set({ passThrough: null, chatHole: '' });
	};
};
