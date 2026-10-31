import * as THREE from 'three';
import gsap from 'gsap';

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

    this.textureLoader = new THREE.TextureLoader();
    this.initLayout();
  }

  initLayout() {
    const count = this.memories.length;
    const points = [];

    // Construct 3D Celestial Ribbon / Spiral trajectory
    for (let i = 0; i < count; i++) {
      const angle = i * 0.75;
      const radius = 12 + Math.sin(i * 0.4) * 3;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(i * 0.5) * 4;
      const z = -i * 12; // Travelling forward into Z-negative

      points.push(new THREE.Vector3(x, y, z));
    }

    // Add final point for Birthday Cake platform
    const lastPoint = points[points.length - 1];
    const cakePos = new THREE.Vector3(0, 0, lastPoint.z - 28);
    points.push(cakePos);
    this.cakePosition = cakePos;

    // CatmullRomCurve3 for smooth camera flight track
    this.curve = new THREE.CatmullRomCurve3(points);
    this.curve.tension = 0.5;

    // Create glowing constellation line along the path
    this.createConstellationPath();

    // Create memory cards
    for (let i = 0; i < count; i++) {
      this.createMemoryCard(this.memories[i], points[i], i);
    }
  }

  createConstellationPath() {
    const pathPoints = this.curve.getPoints(250);
    const geometry = new THREE.BufferGeometry().setFromPoints(pathPoints);

    const material = new THREE.LineBasicMaterial({
      color: 0xec4899,
      transparent: true,
      opacity: 0.4,
      linewidth: 2
    });

    this.pathMesh = new THREE.Line(geometry, material);
    this.scene.add(this.pathMesh);

    // Glowing stardust beads along the line
    const beadCount = 120;
    const beadGeo = new THREE.BufferGeometry();
    const beadPos = new Float32Array(beadCount * 3);
    for (let i = 0; i < beadCount; i++) {
      const p = this.curve.getPoint(i / beadCount);
      beadPos[i * 3] = p.x + (Math.random() - 0.5) * 1.5;
      beadPos[i * 3 + 1] = p.y + (Math.random() - 0.5) * 1.5;
      beadPos[i * 3 + 2] = p.z + (Math.random() - 0.5) * 1.5;
    }
    beadGeo.setAttribute('position', new THREE.BufferAttribute(beadPos, 3));
    const beadMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    this.beadPoints = new THREE.Points(beadGeo, beadMat);
    this.scene.add(this.beadPoints);
  }

  createBadgeSprite(text, year) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');

    // Rounded badge background
    ctx.fillStyle = 'rgba(23, 23, 37, 0.85)';
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(4, 4, 248, 64, 20);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${text}`, 128, 36);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.8, 0.78, 1);
    return sprite;
  }

  createMemoryCard(memory, position, index) {
    const cardGroup = new THREE.Group();
    cardGroup.position.copy(position);

    // Subtle face-towards-camera orientation
    cardGroup.lookAt(position.x * 0.2, position.y * 0.2, position.z + 18);

    // Card dimensions
    const width = 4.8;
    const height = 4.2;
    const depth = 0.12;

    // Outer frame (Polaroid/Glass style)
    const frameGeo = new THREE.BoxGeometry(width, height, depth);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.95
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.castShadow = true;
    cardGroup.add(frameMesh);

    // Photo Plane
    const photoWidth = width - 0.5;
    const photoHeight = height - 0.9;
    const photoGeo = new THREE.PlaneGeometry(photoWidth, photoHeight);

    // Default placeholder material
    const photoMat = new THREE.MeshBasicMaterial({
      color: 0x3b0764
    });

    // Load actual thumbnail
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

    // Glowing border edge
    const borderGeo = new THREE.PlaneGeometry(width + 0.12, height + 0.12);
    const borderMat = new THREE.MeshBasicMaterial({
      color: memory.type === 'video' ? 0xf43f5e : 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.set(0, 0, -depth / 2 - 0.01);
    cardGroup.add(borderMesh);

    // Date badge floating above card
    const badge = this.createBadgeSprite(`✨ ${memory.date}`, memory.year);
    badge.position.set(0, height / 2 + 0.75, 0.1);
    cardGroup.add(badge);

    // Video icon badge if video
    if (memory.type === 'video') {
      const playIconGeo = new THREE.CircleGeometry(0.5, 32);
      const playIconMat = new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        transparent: true,
        opacity: 0.9
      });
      const playIcon = new THREE.Mesh(playIconGeo, playIconMat);
      playIcon.position.set(0, 0.2, depth / 2 + 0.05);
      cardGroup.add(playIcon);
    }

    // Floating Starlight Orbiting Particles around card
    const orbGeo = new THREE.BufferGeometry();
    const orbCount = 14;
    const orbPos = new Float32Array(orbCount * 3);
    for (let p = 0; p < orbCount; p++) {
      const rad = 2.8 + Math.random() * 0.8;
      const th = (p / orbCount) * Math.PI * 2;
      orbPos[p * 3] = Math.cos(th) * rad;
      orbPos[p * 3 + 1] = Math.sin(th) * (rad * 0.8);
      orbPos[p * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    orbGeo.setAttribute('position', new THREE.BufferAttribute(orbPos, 3));
    const orbMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.35,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const orbPoints = new THREE.Points(orbGeo, orbMat);
    cardGroup.add(orbPoints);

    // Save metadata for raycasting & interaction
    frameMesh.userData = {
      isMemoryCard: true,
      index: index,
      memory: memory,
      group: cardGroup,
      initialScale: 1,
      initialPos: cardGroup.position.clone(),
      initialRot: cardGroup.rotation.clone(),
      borderMesh: borderMesh,
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
        // Reset previous
        if (this.hoveredCard) {
          gsap.to(this.hoveredCard.group.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
          this.hoveredCard.borderMesh.material.opacity = 0.45;
        }

        this.hoveredCard = card;
        gsap.to(card.group.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.35, ease: 'back.out(1.7)' });
        card.borderMesh.material.opacity = 0.95;
        document.body.style.cursor = 'pointer';
      }
    } else {
      if (this.hoveredCard) {
        gsap.to(this.hoveredCard.group.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        this.hoveredCard.borderMesh.material.opacity = 0.45;
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
    // Gentle floating bobbing for cards & rotating orbit particles
    this.cardMeshes.forEach((mesh, idx) => {
      const group = mesh.userData.group;
      const initialPos = mesh.userData.initialPos;
      group.position.y = initialPos.y + Math.sin(time * 1.5 + idx * 0.7) * 0.15;

      const orb = mesh.userData.orbPoints;
      if (orb) {
        orb.rotation.z += delta * 0.8;
      }
    });

    if (this.beadPoints) {
      this.beadPoints.rotation.z = Math.sin(time * 0.2) * 0.05;
    }
  }
}
