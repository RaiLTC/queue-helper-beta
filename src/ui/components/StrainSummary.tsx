// The two lines under the gauge (or beside the bar): what happens next and where the look-ahead ends, or, while the
// graph is hovered, where you are at that moment. In a mode without a forecast: the stage's advice, and why there's
// no forecast. Always two single lines in a box of fixed size, so nothing moves or resizes.

import { TEXT } from '../../text.js';
import { durText, pctText } from '../format.js';
import type { StrainView } from '../strainView.js';
import { endLine, headline } from '../summary.js';
import { stageName, zoneOf } from '../zones.js';

export const StrainSummary = ({ view }: { view: StrainView }) => {
	const { forecast, ghost, hoverT } = view;
	let first, second;
	if (!forecast || !ghost) {
		first = TEXT.stages[zoneOf(view.bar).id]?.[1] ?? '';
		second = TEXT.overview.noForecastYet(view.noForecast ?? '');
	} else if (hoverT === null) {
		first = headline(forecast);
		second = endLine(forecast);
	} else {
		first = <>{TEXT.overview.hoverLine(durText(hoverT))}<span style={{ color: zoneOf(ghost.sample.bar).color }}>{pctText(ghost.sample.bar)}</span></>;
		second = TEXT.overview.hoverSub(stageName(ghost.sample.bar), Math.round(ghost.sample.minutes));
	}
	return (
		<div className="summary">
			<div className="summary-line">{first}</div>
			<div className="muted">{second}</div>
		</div>
	);
};
