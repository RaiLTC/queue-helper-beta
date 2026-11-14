import { TEXT } from '../../text.js';
import type { View } from '../store.js';
import { Icon, type IconName } from './Icon.js';

type Props = { version: string, view: View, unread: boolean, onView: (view: View) => void, onClose: () => void };

const HeaderButton = ({ icon, label, on, dot, onClick }: { icon: IconName, label: string, on?: boolean, dot?: boolean, onClick: () => void }) => (
	<button type="button" className={on ? 'icon-btn on' : 'icon-btn'} aria-label={dot ? `${label} (${TEXT.header.unread})` : label} aria-pressed={on} title={label} onClick={onClick}>
		<Icon name={icon} />
		{dot && <span className="dot" aria-hidden="true" />}
	</button>
);

export const Header = ({ version, view, unread, onView, onClose }: Props) => (
	<header className="head">
		<span className="title">{TEXT.name}</span>
		<span className="muted">v{version}</span>
		<span className="muted head-keys">{TEXT.shortcut}</span>
		<HeaderButton icon="news" label={TEXT.header.whatsNew} on={view === 'whatsnew'} dot={unread} onClick={() => onView(view === 'whatsnew' ? 'overview' : 'whatsnew')} />
		<HeaderButton icon="settings" label={TEXT.header.settings} on={view === 'settings'} onClick={() => onView(view === 'settings' ? 'overview' : 'settings')} />
		<span className="head-sep" />
		<HeaderButton icon="close" label={TEXT.close} onClick={onClose} />
	</header>
);
