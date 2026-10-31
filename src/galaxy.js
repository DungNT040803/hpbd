import * as THREE from 'three';

export class CosmicGalaxy {
  constructor(scene) {
    this.scene = scene;
    this.shootingStars = [];
    this.createStarfield();
    this.createNebulae();
    this.createMeteors();
  }

  createStarfield() {
    const starCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const colorPalette = [
      new THREE.Color(0xffffff), // Pure white
      new THREE.Color(0x38bdf8), // Cyan starlight
      new THREE.Color(0xf472b6), // Soft rose pink
      new THREE.Color(0xfde047), // Warm golden
      new THREE.Color(0xa855f7)  // Nebula purple
    ];

    for (let i = 0; i < starCount; i++) {
      // Spherical distribution with radius between 80 and 450
      const radius = 80 + Math.random() * 370;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 2.2 + 0.6;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Star texture generator (soft round particle with glow)
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(240, 245, 255, 0.85)');
    grad.addColorStop(0.6, 'rgba(200, 220, 255, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const starTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 1.6,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  createNebulae() {
    // Canvas texture for soft nebula cloud
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 100, 200, 0.6)');
    grad.addColorStop(0.4, 'rgba(120, 40, 200, 0.3)');
    grad.addColorStop(0.8, 'rgba(30, 10, 80, 0.1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const nebulaTexture = new THREE.CanvasTexture(canvas);
    this.nebulaGroup = new THREE.Group();

    const nebulaColors = [0xdb2777, 0x7c3aed, 0x0284c7, 0xf59e0b];
    for (let i = 0; i < 12; i++) {
      const mat = new THREE.SpriteMaterial({
        map: nebulaTexture,
        color: nebulaColors[i % nebulaColors.length],
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(mat);
      const angle = (i / 12) * Math.PI * 2;
      const dist = 90 + Math.random() * 60;
      sprite.position.set(
        Math.cos(angle) * dist,
        (Math.random() - 0.5) * 60,
        Math.sin(angle) * dist
      );
      const scale = 70 + Math.random() * 50;
      sprite.scale.set(scale, scale, 1);
      this.nebulaGroup.add(sprite);
    }

    this.scene.add(this.nebulaGroup);
  }

  createMeteors() {
    // Shooting stars pool
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array([0, 0, 0, -8, 5, 8]);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

      const mat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0
      });

      const meteor = new THREE.Line(geo, mat);
      meteor.userData = {
        active: false,
        speed: 1.5,
        timer: Math.random() * 5
      };
      this.shootingStars.push(meteor);
      this.scene.add(meteor);
    }
  }

  update(delta, time) {
    // Slow cosmological rotation
    if (this.stars) {
      this.stars.rotation.y += delta * 0.012;
      this.stars.rotation.x += delta * 0.005;
    }

    if (this.nebulaGroup) {
      this.nebulaGroup.rotation.y += delta * 0.008;
    }

    // Update shooting stars
    this.shootingStars.forEach(m => {
      m.userData.timer -= delta;
      if (m.userData.timer <= 0 && !m.userData.active) {
        // Reset shooting star
        m.userData.active = true;
        m.material.opacity = 1;
        const startX = (Math.random() - 0.5) * 160;
        const startY = 40 + Math.random() * 60;
        const startZ = (Math.random() - 0.5) * 160;
        m.position.set(startX, startY, startZ);
        m.userData.speed = 45 + Math.random() * 30;
      }

      if (m.userData.active) {
        m.position.x += m.userData.speed * delta;
        m.position.y -= (m.userData.speed * 0.6) * delta;
        m.position.z -= (m.userData.speed * 0.8) * delta;
        m.material.opacity -= delta * 0.8;

        if (m.material.opacity <= 0) {
          m.userData.active = false;
          m.userData.timer = 3 + Math.random() * 6; // next shooting star in 3-9s
        }
      }
    });
  }
}
