// The forecast engine's tuning: numbers that are safe to change, kept apart from what players see.

export const SETTINGS = {
	// a play is random: each one is simulated this many times and averaged, like the official sim
	runsPerPlay: 2,
	// the local estimate: each map's newest this many real plays at the queue's rate
	localPlays: 5,
	// calibration simulates each real play again: the newest this many per map
	calibrationPlays: 5,
	// between simulator calls (the API allows 1200 a minute)
	callSpacingMs: 55,
	// when the simulator is busy: seconds to wait before each new try
	retryWaitsSec: [2, 4, 8, 16, 32],
};
