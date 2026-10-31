import * as THREE from 'three';
import gsap from 'gsap';

export class BirthdayCake {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.candles = [];
    this.flames = [];
    this.flameLights = [];
    this.smokeParticles = [];
    this.isBlown = false;

    this.createCake();
    this.createCandles();
    this.createDecorations();
    this.createSmokeSystem();

    this.scene.add(this.group);
  }

  createCake() {
    // Cake pedestal plate
    const plateGeo = new THREE.CylinderGeometry(4.4, 4.0, 0.35, 48);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xffe4e6,
      metalness: 0.6,
      roughness: 0.2,
      emissive: 0x331122,
      emissiveIntensity: 0.2
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = -0.15;
    plate.castShadow = true;
    plate.receiveShadow = true;
    this.group.add(plate);

    // Bottom tier (Strawberry cream)
    const tier1Geo = new THREE.CylinderGeometry(3.5, 3.5, 1.8, 48);
    const tier1Mat = new THREE.MeshStandardMaterial({
      color: 0xf472b6, // pastel pink
      roughness: 0.4,
      metalness: 0.05
    });
    const tier1 = new THREE.Mesh(tier1Geo, tier1Mat);
    tier1.position.y = 0.9;
    tier1.castShadow = true;
    tier1.receiveShadow = true;
    this.group.add(tier1);

    // Frosting drip / belt 1
    const belt1Geo = new THREE.TorusGeometry(3.52, 0.12, 16, 48);
    const belt1Mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3
    });
    const belt1 = new THREE.Mesh(belt1Geo, belt1Mat);
    belt1.rotation.x = Math.PI / 2;
    belt1.position.y = 1.8;
    this.group.add(belt1);

    // Middle tier (Vanilla Cream)
    const tier2Geo = new THREE.CylinderGeometry(2.5, 2.5, 1.5, 48);
    const tier2Mat = new THREE.MeshStandardMaterial({
      color: 0xfef08a, // soft vanilla
      roughness: 0.4,
      metalness: 0.05
    });
    const tier2 = new THREE.Mesh(tier2Geo, tier2Mat);
    tier2.position.y = 2.55;
    tier2.castShadow = true;
    tier2.receiveShadow = true;
    this.group.add(tier2);

    // Belt 2
    const belt2 = new THREE.Mesh(new THREE.TorusGeometry(2.52, 0.1, 16, 48), belt1Mat);
    belt2.rotation.x = Math.PI / 2;
    belt2.position.y = 3.3;
    this.group.add(belt2);

    // Top tier (Velvet glaze)
    const tier3Geo = new THREE.CylinderGeometry(1.6, 1.6, 1.3, 48);
    const tier3Mat = new THREE.MeshStandardMaterial({
      color: 0xfb7185, // rose coral
      roughness: 0.35,
      metalness: 0.1
    });
    const tier3 = new THREE.Mesh(tier3Geo, tier3Mat);
    tier3.position.y = 3.95;
    tier3.castShadow = true;
    tier3.receiveShadow = true;
    this.group.add(tier3);
  }

  createDecorations() {
    // Cream rosettes on tier 1
    const rosetteGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const rosetteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const x = Math.cos(angle) * 3.3;
      const z = Math.sin(angle) * 3.3;
      const rosette = new THREE.Mesh(rosetteGeo, rosetteMat);
      rosette.position.set(x, 1.85, z);
      rosette.scale.set(1, 0.8, 1);
      this.group.add(rosette);
    }

    // Strawberries / berries on tier 2
    const berryGeo = new THREE.ConeGeometry(0.22, 0.38, 16);
    const berryMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.3 });
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + 0.3;
      const x = Math.cos(angle) * 2.3;
      const z = Math.sin(angle) * 2.3;
      const berry = new THREE.Mesh(berryGeo, berryMat);
      berry.rotation.x = Math.PI;
      berry.position.set(x, 3.45, z);
      this.group.add(berry);
    }
  }

  createCandles() {
    // 3 Birthday Candles on top tier
    const candlePositions = [
      { x: 0, z: 0 },
      { x: -0.65, z: 0.35 },
      { x: 0.65, z: 0.35 }
    ];

    candlePositions.forEach((pos, idx) => {
      // Candle wax
      const candleGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.1, 16);
      const candleMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0xf43f5e : 0xfbbf24,
        roughness: 0.2
      });
      const candle = new THREE.Mesh(candleGeo, candleMat);
      candle.position.set(pos.x, 4.6 + 0.55, pos.z);
      candle.castShadow = true;
      this.group.add(candle);
      this.candles.push(candle);

      // Candle wick
      const wickGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8);
      const wickMat = new THREE.MeshBasicMaterial({ color: 0x27272a });
      const wick = new THREE.Mesh(wickGeo, wickMat);
      wick.position.set(pos.x, 5.25, pos.z);
      this.group.add(wick);

      // Flame group
      const flameGroup = new THREE.Group();
      flameGroup.position.set(pos.x, 5.45, pos.z);

      // Flame core
      const flameGeo = new THREE.ConeGeometry(0.12, 0.42, 16);
      flameGeo.translate(0, 0.21, 0);
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0xfffbeb,
        transparent: true,
        opacity: 0.95
      });
      const flameMesh = new THREE.Mesh(flameGeo, flameMat);
      flameGroup.add(flameMesh);

      // Flame outer glow
      const outerGeo = new THREE.ConeGeometry(0.2, 0.55, 16);
      outerGeo.translate(0, 0.25, 0);
      const outerMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
      });
      const outerMesh = new THREE.Mesh(outerGeo, outerMat);
      flameGroup.add(outerMesh);

      // Flame PointLight
      const flameLight = new THREE.PointLight(0xffedd5, 1.8, 12);
      flameLight.position.set(0, 0.25, 0);
      flameGroup.add(flameLight);

      this.group.add(flameGroup);
      this.flames.push(flameGroup);
      this.flameLights.push(flameLight);
    });
  }

  createSmokeSystem() {
    // Simple particle system for candle smoke after blow-out
    const particleCount = 45;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const alphas = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100; // initially hidden
      positions[i * 3 + 2] = 0;
      alphas[i] = 0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xd4d4d8,
      size: 0.25,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });

    this.smokeMesh = new THREE.Points(geo, mat);
    this.group.add(this.smokeMesh);
  }

  update(time) {
    // Gentle rotation of the cake
    this.group.rotation.y += 0.003;

    // Flickering candle flame animation
    if (!this.isBlown) {
      this.flames.forEach((flame, idx) => {
        const flicker = Math.sin(time * 12 + idx * 2.3) * 0.08 + Math.cos(time * 8 + idx) * 0.04;
        flame.scale.set(1 + flicker, 1 + flicker * 1.5, 1 + flicker);
        flame.rotation.z = Math.sin(time * 6 + idx) * 0.08;

        if (this.flameLights[idx]) {
          this.flameLights[idx].intensity = 1.8 + Math.sin(time * 15 + idx) * 0.3;
        }
      });
    }
  }

  blowOut(onComplete) {
    if (this.isBlown) return;
    this.isBlown = true;

    // Animate flames shrinking and disappearing
    this.flames.forEach((flame, idx) => {
      gsap.to(flame.scale, {
        x: 0.001,
        y: 0.001,
        z: 0.001,
        duration: 0.6,
        delay: idx * 0.1,
        ease: 'power2.in',
        onComplete: () => {
          flame.visible = false;
        }
      });

      if (this.flameLights[idx]) {
        gsap.to(this.flameLights[idx], {
          intensity: 0,
          duration: 0.6,
          delay: idx * 0.1
        });
      }
    });

    // Spawn smoke puff
    this.triggerSmoke();

    if (onComplete) {
      setTimeout(onComplete, 800);
    }
  }

  triggerSmoke() {
    const posAttr = this.smokeMesh.geometry.attributes.position;
    const positions = posAttr.array;
    const candlePos = [
      { x: 0, z: 0 },
      { x: -0.65, z: 0.35 },
      { x: 0.65, z: 0.35 }
    ];

    let pIdx = 0;
    candlePos.forEach(c => {
      for (let i = 0; i < 15; i++) {
        const idx = pIdx * 3;
        positions[idx] = c.x + (Math.random() - 0.5) * 0.1;
        positions[idx + 1] = 5.3;
        positions[idx + 2] = c.z + (Math.random() - 0.5) * 0.1;

        gsap.to({ y: positions[idx + 1], x: positions[idx], opacity: 0.8 }, {
          y: 7.2 + Math.random() * 1.5,
          x: positions[idx] + (Math.random() - 0.5) * 0.8,
          opacity: 0,
          duration: 1.8 + Math.random() * 0.8,
          delay: Math.random() * 0.3,
          ease: 'power1.out',
          onUpdate: function () {
            positions[idx] = this.targets()[0].x;
            positions[idx + 1] = this.targets()[0].y;
            posAttr.needsUpdate = true;
          }
        });
        pIdx++;
      }
    });
  }
}
