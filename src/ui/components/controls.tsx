// The settings page's controls, each with the ARIA role screen readers expect.

import type { ReactNode } from 'react';

export const Switch = ({ label, on, onChange }: { label: string, on: boolean, onChange: (on: boolean) => void }) => (
	<button type="button" role="switch" aria-checked={on} aria-label={label} className="switch" onClick={() => onChange(!on)} />
);

export const Stepper = ({ label, value, min, max, unit = '', onChange }: { label: string, value: number, min: number, max: number, unit?: string, onChange: (v: number) => void }) => (
	<div className="stepper" role="group" aria-label={label}>
		<button type="button" aria-label={`Less ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
		<output aria-live="polite">{value}{unit}</output>
		<button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
	</div>
);

export const Segmented = <T extends string>({ label, value, options, onChange }: { label: string, value: T, options: [T, string][], onChange: (v: T) => void }) => (
	<div className="segmented" role="radiogroup" aria-label={label}>
		{options.map(([id, text]) => (
			<button key={id} type="button" role="radio" aria-checked={id === value} onClick={() => onChange(id)}>{text}</button>
		))}
	</div>
);

export const Slider = ({ label, value, min, max, step, onChange }: { label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void }) => (
	<div className="slider">
		<input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.currentTarget.value))} />
		<output>{value}%</output>
	</div>
);

export const Row = ({ label, description, sub, disabled, children }: { label: string, description?: string, sub?: boolean, disabled?: boolean, children: ReactNode }) => (
	<div className={`setting${sub ? ' sub' : ''}${disabled ? ' disabled' : ''}`}>
		<div className="setting-label">
			<div>{label}</div>
			{description && <div className="muted">{description}</div>}
		</div>
		{children}
	</div>
);
