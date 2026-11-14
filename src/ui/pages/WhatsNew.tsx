// What's new: the notice, then the releases from CHANGELOG.md, newest first and open, the rest folded.
// Versions newer than the one the player last saw carry a New tag for this visit.

import { useState } from 'react';
import { RELEASES } from '../../generated/changelog.js';
import { TEXT } from '../../text.js';

const T = TEXT.whatsNew;

/** Whether version a comes after b (1.2.10 after 1.2.9; "0.1.02" reads as 0.1.2). */
export const newer = (a: string, b: string): boolean => {
	const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
	for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
		const d = (pa[i] ?? 0) - (pb[i] ?? 0);
		if (d) return d > 0;
	}
	return false;
};

export const latestVersion = (): string => RELEASES[0]?.version ?? '';

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
/** "2026-11-14" → "14 Nov 2026"; anything else as written. */
const dateText = (iso: string): string => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? dateFormat.format(new Date(`${iso}T00:00:00Z`)) : iso);

export const WhatsNew = ({ seenBefore }: { seenBefore: string }) => {
	const [open, setOpen] = useState<Set<string>>(() => new Set([latestVersion()]));
	const toggle = (v: string) => setOpen((o) => { const n = new Set(o); if (n.has(v)) n.delete(v); else n.add(v); return n; });

	return (
		<div className="page">
			<h2 className="page-title">{T.title}</h2>
			<div className="notice" role="note">{T.notice}</div>
			{RELEASES.map((r) => {
				const isOpen = open.has(r.version);
				return (
					<section key={r.version} className={`card release${isOpen ? ' open' : ''}`}>
						<button type="button" className="release-head" aria-expanded={isOpen} onClick={() => toggle(r.version)}>
							<span className="release-version">{r.version}</span>
							<span className="muted">{dateText(r.date)}</span>
							{(!seenBefore || newer(r.version, seenBefore)) && <span className="tag">{T.new}</span>}
							<svg className="icon chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6l6 -6" /></svg>
						</button>
						{isOpen && (
							<div className="release-body">
								{r.sections.map((sec) => (
									<div key={sec.kind}>
										<p className="release-kind">{sec.kind}</p>
										<ul>{sec.items.map((item) => <li key={item}>{item}</li>)}</ul>
									</div>
								))}
							</div>
						)}
					</section>
				);
			})}
			<a className="link" href={T.fullUrl} target="_blank" rel="noreferrer">{T.full}</a>
		</div>
	);
};
