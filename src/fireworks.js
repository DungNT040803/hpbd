import confetti from 'canvas-confetti';
import { sound } from './audio.js';

export function launchBirthdayFireworks() {
  const duration = 6 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Play initial explosion sound
  sound.playFirework();

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Left firework rocket
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#f43f5e', '#fbbf24', '#38bdf8', '#a855f7', '#ffffff']
    });

    // Right firework rocket
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#ec4899', '#fde047', '#34d399', '#60a5fa', '#f472b6']
    });

    // Random sound bursts
    if (Math.random() > 0.6) {
      sound.playFirework();
    }
  }, 350);

  // Heart shower in center
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 100,
      origin: { y: 0.6 },
      shapes: ['star'],
      colors: ['#ffed4a', '#ff76ac', '#fd5d93', '#c084fc']
    });
  }, 1200);
}
