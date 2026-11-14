// The two lines under the gauge (or beside the bar): what happens next and where the look-ahead ends, or, while the
// graph is hovered, where you are at that moment. Always two single lines in a box of fixed size, so hovering the
// graph never moves or resizes anything.

import type { Forecast, Sample } from '../../core/scan.js';
import { TEXT } from '../../text.js';
import { durText, pctText } from '../format.js';
import { endLine, headline } from '../summary.js';
import { stageName, zoneOf } from '../zones.js';

export const StrainSummary = ({ f, hoverT, at }: { f: Forecast, hoverT: number | null, at: Sample }) => (
	<div className="summary">{hoverT === null ? (
		<>
			<div className="summary-line">{headline(f)}</div>
			<div className="muted">{endLine(f)}</div>
		</>
	) : (
		<>
			<div className="summary-line">
				{TEXT.overview.hoverLine(durText(hoverT))}
				<span style={{ color: zoneOf(at.bar).color }}>{pctText(at.bar)}</span>
			</div>
			<div className="muted">{TEXT.overview.hoverSub(stageName(at.bar), Math.round(at.minutes))}</div>
		</>
	)}</div>
);
