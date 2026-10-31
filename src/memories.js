import * as THREE from 'three';
import gsap from 'gsap';
import { createGlowCircleTexture, createSparkleTexture } from './textures.js';

export class MemoryUniverse {
  constructor(scene, memoryData, onSelectMemory) {
    this.scene = scene;
    this.memories = memoryData;
    this.onSelectMemory = onSelectMemory;
    this.cardMeshes = [];
    this.orbitParticles = [];
    this.curve = null;
    this.pathMesh = null;
    this.hoveredCard = null;

    this.glowTexture = createGlowCircleTexture();
    this.sparkleTexture = createSparkleTexture();
    this.textureLoader = new THREE.TextureLoader();

    this.initLayout();
  }

  initLayout() {
    const count = this.memories.length;
    const points = [];

    // Smooth, spacious 3D flight spline trajectory
    for (let i = 0; i < count; i++) {
      const angle = i * 0.65;
      const radius = 10 + Math.sin(i * 0.35) * 3.5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(i * 0.45) * 3.2;
      const z = -i * 14; // Evenly spaced along the path

      points.push(new THREE.Vector3(x, y, z));
    }

    // Birthday Cake platform position
    const lastPoint = points[points.length - 1];
    const cakePos = new THREE.Vector3(0, 0, lastPoint.z - 30);
    points.push(cakePos);
    this.cakePosition = cakePos;

    // CatmullRomCurve3 with smooth tension
    this.curve = new THREE.CatmullRomCurve3(points);
    this.curve.tension = 0.45;

    // Create glowing constellation line & glowing beads (NO squares!)
    this.createConstellationPath();

    // Create memory cards
    for (let i = 0; i < count; i++) {
      this.createMemoryCard(this.memories[i], points[i], i);
    }
  }

  createConstellationPath() {
    const pathPoints = this.curve.getPoints(300);
    const geometry = new THREE.BufferGeometry().setFromPoints(pathPoints);

    const material = new THREE.LineBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.35,
      linewidth: 2
    });

    this.pathMesh = new THREE.Line(geometry, material);
    this.scene.add(this.pathMesh);

    // Glowing stardust beads with round texture (NO squares!)
    const beadCount = 180;
    const beadGeo = new THREE.BufferGeometry();
    const beadPos = new Float32Array(beadCount * 3);
    for (let i = 0; i < beadCount; i++) {
      const p = this.curve.getPoint(i / beadCount);
      beadPos[i * 3] = p.x + (Math.random() - 0.5) * 1.8;
      beadPos[i * 3 + 1] = p.y + (Math.random() - 0.5) * 1.8;
      beadPos[i * 3 + 2] = p.z + (Math.random() - 0.5) * 1.8;
    }
    beadGeo.setAttribute('position', new THREE.BufferAttribute(beadPos, 3));

    const beadMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 1.2,
      map: this.glowTexture, // 100% circular glowing texture!
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.beadPoints = new THREE.Points(beadGeo, beadMat);
    this.scene.add(this.beadPoints);
  }

  createBadgeSprite(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');

    // Rounded badge background with subtle glow
    ctx.fillStyle = 'rgba(15, 12, 30, 0.88)';
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(4, 4, 272, 64, 24);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${text}`, 140, 36);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.2, 0.82, 1);
    return sprite;
  }

  createPlayBadgeSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 54;
    const ctx = canvas.getContext('2d');

    // Pill background
    ctx.fillStyle = 'rgba(244, 63, 94, 0.9)';
    ctx.beginPath();
    ctx.roundRect(2, 2, 156, 50, 25);
    ctx.fill();

    // Play icon triangle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(28, 16);
    ctx.lineTo(44, 27);
    ctx.lineTo(28, 38);
    ctx.fill();

    // "Video" text
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('VIDEO', 56, 28);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 0.48, 1);
    return sprite;
  }

  createMemoryCard(memory, position, index) {
    const cardGroup = new THREE.Group();
    cardGroup.position.copy(position);

    // Face towards camera path
    cardGroup.lookAt(position.x * 0.15, position.y * 0.15, position.z + 16);

    // Card dimensions
    const width = 5.2;
    const height = 4.4;
    const depth = 0.12;

    // Outer frame (Polaroid/Glass style)
    const frameGeo = new THREE.BoxGeometry(width, height, depth);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xfdf2f8, // soft white rose
      roughness: 0.15,
      metalness: 0.05,
      transparent: true,
      opacity: 0.96
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.castShadow = true;
    cardGroup.add(frameMesh);

    // Photo Plane
    const photoWidth = width - 0.55;
    const photoHeight = height - 0.95;
    const photoGeo = new THREE.PlaneGeometry(photoWidth, photoHeight);

    const photoMat = new THREE.MeshBasicMaterial({
      color: 0x1e1b4b
    });

    if (memory.thumb) {
      this.textureLoader.load(
        memory.thumb,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          photoMat.color.setHex(0xffffff);
          photoMat.map = tex;
          photoMat.needsUpdate = true;
        },
        undefined,
        (err) => console.warn('Could not load thumb:', memory.thumb)
      );
    }

    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMesh.position.set(0, 0.2, depth / 2 + 0.01);
    cardGroup.add(photoMesh);

    // Glowing halo backplate
    const haloGeo = new THREE.PlaneGeometry(width + 0.35, height + 0.35);
    const haloMat = new THREE.MeshBasicMaterial({
      color: memory.type === 'video' ? 0xf43f5e : 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, 0, -depth / 2 - 0.01);
    cardGroup.add(haloMesh);

    // Memory badge floating above card (timeless title, no dates)
    const badge = this.createBadgeSprite(`✨ Kỷ Niệm ${index + 1}`);
    badge.position.set(0, height / 2 + 0.75, 0.1);
    cardGroup.add(badge);

    // Sleek Video Badge at the bottom-right corner (NOT covering faces!)
    if (memory.type === 'video') {
      const videoBadge = this.createPlayBadgeSprite();
      videoBadge.position.set(photoWidth / 2 - 0.8, -photoHeight / 2 + 0.5, depth / 2 + 0.05);
      cardGroup.add(videoBadge);
    }

    // Orbiting starlight sparkles with SPARKLE texture (NO squares!)
    const orbGeo = new THREE.BufferGeometry();
    const orbCount = 16;
    const orbPos = new Float32Array(orbCount * 3);
    for (let p = 0; p < orbCount; p++) {
      const rad = 2.9 + Math.random() * 0.7;
      const th = (p / orbCount) * Math.PI * 2;
      orbPos[p * 3] = Math.cos(th) * rad;
      orbPos[p * 3 + 1] = Math.sin(th) * (rad * 0.75);
      orbPos[p * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    orbGeo.setAttribute('position', new THREE.BufferAttribute(orbPos, 3));

    const orbMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.85,
      map: this.sparkleTexture, // 4-pointed radiant sparkle star!
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const orbPoints = new THREE.Points(orbGeo, orbMat);
    cardGroup.add(orbPoints);

    // Raycast metadata
    frameMesh.userData = {
      isMemoryCard: true,
      index: index,
      memory: memory,
      group: cardGroup,
      initialPos: cardGroup.position.clone(),
      initialRot: cardGroup.rotation.clone(),
      haloMesh: haloMesh,
      orbPoints: orbPoints
    };

    photoMesh.userData = frameMesh.userData;

    this.cardMeshes.push(frameMesh);
    this.orbitParticles.push(orbPoints);
    this.scene.add(cardGroup);
  }

  getPointPosition(index) {
    if (index >= this.memories.length) {
      return this.cakePosition;
    }
    return this.cardMeshes[index].userData.initialPos;
  }

  handleHover(intersectedMesh) {
    if (intersectedMesh && intersectedMesh.userData.isMemoryCard) {
      const card = intersectedMesh.userData;
      if (this.hoveredCard !== card) {
        if (this.hoveredCard) {
          gsap.to(this.hoveredCard.group.scale, { x: 1, y: 1, z: 1, duration: 0.35, ease: 'power2.out' });
          this.hoveredCard.haloMesh.material.opacity = 0.35;
        }

        this.hoveredCard = card;
        gsap.to(card.group.scale, { x: 1.12, y: 1.12, z: 1.12, duration: 0.4, ease: 'back.out(1.5)' });
        card.haloMesh.material.opacity = 0.85;
        document.body.style.cursor = 'pointer';
      }
    } else {
      if (this.hoveredCard) {
        gsap.to(this.hoveredCard.group.scale, { x: 1, y: 1, z: 1, duration: 0.35, ease: 'power2.out' });
        this.hoveredCard.haloMesh.material.opacity = 0.35;
        this.hoveredCard = null;
        document.body.style.cursor = 'default';
      }
    }
  }

  handleClick(intersectedMesh) {
    if (intersectedMesh && intersectedMesh.userData.isMemoryCard) {
      const memory = intersectedMesh.userData.memory;
      const index = intersectedMesh.userData.index;
      if (this.onSelectMemory) {
        this.onSelectMemory(memory, index);
      }
      return true;
    }
    return false;
  }

  update(time, delta) {
    // Silky smooth floating bobbing
    this.cardMeshes.forEach((mesh, idx) => {
      const group = mesh.userData.group;
      const initialPos = mesh.userData.initialPos;
      group.position.y = initialPos.y + Math.sin(time * 1.4 + idx * 0.6) * 0.16;

      const orb = mesh.userData.orbPoints;
      if (orb) {
        orb.rotation.z += delta * 0.6;
      }
    });

    if (this.beadPoints) {
      this.beadPoints.rotation.z = Math.sin(time * 0.2) * 0.04;
    }
  }
}
