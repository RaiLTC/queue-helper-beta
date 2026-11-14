// The XP page: a quick overview (the XP rate, over the look-ahead, per loop, medals and genetics), then a
// breakdown per skill or per map. Every rate follows the Per hour / minute / second choice.

import type { ReactNode } from 'react';
import { MODES } from '../../core/modes/index.js';
import type { SkillXp, XpSummary } from '../../core/scan.js';
import type { RateUnit, Settings, XpView } from '../../settings.js';
import { TEXT } from '../../text.js';
import { Segmented } from '../components/controls.js';
import { xpText } from '../format.js';
import { type Store, useStore } from '../store.js';

const T = TEXT.xp;
const SECONDS: Record<RateUnit, number> = { h: 3600, m: 60, s: 1 };
const RATE_LABEL: Record<RateUnit, string> = { h: T.perHour, m: T.perMinute, s: T.perSecond };
/** Above this far apart, the simulator and your plays disagree (amber). */
const OFF_LIMIT = 0.25;
// one colour per skill, for the bars (the stage colours stay for strain)
const SKILL_COLORS = ['#4f9cf5', '#5fc3c0', '#e8c147', '#ff66aa', '#f0883e', '#c084fc', '#7dd3fc', '#a3e635', '#fb7185', '#94a3b8', '#fcd34d'];

// the forecast engine is 4K only so far (see core/game.js SKILLS)
const nameOf = (id: string) => MODES['4k']!.skillNames[id] ?? id;
/** XP as a rate: small rates per second keep a decimal. */
const rateText = (xp: number, span: number, unit: RateUnit) => {
	const v = (xp / span) * SECONDS[unit];
	return v >= 1000 ? xpText(v) : v >= 10 ? String(Math.round(v)) : v.toFixed(1);
};
const xpLabel = (v: number) => `×${v.toFixed(2)}`;

const Stat = ({ label, children }: { label: string, children: ReactNode }) => (
	<div className="card stat"><div className="muted">{label}</div><div className="stat-value">{children}</div></div>
);

const SkillTable = ({ xp, unit, hours }: { xp: XpSummary, unit: RateUnit, hours: number }) => {
	const all = xp.skills.reduce((t, s) => t + s.total, 0) || 1;
	const top = Math.max(...xp.skills.map((s) => s.total), 1);
	const order = [...xp.skills].sort((a, b) => b.total - a.total);
	return (
		<div className="card">
			<div className="xp-row xp-skill xp-head"><span>{T.skill}</span><span /><span>{RATE_LABEL[unit]}</span><span>{T.inH(hours)}</span><span>{T.share}</span></div>
			{order.map((s) => (
				<div className="xp-row xp-skill" key={s.id}>
					<span>{nameOf(s.id)}</span>
					<span className="xp-bar"><i style={{ transform: `scaleX(${s.total / top})`, background: SKILL_COLORS[xp.skills.indexOf(s) % SKILL_COLORS.length] }} /></span>
					<span>{rateText(s.total, xp.span, unit)}</span>
					<span>{xpText(s.total)}</span>
					<span className="muted">{Math.round((s.total / all) * 100)}%</span>
				</div>
			))}
		</div>
	);
};

const offOf = (s: SkillXp) => (s.checked && s.real > 0 && s.same > 0 ? s.real / s.same - 1 : null);

const Check = ({ xp, unit }: { xp: XpSummary, unit: RateUnit }) => {
	const checked = xp.skills.filter((s) => s.checked);
	const same = checked.reduce((t, s) => t + s.same, 0), real = checked.reduce((t, s) => t + s.real, 0);
	const off = same > 0 && real > 0 ? real / same - 1 : null;
	const status = !xp.mapsPlayed ? T.checkNone
		: off === null ? T.checkNone
			: Math.abs(off) <= OFF_LIMIT ? T.checkGood(Math.round(Math.abs(off) * 100), xp.mapsPlayed, xp.mapsTotal)
				: T.checkOff(Math.round(Math.abs(off) * 100), xp.mapsPlayed, xp.mapsTotal);
	return (
		<div className="card">
			<div className="card-head">
				<span className="card-title">{T.check}</span>
				<span className={off !== null && Math.abs(off) > OFF_LIMIT ? 'muted warn' : 'muted'}>{status}</span>
			</div>
			<div className="xp-row xp-check xp-head"><span>{RATE_LABEL[unit]}</span><span>{T.simulator}</span><span>{T.withBonuses}</span><span>{T.yourPlays}</span><span>{T.offBy}</span></div>
			{xp.skills.map((s) => {
				const o = offOf(s);
				return (
					<div className="xp-row xp-check" key={s.id}>
						<span>{nameOf(s.id)}</span>
						<span className="muted">{rateText(s.sim, xp.span, unit)}</span>
						<span>{rateText(s.total, xp.span, unit)}</span>
						{/* Speed Jam and Memory follow each map's Tries, so past plays can't check them: a dash */}
						<span>{!s.checked ? <span className="muted">–</span> : s.real > 0 ? rateText(s.real, xp.span, unit) : <span className="muted">{T.notPlayed}</span>}</span>
						<span className={o === null ? 'muted' : Math.abs(o) > OFF_LIMIT ? 'warn' : 'good'}>{o === null ? '–' : `${o >= 0 ? '+' : '−'}${Math.round(Math.abs(o) * 100)}%`}</span>
					</div>
				);
			})}
		</div>
	);
};

export const XpPage = ({ store, onSettings }: { store: Store, onSettings: (patch: Partial<Settings>) => void }) => {
	const f = useStore(store, (s) => s.forecast);
	const unit = useStore(store, (s) => s.settings.rateUnit);
	const view = useStore(store, (s) => s.settings.xpView);
	const unsupported = useStore(store, (s) => s.unsupported);
	if (unsupported) return <div className="card empty">{(TEXT.errors.noForecast as (m: string) => string)(unsupported)}</div>;
	if (!f) return <div className="card empty">{TEXT.overview.start}</div>;
	const { xp } = f;
	const total = xp.skills.reduce((t, s) => t + s.total, 0);

	return (
		<>
			<div className="xp-stats">
				<Stat label={RATE_LABEL[unit]}>{rateText(total, xp.span, unit)}</Stat>
				<Stat label={T.inHours(f.hours)}>{xpText(total)}</Stat>
				<Stat label={T.perLoop}>{xp.perLoop ? xpText(xp.perLoop) : '–'}</Stat>
				<Stat label={T.medals}>{xp.medals ? xpLabel(xp.medals) : T.none}</Stat>
				<Stat label={T.genetics}>{xp.genetics ? (xp.genetics.min === xp.genetics.max ? xpLabel(xp.genetics.max) : `${xpLabel(xp.genetics.min)}–${xp.genetics.max.toFixed(2)}`) : T.none}</Stat>
			</div>
			<div className="card xp-switch">
				<Segmented<XpView> label={T.views} value={view} options={[['skill', T.bySkill], ['map', T.byMap]]} onChange={(v) => onSettings({ xpView: v })} />
				<Segmented<RateUnit> label={T.units} value={unit} options={[['h', T.perHour], ['m', T.perMinute], ['s', T.perSecond]]} onChange={(v) => onSettings({ rateUnit: v })} />
			</div>
			{view === 'skill'
				? (<><SkillTable xp={xp} unit={unit} hours={f.hours} /><Check xp={xp} unit={unit} /></>)
				: <div className="card empty">{T.mapsSoon}</div>}
		</>
	);
};
