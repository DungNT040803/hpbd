import * as THREE from 'three';

// Procedural textures to guarantee 100% round, glowing, and beautiful particles with ZERO squares
export function createGlowCircleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 240, 245, 0.9)');
  gradient.addColorStop(0.5, 'rgba(244, 63, 94, 0.4)');
  gradient.addColorStop(0.8, 'rgba(168, 85, 247, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createSparkleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Radial center
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 48);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.25, 'rgba(254, 240, 138, 0.8)');
  gradient.addColorStop(0.6, 'rgba(251, 191, 36, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  // Cross star rays
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 16);
  ctx.lineTo(64, 112);
  ctx.moveTo(16, 64);
  ctx.lineTo(112, 64);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(32, 32);
  ctx.lineTo(96, 96);
  ctx.moveTo(96, 32);
  ctx.lineTo(32, 96);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createHeartTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(244, 63, 94, 0.95)';
  ctx.shadowColor = 'rgba(251, 113, 133, 0.8)';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  const d = Math.min(64, 64);
  const k = 32;
  ctx.moveTo(k, k + 14);
  ctx.bezierCurveTo(k, k + 9, k - 18, k + 3, k - 18, k - 8);
  ctx.bezierCurveTo(k - 18, k - 20, k - 2, k - 18, k, k - 7);
  ctx.bezierCurveTo(k + 2, k - 18, k + 18, k - 20, k + 18, k - 8);
  ctx.bezierCurveTo(k + 18, k + 3, k, k + 9, k, k + 14);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
