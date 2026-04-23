import confetti from 'canvas-confetti';

const PALETTE = ['#e84242', '#3fa14a', '#3a7be0', '#f6c628', '#8b55c8', '#f08a2a'];

/** small pop when a sub-board resolves */
export function celebrateSubBoard(originX = 0.5, originY = 0.5) {
  confetti({
    particleCount: 55,
    spread: 70,
    startVelocity: 28,
    gravity: 0.9,
    ticks: 120,
    origin: { x: originX, y: originY },
    colors: PALETTE,
    scalar: 0.9,
  });
}

/** big celebration when someone clinches the match */
export function celebrateMatch() {
  const end = Date.now() + 1500;
  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 75,
      origin: { x: 0, y: 0.7 },
      colors: PALETTE,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 75,
      origin: { x: 1, y: 0.7 },
      colors: PALETTE,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
  // one big central burst
  confetti({
    particleCount: 160,
    spread: 110,
    origin: { x: 0.5, y: 0.45 },
    colors: PALETTE,
    scalar: 1.2,
  });
}
