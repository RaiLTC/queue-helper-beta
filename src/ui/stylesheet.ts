// The window's one stylesheet: the shared rules (design tokens first), then each component's own file, which sits
// next to its component. The build inlines every .css file as text; joined here, the window still gets a single
// stylesheet in its shadow root.

import base from './styles.css';
import controls from './components/controls.css';
import gauge from './components/Gauge.css';
import header from './components/Header.css';
import icon from './components/Icon.css';
import queueForecast from './components/QueueForecast.css';
import rail from './components/Rail.css';
import scanBar from './components/ScanBar.css';
import strainBar from './components/StrainBar.css';
import strainGraph from './components/StrainGraph.css';
import strainSummary from './components/StrainSummary.css';
import settingsPage from './pages/SettingsPage.css';
import whatsNew from './pages/WhatsNew.css';
import xpPage from './pages/XpPage.css';

export const STYLESHEET = [
	base, icon, header, rail, scanBar,
	gauge, strainSummary, strainBar, strainGraph, queueForecast,
	controls, settingsPage, whatsNew, xpPage,
].join('\n');
