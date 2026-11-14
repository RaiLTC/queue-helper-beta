/**
 * Queue Helper for oss!idle: forecasts what the queue you're playing does to your strain and XP.
 *
 * The game imports this file and calls `mount` / `unmount`, and asks `canUpdate` before an auto-update.
 * `defineAddon` builds the first two from the class in QueueHelper.tsx.
 */

import { defineAddon } from '@oss-idle/addon-sdk';
import { QueueHelper } from './QueueHelper.js';

let running: QueueHelper | undefined;

export const { mount, unmount } = defineAddon(() => (running = new QueueHelper()));

/** The game holds an auto-update while this says no: not in the middle of a scan. */
export const canUpdate = (): boolean => running?.canUpdate() ?? true;
