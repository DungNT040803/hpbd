import * as THREE from 'three';
import { createGlowCircleTexture, createSparkleTexture, createHeartTexture } from './textures.js';

export class CosmicGalaxy {
  constructor(scene) {
    this.scene = scene;
    this.shootingStars = [];
    this.glowTexture = createGlowCircleTexture();
    this.sparkleTexture = createSparkleTexture();
    this.heartTexture = createHeartTexture();

    this.createSpiralMilkyWay();
    this.createDeepStarfield();
    this.createFloatingHearts();
    this.createNebulaeClouds();
    this.createMeteors();
  }

  // Majestic dense 4-arm Spiral Galaxy with 22,000 stars
  createSpiralMilkyWay() {
    const parameters = {
      count: 22000,
      size: 1.8,
      radius: 180,
      branches: 4,
      spin: 1.2,
      randomness: 0.55,
      power: 3.5,
      insideColor: '#ffe066',  // Warm glowing star core
      midColor: '#f43f5e',     // Rose romantic nebula
      outsideColor: '#38bdf8'  // Deep cyan starlight
    };

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const scales = new Float32Array(parameters.count);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorMid = new THREE.Color(parameters.midColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
      // Radius from center
      const r = Math.pow(Math.random(), parameters.power) * parameters.radius;
      const spinAngle = r * parameters.spin;
      const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

      // Randomness spread
      const randomX = Math.pow(Math.random(), 2.2) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;
      const randomY = Math.pow(Math.random(), 2.2) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * (r * 0.45);
      const randomZ = Math.pow(Math.random(), 2.2) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;

      positions[i * 3] = Math.cos(branchAngle + spinAngle) * r + randomX;
      positions[i * 3 + 1] = randomY - 20; // lower slightly below the memory path
      positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ - 100;

      // Color gradient from center to edge
      const mixedColor = colorInside.clone();
      const progress = r / parameters.radius;
      if (progress < 0.4) {
        mixedColor.lerp(colorMid, progress / 0.4);
      } else {
        mixedColor.copy(colorMid).lerp(colorOutside, (progress - 0.4) / 0.6);
      }

      // Add a sprinkle of white/gold sparkle
      if (Math.random() > 0.88) {
        mixedColor.setHex(0xffffff);
      }

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      scales[i] = Math.random() * 2.2 + 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: parameters.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: this.glowTexture,
      transparent: true,
      opacity: 0.95
    });

    this.spiralGalaxy = new THREE.Points(geometry, material);
    this.scene.add(this.spiralGalaxy);
  }

  // Surrounding 360-degree deep space starfield (8,000 stars)
  createDeepStarfield() {
    const count = 8000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xfde047),
      new THREE.Color(0xf472b6),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xc084fc)
    ];

    for (let i = 0; i < count; i++) {
      const radius = 120 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi) - 80;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.4,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: this.sparkleTexture,
      transparent: true,
      opacity: 0.88
    });

    this.deepStars = new THREE.Points(geometry, material);
    this.scene.add(this.deepStars);
  }

  // Floating glowing romantic hearts in space
  createFloatingHearts() {
    const heartCount = 75;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(heartCount * 3);

    this.heartInitialY = new Float32Array(heartCount);
    this.heartSpeeds = new Float32Array(heartCount);

    for (let i = 0; i < heartCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = -Math.random() * 320; // along the timeline path

      this.heartInitialY[i] = y;
      this.heartSpeeds[i] = 0.5 + Math.random() * 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 3.2,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      map: this.heartTexture,
      transparent: true,
      opacity: 0.82
    });

    this.heartMesh = new THREE.Points(geometry, material);
    this.scene.add(this.heartMesh);
  }

  // Colorful soft volumetric nebula clouds
  createNebulaeClouds() {
    this.nebulaGroup = new THREE.Group();
    const colors = [0xf43f5e, 0x8b5cf6, 0x06b6d4, 0xf59e0b];

    for (let i = 0; i < 20; i++) {
      const mat = new THREE.SpriteMaterial({
        map: this.glowTexture,
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(mat);
      const angle = (i / 20) * Math.PI * 2;
      const dist = 60 + Math.random() * 90;
      sprite.position.set(
        Math.cos(angle) * dist,
        (Math.random() - 0.5) * 45,
        -i * 16
      );
      const scale = 50 + Math.random() * 45;
      sprite.scale.set(scale, scale, 1);
      this.nebulaGroup.add(sprite);
    }

    this.scene.add(this.nebulaGroup);
  }

  createMeteors() {
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array([0, 0, 0, -12, 8, 12]);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

      const mat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        linewidth: 2
      });

      const meteor = new THREE.Line(geo, mat);
      meteor.userData = {
        active: false,
        speed: 55,
        timer: 1 + Math.random() * 4
      };
      this.shootingStars.push(meteor);
      this.scene.add(meteor);
    }
  }

  update(delta, time) {
    // Gentle hypnotic rotation of the spiral galaxy
    if (this.spiralGalaxy) {
      this.spiralGalaxy.rotation.y += delta * 0.025;
    }

    if (this.deepStars) {
      this.deepStars.rotation.y -= delta * 0.005;
      this.deepStars.rotation.x += delta * 0.003;
    }

    if (this.nebulaGroup) {
      this.nebulaGroup.rotation.z += delta * 0.006;
    }

    // Animate floating hearts
    if (this.heartMesh) {
      const pos = this.heartMesh.geometry.attributes.position.array;
      const count = pos.length / 3;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] = this.heartInitialY[i] + Math.sin(time * this.heartSpeeds[i] + i) * 1.5;
      }
      this.heartMesh.geometry.attributes.position.needsUpdate = true;
    }

    // Shooting stars
    this.shootingStars.forEach(m => {
      m.userData.timer -= delta;
      if (m.userData.timer <= 0 && !m.userData.active) {
        m.userData.active = true;
        m.material.opacity = 0.95;
        const startX = (Math.random() - 0.5) * 140;
        const startY = 30 + Math.random() * 50;
        const startZ = -Math.random() * 260;
        m.position.set(startX, startY, startZ);
        m.userData.speed = 55 + Math.random() * 40;
      }

      if (m.userData.active) {
        m.position.x += m.userData.speed * delta;
        m.position.y -= (m.userData.speed * 0.6) * delta;
        m.position.z -= (m.userData.speed * 0.75) * delta;
        m.material.opacity -= delta * 0.9;

        if (m.material.opacity <= 0) {
          m.userData.active = false;
          m.userData.timer = 2 + Math.random() * 5;
        }
      }
    });
  }
}
