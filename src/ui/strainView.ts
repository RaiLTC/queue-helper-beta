// What the gauge and the bar show: the forecast's strain (now, and the ghost needle at the end of the look-ahead or
// the graph's hovered time), or, in a mode without a forecast (7K), the strain as it is now.

import { sampleAt, type Forecast, type Sample } from '../core/scan.js';
import type { StrainNow } from '../core/strainNow.js';
import { type Store, useStore } from './store.js';

export type StrainView = {
	bar: number,
	minutes: number,
	knots: number[],
	/** The ghost needle: where and when, or null without a forecast. */
	ghost: { sample: Sample, t: number } | null,
	hoverT: number | null,
	forecast: Forecast | null,
	/** The mode's name when it has no forecast yet. */
	noForecast: string | null,
};

export const useStrainView = (store: Store): StrainView | null => {
	const forecast = useStore(store, (s) => s.forecast);
	const strainNow: StrainNow | null = useStore(store, (s) => s.strainNow);
	const unsupported = useStore(store, (s) => s.unsupported);
	const hoverT = useStore(store, (s) => s.hoverT);
	if (unsupported) {
		return strainNow ? { bar: strainNow.bar, minutes: strainNow.minutes, knots: strainNow.knots, ghost: null, hoverT: null, forecast: null, noForecast: unsupported } : null;
	}
	if (!forecast) return null;
	const sample = hoverT === null ? forecast.samples[forecast.samples.length - 1]! : sampleAt(forecast.samples, hoverT);
	return {
		bar: forecast.now.bar, minutes: forecast.now.minutes, knots: forecast.knots,
		ghost: { sample, t: hoverT ?? forecast.hours * 3600 }, hoverT, forecast, noForecast: null,
	};
};
