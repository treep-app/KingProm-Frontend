/**
 * Guest reveal effects — mirrors backend REVEAL_EFFECTS for template editor + guest UI.
 */

export const REVEAL_EFFECTS = [
  {
    id: 'fireworks',
    label: 'Fireworks (anime)',
    description: 'Rockets, radial bursts, spark trails, and soft screen flashes',
  },
  { id: 'confetti', label: 'Confetti blast', description: 'Shower of confetti' },
  { id: 'treasure-chest', label: 'Treasure chest opening', description: 'Chest lid opens with a golden glow' },
  { id: 'slot-machine', label: 'Slot machine spin', description: 'Reels spin then land on a win' },
  { id: 'crystal-ball', label: 'Magic crystal ball', description: 'Mystical smoke swirls in a crystal ball' },
  { id: 'pop-balloon', label: 'Pop balloon', description: 'Balloon pops to uncover the prize' },
  { id: 'electric-shock', label: 'Electric shock reveal', description: 'Lightning crackle around the card' },
  { id: 'applause', label: 'Clapping hands', description: 'Cheering hands celebrate the win' },
  { id: 'break-ice', label: 'Break the ice', description: 'Ice sheet shatters away' },
  { id: 'dynamite', label: 'Dynamite countdown', description: '3… 2… 1… boom!' },
  { id: 'spotlight', label: 'Spotlight reveal', description: 'Stage spotlight on your code' },
  { id: 'card-flip', label: 'Card flip', description: '3D flip to the winning side' },
];

export const REVEAL_MODES = [
  { id: 'scratch', label: 'Scratch foil', description: 'Guest scratches gold foil to reveal' },
  { id: 'tap', label: 'Tap to reveal', description: 'Single tap plays the effect, then shows the code' },
];

export const DEFAULT_REVEAL_EFFECT = 'fireworks';
export const DEFAULT_REVEAL_MODE = 'scratch';

/** Approximate playback length (ms) for scheduling reveal completion. */
export const REVEAL_EFFECT_DURATIONS = {
  fireworks: 3400,
  confetti: 2200,
  'treasure-chest': 2400,
  'slot-machine': 2800,
  'crystal-ball': 2600,
  'pop-balloon': 1600,
  'electric-shock': 1800,
  applause: 2200,
  'break-ice': 2000,
  dynamite: 3200,
  spotlight: 2200,
  'card-flip': 1400,
};

export function normalizeExperience(exp = {}) {
  const raw = exp && typeof exp === 'object' ? exp : {};
  const effectIds = new Set(REVEAL_EFFECTS.map((e) => e.id));
  const modeIds = new Set(REVEAL_MODES.map((m) => m.id));
  return {
    revealEffect: effectIds.has(raw.revealEffect) ? raw.revealEffect : DEFAULT_REVEAL_EFFECT,
    revealMode: modeIds.has(raw.revealMode) ? raw.revealMode : DEFAULT_REVEAL_MODE,
  };
}

export function effectDurationMs(effectId) {
  return REVEAL_EFFECT_DURATIONS[effectId] || 2200;
}