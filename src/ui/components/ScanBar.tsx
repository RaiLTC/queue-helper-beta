// Look ahead, the scan's progress (or when the last one ran), and Scan / Stop.
// While scanning, only the progress text and the bar's transform change: no layout work.

import { useEffect, useState } from 'react';
import { TEXT } from '../../text.js';
import { agoText } from '../format.js';
import { type Store, useStore } from '../store.js';

export const ScanBar = ({ store, onScan, onStop }: { store: Store, onScan: () => void, onStop: () => void }) => {
	const scan = useStore(store, (s) => s.scan);
	const lookAhead = useStore(store, (s) => s.lookAhead);
	const scannedAt = useStore(store, (s) => s.forecast?.scannedAt ?? 0);
	const scanning = scan.status === 'scanning';

	// "Scanned 2m ago" stays current: a redraw every 30 seconds, only while it's on screen
	const [, tick] = useState(0);
	useEffect(() => {
		if (!scannedAt || scanning) return;
		const id = setInterval(() => tick((n) => n + 1), 30000);
		return () => clearInterval(id);
	}, [scannedAt, scanning]);

	// the field follows the look-ahead (it changes with the Default look ahead setting) but can be typed in freely
	const [text, setText] = useState(String(lookAhead));
	useEffect(() => setText(String(lookAhead)), [lookAhead]);
	const setHours = (value: string) => {
		setText(value);
		const n = Math.round(Number(value));
		if (n >= 1 && n <= 24) store.set({ lookAhead: n });
	};

	return (
		<div className="card scan">
			<label className="field">
				<span className="field-label">{TEXT.scan.lookAhead}</span>
				<input
					inputMode="numeric"
					value={text}
					aria-label={`${TEXT.scan.lookAhead} (hours)`}
					maxLength={2}
					onChange={(e) => setHours(e.currentTarget.value)}
					onKeyDown={(e) => { if (e.key === 'Enter' && !scanning) onScan(); }}
				/>
				<span className="field-unit">{TEXT.scan.hoursUnit}</span>
			</label>
			<div className="scan-mid" aria-live="polite">
				{scanning ? (
					<>
						<div className="scan-line">
							<span>{scan.text}</span>
							<span className="muted">{Math.round(scan.done * 100)}%</span>
						</div>
						<div className="progress"><i style={{ transform: `scaleX(${1 - scan.done})` }} /></div>
					</>
				) : scan.status === 'error' ? (
					<span className="error">{scan.message}</span>
				) : (
					<span className="muted right">{scannedAt ? TEXT.scan.ago(agoText(Date.now() - scannedAt)) : TEXT.scan.never}</span>
				)}
			</div>
			{scanning
				? <button type="button" className="btn btn-stop" onClick={onStop}>{TEXT.scan.stop}</button>
				: <button type="button" className="btn" onClick={onScan}>{TEXT.scan.scan}</button>}
		</div>
	);
};
