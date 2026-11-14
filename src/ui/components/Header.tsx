import { TEXT } from '../../text.js';
import { Icon } from './Icon.js';

export const Header = ({ version, onClose }: { version: string, onClose: () => void }) => (
	<header className="head">
		<span className="title">{TEXT.name}</span>
		<span className="muted">v{version}</span>
		<span className="muted head-keys">{TEXT.shortcut}</span>
		<button type="button" className="icon-btn" aria-label={TEXT.close} title={TEXT.close} onClick={onClose}>
			<Icon name="close" />
		</button>
	</header>
);
