import * as THREE from 'three';

// Procedural textures for luxury artisan birthday cake
export function createBottomTierTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Fondant base gradient (velvety ruby rose)
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#f43f5e');
  grad.addColorStop(0.5, '#e11d48');
  grad.addColorStop(1, '#9f1239');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle vertical fluted cake ribs
  for (let x = 0; x < 1024; x += 16) {
    ctx.fillStyle = x % 32 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(x, 0, 8, 512);
  }

  // Golden ornamental floral swirls along the center
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = 0; x <= 1024; x += 64) {
    ctx.arc(x + 32, 256, 24, 0, Math.PI, false);
    ctx.arc(x + 32, 256, 12, Math.PI, 0, false);
  }
  ctx.stroke();

  // Gold dust sparkles
  for (let i = 0; i < 300; i++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(254, 240, 138, 0.7)' : 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(px, py, Math.random() * 3 + 1, Math.random() * 3 + 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

export function createMiddleTierTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Ivory Vanilla Cream Fondant
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#fef9c3');
  grad.addColorStop(0.5, '#fef08a');
  grad.addColorStop(1, '#fde047');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Quilted diamond grid lines
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)';
  ctx.lineWidth = 2;

  const step = 64;
  for (let x = -512; x < 1536; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 512, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, 512);
    ctx.lineTo(x + 512, 0);
    ctx.stroke();
  }

  // Pearl beads at diamond intersections
  for (let y = 0; y <= 512; y += step / 2) {
    const shift = (y / (step / 2)) % 2 === 0 ? 0 : step / 2;
    for (let x = shift; x <= 1024; x += step) {
      const pGrad = ctx.createRadialGradient(x, y, 1, x, y, 5);
      pGrad.addColorStop(0, '#ffffff');
      pGrad.addColorStop(0.4, '#fde68a');
      pGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

export function createTopTierTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Strawberry glossy cream
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#fda4af');
  grad.addColorStop(0.6, '#f43f5e');
  grad.addColorStop(1, '#e11d48');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Glossy marble swirls
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  for (let y = 50; y < 512; y += 80) {
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(256, y - 40, 512, y + 40, 768, y - 20);
    ctx.bezierCurveTo(896, y - 40, 960, y + 20, 1024, y);
  }
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 1);
  return texture;
}

export function createCandleSpiralTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Pearlescent white base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 512);

  // Candy gold & rose spiral stripes
  ctx.fillStyle = '#f43f5e';
  for (let y = -256; y < 768; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y + 128);
    ctx.lineTo(256, y + 160);
    ctx.lineTo(0, y + 32);
    ctx.fill();
  }

  ctx.fillStyle = '#fbbf24';
  for (let y = -256; y < 768; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y + 32);
    ctx.lineTo(256, y + 160);
    ctx.lineTo(256, y + 172);
    ctx.lineTo(0, y + 44);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 2);
  return texture;
}

export function createFlameGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.2, 'rgba(255, 230, 120, 0.85)');
  grad.addColorStop(0.5, 'rgba(255, 100, 20, 0.45)');
  grad.addColorStop(0.8, 'rgba(244, 63, 94, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

