import * as THREE from 'three';
import gsap from 'gsap';
import { CosmicGalaxy } from './galaxy.js';
import { MemoryUniverse } from './memories.js';
import { BirthdayCake } from './cake.js';
import { sound } from './audio.js';
import { launchBirthdayFireworks } from './fireworks.js';

class BirthdayApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.config = null;
    this.memories = [];
    this.currentIndex = 0;
    this.isAutoTour = false;
    this.autoTourTimer = null;

    // Spline-based smooth camera flight
    this.currentProgress = 0;
    this.targetProgress = 0;
    this.totalSteps = 1;

    // Three.js instances
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.galaxy = null;
    this.universe = null;
    this.cake = null;
    this.clock = new THREE.Clock();

    // Interaction & Parallax
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.smoothMouse = new THREE.Vector2(0, 0);
    this.camPos = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();

    this.init();
  }

  async init() {
    await this.loadData();
    this.totalSteps = this.memories.length; // last step is cake
    this.setupUI();
    this.setupThree();
    this.setupEventListeners();
    this.setupModalFallbacks();
    this.animate();
  }

  async loadData() {
    try {
      const [configRes, memRes] = await Promise.all([
        fetch('./data/config.json'),
        fetch('./data/memories.json')
      ]);
      this.config = await configRes.json();
      this.memories = await memRes.json();
    } catch (e) {
      console.warn('Fallback data loading error:', e);
      this.config = {
        recipientName: "Azai",
        title: "Chuyến Du Hành Ngân Hà Kỷ Niệm",
        subtitle: "Mỗi khoảnh khắc bên nhau đều là một vì sao sáng lấp lánh",
        letter: {
          title: "Chúc Mừng Sinh Nhật! 💖",
          greeting: "Thân gửi,",
          body: ["Chúc bạn một ngày sinh nhật thật ấm áp, ngập tràn tiếng cười và hạnh phúc!"],
          signature: "Người gửi lời chúc 💫"
        }
      };
      this.memories = [];
    }
  }

  setupUI() {
    const introName = document.getElementById('intro-name');
    const introSubtitle = document.getElementById('intro-subtitle');
    const logoText = document.getElementById('logo-text');

    if (introName) introName.innerText = `Happy Birthday ${this.config.recipientName}! 🎂`;
    if (introSubtitle) introSubtitle.innerText = this.config.subtitle;
    if (logoText) logoText.innerText = `HPBD ${this.config.recipientName}`;

    // Populate Year navigation chips
    const yearNav = document.getElementById('year-nav-container');
    if (yearNav && this.memories.length > 0) {
      const years = Array.from(new Set(this.memories.map(m => m.year))).sort();
      years.forEach(year => {
        const chip = document.createElement('button');
        chip.className = 'year-chip';
        chip.innerText = `${year}`;
        chip.addEventListener('click', () => {
          const firstIdx = this.memories.findIndex(m => m.year === year);
          if (firstIdx !== -1) this.flyToIndex(firstIdx);
        });
        yearNav.appendChild(chip);
      });

      // Cake shortcut chip
      const cakeChip = document.createElement('button');
      cakeChip.className = 'year-chip';
      cakeChip.innerText = '🎂 Bánh Sinh Nhật';
      cakeChip.addEventListener('click', () => this.flyToIndex(this.memories.length));
      yearNav.appendChild(cakeChip);
    }
  }

  setupThree() {
    this.scene = new THREE.Scene();
    // Subtle distance fog so stars are not blacked out
    this.scene.fog = new THREE.FogExp2(0x060515, 0.0008);

    const fov = window.innerWidth < 768 ? 62 : 50;
    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff1f2, 1.6);
    dirLight.position.set(30, 45, 25);
    this.scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x38bdf8, 2.8, 140);
    blueLight.position.set(-25, 20, -40);
    this.scene.add(blueLight);

    const roseLight = new THREE.PointLight(0xf43f5e, 2.5, 120);
    roseLight.position.set(25, -15, -90);
    this.scene.add(roseLight);

    // Cosmic Galaxy & Memory Universe
    this.galaxy = new CosmicGalaxy(this.scene);
    this.universe = new MemoryUniverse(this.scene, this.memories, (mem, idx) => {
      this.openMemoryModal(mem);
    });

    // 3D Birthday Cake
    this.cake = new BirthdayCake(this.scene);
    this.cake.group.position.copy(this.universe.cakePosition);

    // Set initial camera position looking into the galaxy
    this.camera.position.set(0, 10, 24);
    this.camera.lookAt(0, 0, -20);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Mouse movement with smooth parallax
    window.addEventListener('pointermove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Raycast click on 3D cards
    window.addEventListener('pointerdown', (e) => {
      if (e.target.closest('#hud-overlay, #cake-ceremony-panel, dialog')) return;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.universe.cardMeshes, false);
      if (intersects.length > 0) {
        this.universe.handleClick(intersects[0].object);
      }
    });

    // Silky Smooth Mouse Wheel flight along curve
    window.addEventListener('wheel', (e) => {
      if (document.querySelector('dialog[open]')) return;
      const delta = e.deltaY * 0.00035;
      this.targetProgress = Math.max(0, Math.min(1, this.targetProgress + delta));
    }, { passive: true });

    // Touch Drag flight for mobile
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (document.querySelector('dialog[open]')) return;
      const touchY = e.touches[0].clientY;
      const deltaY = (touchStartY - touchY) * 0.0008;
      touchStartY = touchY;
      this.targetProgress = Math.max(0, Math.min(1, this.targetProgress + deltaY));
    }, { passive: true });

    // UI Buttons
    document.getElementById('btn-start')?.addEventListener('click', () => this.startExperience());
    document.getElementById('btn-next')?.addEventListener('click', () => this.nextMemory());
    document.getElementById('btn-prev')?.addEventListener('click', () => this.prevMemory());
    document.getElementById('btn-warp-cake')?.addEventListener('click', () => this.flyToIndex(this.memories.length));
    document.getElementById('btn-sound')?.addEventListener('click', () => this.toggleSound());
    document.getElementById('btn-auto-tour')?.addEventListener('click', () => this.toggleAutoTour());
    document.getElementById('btn-blow-candles')?.addEventListener('click', () => this.blowCandles());
    document.getElementById('btn-open-letter')?.addEventListener('click', () => this.openLetterModal());

    // Pause video when modal closes
    const memoryModal = document.getElementById('memory-modal');
    if (memoryModal) {
      memoryModal.addEventListener('close', () => {
        const mediaContainer = document.getElementById('modal-media-container');
        if (mediaContainer) {
          const video = mediaContainer.querySelector('video');
          if (video) {
            video.pause();
            video.src = '';
            video.load();
          }
          mediaContainer.innerHTML = '';
        }
      });
    }
  }

  setupModalFallbacks() {
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e, dialog) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
        let pressedOutside = false;
        dialog.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, dialog); });
        dialog.addEventListener('pointerup', (e) => {
          if (pressedOutside && outside(e, dialog)) dialog.close();
        });
      }
    }
  }

  startExperience() {
    sound.startBackgroundMusic();
    sound.playWhoosh();

    const intro = document.getElementById('intro-screen');
    const hud = document.getElementById('hud-overlay');

    if (intro) intro.classList.add('hidden');
    if (hud) hud.classList.remove('hidden');

    this.flyToIndex(0, 2.2);
  }

  flyToIndex(index, duration = 1.6) {
    this.currentIndex = Math.max(0, Math.min(index, this.totalSteps));
    const targetT = this.currentIndex / this.totalSteps;

    sound.playWhoosh();

    gsap.to(this, {
      targetProgress: targetT,
      duration: duration,
      ease: 'power2.out'
    });
  }

  nextMemory() {
    if (this.currentIndex < this.totalSteps) {
      this.flyToIndex(this.currentIndex + 1);
    } else {
      this.flyToIndex(0);
    }
  }

  prevMemory() {
    if (this.currentIndex > 0) {
      this.flyToIndex(this.currentIndex - 1);
    } else {
      this.flyToIndex(this.totalSteps);
    }
  }

  toggleSound() {
    const isMuted = sound.toggleMute();
    const btn = document.getElementById('btn-sound');
    if (btn) btn.classList.toggle('muted', isMuted);
  }

  toggleAutoTour() {
    this.isAutoTour = !this.isAutoTour;
    const btn = document.getElementById('btn-auto-tour');
    const icon = document.getElementById('auto-tour-icon');

    if (this.isAutoTour) {
      if (icon) icon.innerText = '⏸';
      if (btn) btn.classList.add('primary');
      this.startAutoTour();
    } else {
      if (icon) icon.innerText = '▶';
      if (btn) btn.classList.remove('primary');
      if (this.autoTourTimer) clearInterval(this.autoTourTimer);
    }
  }

  startAutoTour() {
    if (this.autoTourTimer) clearInterval(this.autoTourTimer);
    this.autoTourTimer = setInterval(() => {
      if (!this.isAutoTour) return;
      this.nextMemory();
    }, 4500);
  }

  openMemoryModal(memory) {
    sound.playChime();
    const modal = document.getElementById('memory-modal');
    const mediaContainer = document.getElementById('modal-media-container');
    const title = document.getElementById('modal-title');
    const date = document.getElementById('modal-date');
    const caption = document.getElementById('modal-caption');
    const badge = document.getElementById('modal-type-badge');

    if (title) title.innerText = memory.title;
    if (date) date.innerText = `📅 ${memory.date}`;
    if (caption) caption.innerText = memory.caption;
    if (badge) badge.innerText = memory.type === 'video' ? '🎬 Video' : '📸 Kỷ Niệm';

    if (mediaContainer) {
      mediaContainer.innerHTML = '';
      if (memory.type === 'video') {
        const video = document.createElement('video');
        video.src = memory.url;
        video.poster = memory.thumb || '';
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.style.width = '100%';
        video.style.height = 'auto';
        video.style.maxHeight = '65vh';
        video.style.borderRadius = '12px';
        video.style.backgroundColor = '#000';
        mediaContainer.appendChild(video);

        video.play().catch(() => {});
      } else {
        const img = document.createElement('img');
        img.src = memory.url;
        img.alt = memory.title;
        img.style.borderRadius = '12px';
        mediaContainer.appendChild(img);
      }
    }

    if (modal && !modal.open) {
      modal.showModal();
    }
  }

  blowCandles() {
    sound.playBlowCandle();

    const blowBtn = document.getElementById('btn-blow-candles');
    const openLetterBtn = document.getElementById('btn-open-letter');
    const promptText = document.getElementById('cake-prompt-text');

    if (blowBtn) blowBtn.disabled = true;

    this.cake.blowOut(() => {
      launchBirthdayFireworks();
      if (blowBtn) blowBtn.classList.add('hidden');
      if (openLetterBtn) openLetterBtn.classList.remove('hidden');
      if (promptText) {
        promptText.innerHTML = `🌟 <b>Điều ước đã được gửi lên vũ trụ!</b> Chúc mừng sinh nhật ${this.config.recipientName}! 💖`;
      }
    });
  }

  openLetterModal() {
    sound.playChime();
    const modal = document.getElementById('letter-modal');
    const title = document.getElementById('letter-title');
    const body = document.getElementById('letter-body');
    const sig = document.getElementById('letter-signature');

    const letterData = this.config.letter || {};
    if (title) title.innerText = letterData.title || 'Gửi Người Đặc Biệt 💖';
    if (sig) sig.innerText = letterData.signature || 'Thân gửi & Yêu thương ✨';

    if (body) {
      body.innerHTML = '';
      const paragraphs = letterData.body || [];
      paragraphs.forEach((p) => {
        const pElem = document.createElement('p');
        pElem.style.marginBottom = '14px';
        pElem.innerText = p;
        body.appendChild(pElem);
      });
    }

    if (modal && !modal.open) {
      modal.showModal();
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.fov = window.innerWidth < 768 ? 62 : 50;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  updateHUDState() {
    const isCake = this.currentProgress > 0.94;
    const indicator = document.getElementById('memory-indicator');
    const cakePanel = document.getElementById('cake-ceremony-panel');
    const chips = document.querySelectorAll('.year-chip');

    // Nearest memory index
    const nearestIdx = Math.round(this.currentProgress * this.totalSteps);

    if (isCake) {
      if (indicator) indicator.innerText = `🎂 Bánh Sinh Nhật`;
      if (cakePanel) cakePanel.classList.remove('hidden');
      chips.forEach(c => c.classList.toggle('active', c.innerText.includes('Bánh')));
    } else {
      const currentMem = this.memories[nearestIdx];
      if (indicator && currentMem) {
        indicator.innerText = `[${nearestIdx + 1} / ${this.memories.length}] • ${currentMem.date}`;
      }
      if (cakePanel) cakePanel.classList.add('hidden');
      chips.forEach(c => c.classList.toggle('active', currentMem && c.innerText === `${currentMem.year}`));
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Silky smooth damp interpolation for camera flight
    this.currentProgress = THREE.MathUtils.damp(this.currentProgress, this.targetProgress, 4.2, delta);

    // Smooth mouse parallax
    this.smoothMouse.x = THREE.MathUtils.damp(this.smoothMouse.x, this.mouse.x, 3.5, delta);
    this.smoothMouse.y = THREE.MathUtils.damp(this.smoothMouse.y, this.mouse.y, 3.5, delta);

    // Compute camera position & lookAt along curve
    if (this.universe && this.universe.curve) {
      const curve = this.universe.curve;
      const t = Math.max(0, Math.min(0.999, this.currentProgress));

      // Camera position on curve + offset
      const pointOnCurve = curve.getPoint(t);
      const isCakeZone = t > 0.93;

      if (isCakeZone) {
        // Smoothly settle around cake
        const cakePos = this.universe.cakePosition;
        this.camPos.set(cakePos.x, cakePos.y + 4.2, cakePos.z + 13.5);
        this.lookTarget.set(cakePos.x, cakePos.y + 2.2, cakePos.z);
      } else {
        // Flying along the curve
        this.camPos.copy(pointOnCurve);
        this.camPos.z += 8.2;
        this.camPos.y += 0.5;

        // Look slightly forward into the curve
        const lookAheadT = Math.min(t + 0.03, 1.0);
        this.lookTarget.copy(curve.getPoint(lookAheadT));
      }

      // Apply subtle mouse parallax
      this.camPos.x += this.smoothMouse.x * 1.4;
      this.camPos.y += this.smoothMouse.y * 1.0;

      this.camera.position.copy(this.camPos);
      this.camera.lookAt(this.lookTarget);
    }

    // Raycast hover check
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.universe.cardMeshes, false);
    if (intersects.length > 0) {
      this.universe.handleHover(intersects[0].object);
    } else {
      this.universe.handleHover(null);
    }

    // Update HUD indicator
    this.updateHUDState();

    // Module updates
    this.galaxy.update(delta, time);
    this.universe.update(time, delta);
    this.cake.update(time);

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new BirthdayApp();
});
