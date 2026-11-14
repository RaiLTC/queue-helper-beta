// Settings: every change applies and saves at once (no Save button). Reset offers Undo instead of asking first.

import { useEffect } from 'react';
import { type AccentId, DEFAULTS, LIMITS, type Settings } from '../../settings.js';
import { TEXT } from '../../text.js';
import { Row, Segmented, Slider, Stepper, Switch } from '../components/controls.js';
import { type Store, useStore } from '../store.js';
import { colorOf } from '../zones.js';

const T = TEXT.settings;
const ACCENTS: AccentId[] = ['cold', 'warming', 'peak', 'pushing', 'fatigued', 'stage', 'custom'];
const UNDO_MS = 6000;

const Swatches = ({ value, custom, onPick }: { value: AccentId, custom: string, onPick: (id: AccentId) => void }) => (
	<div className="swatches" role="radiogroup" aria-label={T.accent}>
		{ACCENTS.map((id) => (
			<button key={id} type="button" role="radio" aria-checked={id === value} onClick={() => onPick(id)}>
				<span className={`swatch swatch-${id}`} style={id === 'custom' ? { background: custom } : id === 'stage' ? undefined : { background: colorOf(id) }} />
				{T.accents[id]}
			</button>
		))}
	</div>
);

export const SettingsPage = ({ store, onChange }: { store: Store, onChange: (patch: Partial<Settings>) => void }) => {
	const s = useStore(store, (st) => st.settings);
	const undo = useStore(store, (st) => st.undo);

	// Undo is offered for a few seconds after a reset
	useEffect(() => {
		if (!undo) return;
		const id = setTimeout(() => store.set({ undo: null }), UNDO_MS);
		return () => clearTimeout(id);
	}, [undo, store]);

	const reset = () => { const before = s; onChange({ ...DEFAULTS, seenVersion: s.seenVersion }); store.set({ undo: before }); };
	const undoReset = () => { if (undo) onChange(undo); store.set({ undo: null }); };

	return (
		<div className="page">
			<h2 className="page-title">{T.title}</h2>

			<p className="group">{T.forecast}</p>
			<div className="card list">
				<Row label={T.lookAhead}><Stepper label={T.lookAhead} value={s.lookAhead} min={LIMITS.lookAhead[0]} max={LIMITS.lookAhead[1]} unit=" h" onChange={(v) => onChange({ lookAhead: v })} /></Row>
				<Row label={T.runs} description={T.runsHelp}><Stepper label={T.runs} value={s.runsPerPlay} min={LIMITS.runsPerPlay[0]} max={LIMITS.runsPerPlay[1]} onChange={(v) => onChange({ runsPerPlay: v })} /></Row>
				<Row label={T.rescan}><Switch label={T.rescan} on={s.rescanOnChange} onChange={(v) => onChange({ rescanOnChange: v })} /></Row>
			</div>

			<p className="group">{T.appearance}</p>
			<div className="card list">
				<Row label={T.accent} description={T.accentHelp}><Swatches value={s.accent} custom={s.customAccent} onPick={(id) => onChange({ accent: id })} /></Row>
				{s.accent === 'custom' && (
					<Row label={T.customColour} sub>
						<label className="colour">
							<input type="color" value={s.customAccent} aria-label={T.customColour} onChange={(e) => onChange({ customAccent: e.currentTarget.value })} />
							<span>{s.customAccent.toUpperCase()}</span>
						</label>
					</Row>
				)}
				<Row label={T.animations} description={T.animationsHelp}><Switch label={T.animations} on={s.animations} onChange={(v) => onChange({ animations: v })} /></Row>
			</div>

			<p className="group">{T.window}</p>
			<div className="card list">
				<Row label={T.fade}><Switch label={T.fade} on={s.fade} onChange={(v) => onChange({ fade: v })} /></Row>
				<Row label={T.opacity} sub disabled={!s.fade}><Slider label={T.opacityLabel} value={s.fadeOpacity} min={LIMITS.fadeOpacity[0]} max={LIMITS.fadeOpacity[1]} step={10} onChange={(v) => onChange({ fadeOpacity: v })} /></Row>
				<Row label={T.clickOutside}><Segmented label={T.clickOutside} value={s.clickOutside} options={Object.entries(T.clickOutsideOptions) as [Settings['clickOutside'], string][]} onChange={(v) => onChange({ clickOutside: v })} /></Row>
				<Row label={T.escEditing}><Segmented label={T.escEditing} value={s.escEditing} options={Object.entries(T.escEditingOptions) as [Settings['escEditing'], string][]} onChange={(v) => onChange({ escEditing: v })} /></Row>
				<Row label={T.chat}><Switch label={T.chat} on={s.chatThrough} onChange={(v) => onChange({ chatThrough: v })} /></Row>
				<Row label={T.passMods}><Switch label={T.passMods} on={s.passModsMenu} onChange={(v) => onChange({ passModsMenu: v })} /></Row>
				<Row label={T.passMenus}><Switch label={T.passMenus} on={s.passGameMenus} onChange={(v) => onChange({ passGameMenus: v })} /></Row>
			</div>

			<div className="card list">
				<Row label={T.reset} description={T.resetHelp}><button type="button" className="btn-outline" onClick={reset}>{T.resetButton}</button></Row>
			</div>
			{undo && (
				<div className="toast" role="status">
					<span>{T.resetDone}</span>
					<button type="button" className="toast-action" onClick={undoReset}>{T.undo}</button>
				</div>
			)}
		</div>
	);
};
