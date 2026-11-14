// Numbers and times as players read them. Intl does the number work; the times are short enough to write out.

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

/** 18400 → "18.4K". */
export const xpText = (n: number): string => compact.format(Math.round(n));

/** 0.263 → "26%". */
export const pctText = (bar: number): string => `${Math.round(bar * 100)}%`;

/** Seconds as "1 h 24 min", "45 min" or "2 h". */
export const durText = (sec: number): string => {
	const total = Math.max(0, Math.round(sec / 60));
	const h = Math.floor(total / 60), m = total % 60;
	if (!h) return `${m} min`;
	return m ? `${h} h ${m} min` : `${h} h`;
};

/** Seconds as the ghost needle's short label: "1h40m", "2h", "30m". */
export const durShort = (sec: number): string => {
	const total = Math.max(0, Math.round(sec / 60));
	const h = Math.floor(total / 60), m = total % 60;
	if (!h) return `${m}m`;
	return m ? `${h}h${m}m` : `${h}h`;
};

/** Seconds from now as a clock: "0:05", "1:40". */
export const clockText = (sec: number): string => `${Math.floor(sec / 3600)}:${String(Math.floor(sec / 60) % 60).padStart(2, '0')}`;

/** Minutes as "54s", "1.8 min" or "1.2 h". */
export const lengthText = (min: number): string => {
	if (min * 60 < 59.5) return `${Math.round(min * 60)}s`;
	if (min < 59.95) return `${min.toFixed(1)} min`;
	return `${(min / 60).toFixed(1)} h`;
};

/** Milliseconds ago as "just now", "2m ago", "3h ago". */
export const agoText = (ms: number): string => {
	const m = Math.floor(ms / 60000);
	if (m < 1) return 'just now';
	if (m < 60) return `${m}m ago`;
	return `${Math.floor(m / 60)}h ago`;
};
