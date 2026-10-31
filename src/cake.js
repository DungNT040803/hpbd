import * as THREE from 'three';
import gsap from 'gsap';
import {
  createBottomTierTexture,
  createMiddleTierTexture,
  createTopTierTexture,
  createCandleSpiralTexture,
  createFlameGlowTexture
} from './cake-textures.js';

export class BirthdayCake {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.candles = [];
    this.flames = [];
    this.flameLights = [];
    this.embers = null;
    this.isBlown = false;

    // Load luxury procedural textures
    this.bottomTexture = createBottomTierTexture();
    this.midTexture = createMiddleTierTexture();
    this.topTexture = createTopTierTexture();
    this.candleTexture = createCandleSpiralTexture();
    this.glowTexture = createFlameGlowTexture();

    this.createPedestal();
    this.createArtisanTiers();
    this.createGarnishes();
    this.createLuxuryCandles();
    this.createCakeTopper();
    this.createSmokeSystem();

    this.scene.add(this.group);
  }

  // 1. Luxury Gold & Porcelain Pedestal Plate
  createPedestal() {
    const standGroup = new THREE.Group();

    // Base foot
    const footGeo = new THREE.CylinderGeometry(2.8, 3.2, 0.4, 48);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2
    });
    const foot = new THREE.Mesh(footGeo, goldMat);
    foot.position.y = -0.4;
    standGroup.add(foot);

    // Marble porcelain plate
    const plateGeo = new THREE.CylinderGeometry(4.6, 4.4, 0.35, 64);
    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.1
    });
    const plate = new THREE.Mesh(plateGeo, marbleMat);
    plate.position.y = -0.15;
    plate.receiveShadow = true;
    standGroup.add(plate);

    // Gold beaded rim around the plate
    const goldRim = new THREE.Mesh(new THREE.TorusGeometry(4.62, 0.08, 16, 64), goldMat);
    goldRim.rotation.x = Math.PI / 2;
    goldRim.position.y = -0.05;
    standGroup.add(goldRim);

    this.group.add(standGroup);
  }

  // 2. High-End 3-Tier Cake with Fondant & Dripping Glaze
  createArtisanTiers() {
    // Shared materials
    const whiteCreamMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.05
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.2
    });

    // --- TIER 1: Bottom Tier (Belgian Rose Fondant & Gold Trim) ---
    const tier1Geo = new THREE.CylinderGeometry(3.6, 3.6, 1.8, 64);
    const tier1Mat = new THREE.MeshStandardMaterial({
      map: this.bottomTexture,
      roughness: 0.35,
      metalness: 0.05
    });
    const tier1 = new THREE.Mesh(tier1Geo, tier1Mat);
    tier1.position.y = 0.9;
    tier1.castShadow = true;
    tier1.receiveShadow = true;
    this.group.add(tier1);

    // Gold beaded border at bottom
    const goldBaseRing = new THREE.Mesh(new THREE.TorusGeometry(3.63, 0.06, 16, 64), goldMat);
    goldBaseRing.rotation.x = Math.PI / 2;
    goldBaseRing.position.y = 0.06;
    this.group.add(goldBaseRing);

    // Whipped white cream scalloped border atop Tier 1
    const creamBorder1 = new THREE.Mesh(new THREE.TorusGeometry(3.62, 0.12, 16, 64), whiteCreamMat);
    creamBorder1.rotation.x = Math.PI / 2;
    creamBorder1.position.y = 1.8;
    this.group.add(creamBorder1);

    // --- TIER 2: Middle Tier (Ivory Vanilla Bean Quilted Pattern) ---
    const tier2Geo = new THREE.CylinderGeometry(2.6, 2.6, 1.6, 64);
    const tier2Mat = new THREE.MeshStandardMaterial({
      map: this.midTexture,
      roughness: 0.3,
      metalness: 0.05
    });
    const tier2 = new THREE.Mesh(tier2Geo, tier2Mat);
    tier2.position.y = 2.6;
    tier2.castShadow = true;
    tier2.receiveShadow = true;
    this.group.add(tier2);

    // Cream piping belt atop Tier 2
    const creamBorder2 = new THREE.Mesh(new THREE.TorusGeometry(2.62, 0.1, 16, 64), whiteCreamMat);
    creamBorder2.rotation.x = Math.PI / 2;
    creamBorder2.position.y = 3.4;
    this.group.add(creamBorder2);

    // --- TIER 3: Top Tier (Strawberry Mirror Glaze & White Drips) ---
    const tier3Geo = new THREE.CylinderGeometry(1.65, 1.65, 1.3, 64);
    const tier3Mat = new THREE.MeshStandardMaterial({
      map: this.topTexture,
      roughness: 0.15,
      metalness: 0.08
    });
    const tier3 = new THREE.Mesh(tier3Geo, tier3Mat);
    tier3.position.y = 4.05;
    tier3.castShadow = true;
    tier3.receiveShadow = true;
    this.group.add(tier3);

    // White chocolate drip crown atop Tier 3
    const dripRing = new THREE.Mesh(new THREE.TorusGeometry(1.67, 0.09, 16, 48), whiteCreamMat);
    dripRing.rotation.x = Math.PI / 2;
    dripRing.position.y = 4.7;
    this.group.add(dripRing);
  }

  // 3. Realistic Garnishes: Strawberries, French Macarons & Cream Rosettes
  createGarnishes() {
    // --- Realistic Strawberry Builder ---
    const createStrawberry = (scale = 1.0) => {
      const sGroup = new THREE.Group();

      // Strawberry body (tapered sphere)
      const berryGeo = new THREE.SphereGeometry(0.24 * scale, 24, 24);
      berryGeo.scale(1, 1.35, 1);
      const berryMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.18,
        metalness: 0.05
      });
      const berry = new THREE.Mesh(berryGeo, berryMat);
      berry.rotation.x = Math.PI; // point downward
      sGroup.add(berry);

      // Green leafy calyx on top
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });
      for (let l = 0; l < 5; l++) {
        const leafGeo = new THREE.ConeGeometry(0.08 * scale, 0.22 * scale, 8);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        const lAngle = (l / 5) * Math.PI * 2;
        leaf.position.set(Math.cos(lAngle) * 0.1 * scale, 0.26 * scale, Math.sin(lAngle) * 0.1 * scale);
        leaf.rotation.z = Math.cos(lAngle) * 0.6;
        leaf.rotation.x = Math.sin(lAngle) * 0.6;
        sGroup.add(leaf);
      }
      return sGroup;
    };

    // --- French Macaron Builder ---
    const createMacaron = (colorHex) => {
      const mGroup = new THREE.Group();
      const shellMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35 });
      const creamMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.2 });

      // Top shell dome
      const topShell = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.12, 24), shellMat);
      topShell.position.y = 0.08;
      mGroup.add(topShell);

      // Cream filling
      const cream = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.06, 24), creamMat);
      mGroup.add(cream);

      // Bottom shell dome
      const btmShell = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.26, 0.12, 24), shellMat);
      btmShell.position.y = -0.08;
      mGroup.add(btmShell);

      return mGroup;
    };

    // Place Strawberries & Macarons on Tier 1
    const macaronColors = [0xf472b6, 0x86efac, 0xa78bfa, 0xfde047];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 3.35;
      const z = Math.sin(angle) * 3.35;

      if (i % 2 === 0) {
        const strawberry = createStrawberry(1.15);
        strawberry.position.set(x, 1.95, z);
        strawberry.rotation.y = angle;
        this.group.add(strawberry);
      } else {
        const mac = createMacaron(macaronColors[Math.floor(i / 2) % macaronColors.length]);
        mac.position.set(x, 1.95, z);
        mac.rotation.y = angle;
        mac.rotation.z = 0.25;
        this.group.add(mac);
      }
    }

    // Place Piped Cream Rosettes with Gold Dragée Pearls on Tier 2
    const pearlMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.15 });
    const rosetteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = Math.cos(angle) * 2.45;
      const z = Math.sin(angle) * 2.45;

      // Cream rosette
      const rosette = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), rosetteMat);
      rosette.scale.set(1, 0.75, 1);
      rosette.position.set(x, 3.48, z);
      this.group.add(rosette);

      // Gold pearl on top of each rosette
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), pearlMat);
      pearl.position.set(x, 3.65, z);
      this.group.add(pearl);
    }

    // Strawberries on top Tier 3
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.4;
      const x = Math.cos(angle) * 1.25;
      const z = Math.sin(angle) * 1.25;
      const s = createStrawberry(0.95);
      s.position.set(x, 4.85, z);
      this.group.add(s);
    }
  }

  // 4. Realistic Teardrop Candle Flames & Glowing Wick Embers
  createLuxuryCandles() {
    const candlePositions = [
      { x: 0, z: 0.25 },
      { x: -0.65, z: -0.2 },
      { x: 0.65, z: -0.2 }
    ];

    candlePositions.forEach((pos, idx) => {
      const candleGroup = new THREE.Group();
      candleGroup.position.set(pos.x, 4.7, pos.z);

      // Striped Candle Body
      const candleGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.15, 24);
      const candleMat = new THREE.MeshStandardMaterial({
        map: this.candleTexture,
        roughness: 0.25,
        metalness: 0.1
      });
      const candle = new THREE.Mesh(candleGeo, candleMat);
      candle.position.y = 0.58;
      candle.castShadow = true;
      candleGroup.add(candle);

      // Wax Melted Collar at top
      const waxMelt = new THREE.Mesh(
        new THREE.TorusGeometry(0.092, 0.03, 12, 24),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
      );
      waxMelt.rotation.x = Math.PI / 2;
      waxMelt.position.y = 1.15;
      candleGroup.add(waxMelt);

      // Curved braided black wick
      const wickCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 1.15, 0),
        new THREE.Vector3(0.015, 1.25, 0.01),
        new THREE.Vector3(0.02, 1.32, -0.01)
      ]);
      const wickGeo = new THREE.TubeGeometry(wickCurve, 8, 0.012, 8, false);
      const wickMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
      const wick = new THREE.Mesh(wickGeo, wickMat);
      candleGroup.add(wick);

      // --- Hyper-Realistic Teardrop Flame Geometry (Lathe) ---
      const flameGroup = new THREE.Group();
      flameGroup.position.set(0.02, 1.34, -0.01);

      // Smooth organic flame teardrop profile
      const flameProfile = [
        new THREE.Vector2(0.015, 0.0),
        new THREE.Vector2(0.065, 0.12),
        new THREE.Vector2(0.11, 0.28),
        new THREE.Vector2(0.095, 0.45),
        new THREE.Vector2(0.045, 0.62),
        new THREE.Vector2(0.0, 0.78)
      ];

      // Inner White-Hot Flame Core
      const innerFlameGeo = new THREE.LatheGeometry(
        flameProfile.map(p => new THREE.Vector2(p.x * 0.55, p.y * 0.75)),
        24
      );
      const innerFlameMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.98
      });
      const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
      flameGroup.add(innerFlame);

      // Outer Fiery Orange Flame Body
      const outerFlameGeo = new THREE.LatheGeometry(flameProfile, 24);
      const outerFlameMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat);
      flameGroup.add(outerFlame);

      // Soft Radiating Flame Glow Halo Sprite
      const spriteMat = new THREE.SpriteMaterial({
        map: this.glowTexture,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const glowSprite = new THREE.Sprite(spriteMat);
      glowSprite.position.set(0, 0.35, 0);
      glowSprite.scale.set(1.5, 1.5, 1);
      flameGroup.add(glowSprite);

      // Warm dynamic PointLight casting real firelight
      const flameLight = new THREE.PointLight(0xffedd5, 2.2, 14);
      flameLight.position.set(0, 0.35, 0);
      flameGroup.add(flameLight);

      candleGroup.add(flameGroup);
      this.group.add(candleGroup);

      this.candles.push(candleGroup);
      this.flames.push(flameGroup);
      this.flameLights.push(flameLight);
    });
  }

  // 5. Floating 3D Golden Calligraphy Topper: "Happy Birthday Azai ✨"
  createCakeTopper() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    // Acrylic gold plaque background
    ctx.fillStyle = 'rgba(20, 18, 42, 0.92)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(6, 6, 500, 148, 30);
    ctx.fill();
    ctx.stroke();

    // Golden Calligraphy Text
    ctx.font = 'bold 36px "Dancing Script", cursive, system-ui';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 14;
    ctx.fillText('🎂 Happy Birthday Azai ✨', 256, 80);

    const texture = new THREE.CanvasTexture(canvas);
    const plaqueMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    });
    const plaque = new THREE.Sprite(plaqueMat);
    // Placed at y = 7.65 so it floats clearly and gracefully ABOVE the candle flames (no overlap and no support sticks!)
    plaque.position.set(0, 7.65, -0.4);
    plaque.scale.set(3.4, 1.1, 1);
    this.topperPlaque = plaque;

    this.group.add(plaque);
  }

  createSmokeSystem() {
    const particleCount = 60;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100;
      positions[i * 3 + 2] = 0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xe4e4e7,
      size: 0.35,
      map: this.glowTexture,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.smokeMesh = new THREE.Points(geo, mat);
    this.group.add(this.smokeMesh);
  }

  update(time) {
    // Elegant slow rotation of the cake display
    this.group.rotation.y += 0.0025;

    // Gentle hovering bob of the floating golden plaque
    if (this.topperPlaque) {
      this.topperPlaque.position.y = 7.65 + Math.sin(time * 2.5) * 0.07;
    }

    // Organic, realistic dancing candle flames
    if (!this.isBlown) {
      this.flames.forEach((flame, idx) => {
        // Natural wind draft harmonic oscillation
        const windSwayX = Math.sin(time * 8 + idx * 2.1) * 0.08 + Math.cos(time * 14 + idx) * 0.04;
        const windSwayZ = Math.cos(time * 7 + idx * 1.7) * 0.08;
        flame.rotation.z = windSwayX;
        flame.rotation.x = windSwayZ;

        // Organic pulsating flame height & width
        const pulse = 1.0 + Math.sin(time * 12 + idx * 3) * 0.08 + Math.cos(time * 18 + idx) * 0.05;
        flame.scale.set(1.0 + (pulse - 1) * 0.5, pulse, 1.0 + (pulse - 1) * 0.5);

        // Flickering golden firelight
        if (this.flameLights[idx]) {
          this.flameLights[idx].intensity = 2.2 + Math.sin(time * 20 + idx * 5) * 0.45;
        }
      });
    }
  }

  blowOut(onComplete) {
    if (this.isBlown) return;
    this.isBlown = true;

    // Smooth dissipation of the flame
    this.flames.forEach((flame, idx) => {
      gsap.to(flame.scale, {
        x: 0.001,
        y: 0.001,
        z: 0.001,
        duration: 0.55,
        delay: idx * 0.08,
        ease: 'power2.in',
        onComplete: () => {
          flame.visible = false;
        }
      });

      if (this.flameLights[idx]) {
        gsap.to(this.flameLights[idx], {
          intensity: 0,
          duration: 0.55,
          delay: idx * 0.08
        });
      }
    });

    this.triggerSmoke();

    if (onComplete) {
      setTimeout(onComplete, 750);
    }
  }

  triggerSmoke() {
    const posAttr = this.smokeMesh.geometry.attributes.position;
    const positions = posAttr.array;
    const candlePos = [
      { x: 0, z: 0.25 },
      { x: -0.65, z: -0.2 },
      { x: 0.65, z: -0.2 }
    ];

    let pIdx = 0;
    candlePos.forEach(c => {
      for (let i = 0; i < 20; i++) {
        const idx = pIdx * 3;
        positions[idx] = c.x + (Math.random() - 0.5) * 0.12;
        positions[idx + 1] = 6.0;
        positions[idx + 2] = c.z + (Math.random() - 0.5) * 0.12;

        gsap.to({ y: positions[idx + 1], x: positions[idx] }, {
          y: 8.5 + Math.random() * 2.0,
          x: positions[idx] + (Math.random() - 0.5) * 1.2,
          duration: 2.0 + Math.random() * 0.8,
          delay: Math.random() * 0.4,
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
