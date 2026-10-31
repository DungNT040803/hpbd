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
    this.isTransitioning = false;

    // Three.js instances
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.galaxy = null;
    this.universe = null;
    this.cake = null;
    this.clock = new THREE.Clock();

    // Interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.lookTarget = new THREE.Vector3(0, 0, 0);

    this.init();
  }

  async init() {
    await this.loadData();
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
        recipientName: "Bạn",
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
    // Populate Titles & Recipient Name
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
          if (firstIdx !== -1) this.flyTo(firstIdx);
        });
        yearNav.appendChild(chip);
      });

      // Cake shortcut chip
      const cakeChip = document.createElement('button');
      cakeChip.className = 'year-chip';
      cakeChip.innerText = '🎂 Bánh Sinh Nhật';
      cakeChip.addEventListener('click', () => this.flyTo(this.memories.length));
      yearNav.appendChild(cakeChip);
    }
  }

  setupThree() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070714, 0.005);

    // Camera
    const fov = window.innerWidth < 768 ? 65 : 52;
    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 800);
    this.camera.position.set(0, 15, 35);
    this.lookTarget.set(0, 0, 0);
    this.camera.lookAt(this.lookTarget);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.5);
    dirLight.position.set(20, 40, 20);
    this.scene.add(dirLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2.5, 120);
    purpleLight.position.set(-30, 20, -50);
    this.scene.add(purpleLight);

    // Cosmic Galaxy & Environment
    this.galaxy = new CosmicGalaxy(this.scene);

    // Memory Constellation Universe
    this.universe = new MemoryUniverse(this.scene, this.memories, (mem, idx) => {
      this.openMemoryModal(mem);
    });

    // 3D Birthday Cake at the end of the journey
    this.cake = new BirthdayCake(this.scene);
    this.cake.group.position.copy(this.universe.cakePosition);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Mouse move for 3D card hovering
    window.addEventListener('pointermove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Click in 3D canvas
    window.addEventListener('pointerdown', (e) => {
      // Ignore if clicking on UI overlay
      if (e.target.closest('#hud-overlay, #cake-ceremony-panel, dialog')) return;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.universe.cardMeshes, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        this.universe.handleClick(hit);
      }
    });

    // Wheel navigation (smooth scroll through memories)
    let wheelCooldown = false;
    window.addEventListener('wheel', (e) => {
      if (document.querySelector('dialog[open]')) return;
      if (wheelCooldown) return;
      wheelCooldown = true;
      setTimeout(() => { wheelCooldown = false; }, 400);

      if (e.deltaY > 20) {
        this.nextMemory();
      } else if (e.deltaY < -20) {
        this.prevMemory();
      }
    }, { passive: true });

    // Touch swipe navigation for mobile
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (document.querySelector('dialog[open]')) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      if (diff > 50) this.nextMemory();
      else if (diff < -50) this.prevMemory();
    }, { passive: true });

    // UI Buttons
    document.getElementById('btn-start')?.addEventListener('click', () => this.startExperience());
    document.getElementById('btn-next')?.addEventListener('click', () => this.nextMemory());
    document.getElementById('btn-prev')?.addEventListener('click', () => this.prevMemory());
    document.getElementById('btn-warp-cake')?.addEventListener('click', () => this.flyTo(this.memories.length));
    document.getElementById('btn-sound')?.addEventListener('click', () => this.toggleSound());
    document.getElementById('btn-auto-tour')?.addEventListener('click', () => this.toggleAutoTour());
    document.getElementById('btn-blow-candles')?.addEventListener('click', () => this.blowCandles());
    document.getElementById('btn-open-letter')?.addEventListener('click', () => this.openLetterModal());

    // Pause video and clean up media container when modal closes
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

  // Modern Web Guidance: Light dismiss fallback for <dialog closedby="any">
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

    this.flyTo(0, 2.5);
  }

  flyTo(index, duration = 1.8) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentIndex = Math.max(0, Math.min(index, this.memories.length));

    sound.playWhoosh();

    const targetPos = this.universe.getPointPosition(this.currentIndex);
    const isCake = this.currentIndex === this.memories.length;

    // Desired camera position
    let camTargetPos;
    let lookAtPos;

    if (isCake) {
      camTargetPos = new THREE.Vector3(targetPos.x, targetPos.y + 4.5, targetPos.z + 12);
      lookAtPos = new THREE.Vector3(targetPos.x, targetPos.y + 2.5, targetPos.z);
    } else {
      camTargetPos = new THREE.Vector3(targetPos.x, targetPos.y + 0.4, targetPos.z + 7.5);
      lookAtPos = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z);
    }

    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.lookTarget);

    gsap.to(this.camera.position, {
      x: camTargetPos.x,
      y: camTargetPos.y,
      z: camTargetPos.z,
      duration: duration,
      ease: 'power2.inOut',
      onComplete: () => {
        this.isTransitioning = false;
      }
    });

    gsap.to(this.lookTarget, {
      x: lookAtPos.x,
      y: lookAtPos.y,
      z: lookAtPos.z,
      duration: duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.camera.lookAt(this.lookTarget);
      }
    });

    this.updateHUD(isCake);
  }

  updateHUD(isCake) {
    const indicator = document.getElementById('memory-indicator');
    const cakePanel = document.getElementById('cake-ceremony-panel');
    const chips = document.querySelectorAll('.year-chip');

    if (isCake) {
      if (indicator) indicator.innerText = `🎂 Bánh Sinh Nhật`;
      if (cakePanel) cakePanel.classList.remove('hidden');
      chips.forEach(c => c.classList.toggle('active', c.innerText.includes('Bánh')));
    } else {
      const currentMem = this.memories[this.currentIndex];
      if (indicator && currentMem) {
        indicator.innerText = `[${this.currentIndex + 1} / ${this.memories.length}] • ${currentMem.date}`;
      }
      if (cakePanel) cakePanel.classList.add('hidden');
      chips.forEach(c => c.classList.toggle('active', currentMem && c.innerText === `${currentMem.year}`));
    }
  }

  nextMemory() {
    if (this.currentIndex < this.memories.length) {
      this.flyTo(this.currentIndex + 1);
    } else {
      this.flyTo(0);
    }
  }

  prevMemory() {
    if (this.currentIndex > 0) {
      this.flyTo(this.currentIndex - 1);
    } else {
      this.flyTo(this.memories.length);
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

        video.play().catch(() => {
          // Autoplay policy prevented unmuted auto-play, user can click controls
        });
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
      // Grand celebration
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
      paragraphs.forEach((p, pIdx) => {
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
    this.camera.fov = window.innerWidth < 768 ? 65 : 52;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Raycast hover check
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.universe.cardMeshes, false);
    if (intersects.length > 0) {
      this.universe.handleHover(intersects[0].object);
    } else {
      this.universe.handleHover(null);
    }

    // Module updates
    this.galaxy.update(delta, time);
    this.universe.update(time, delta);
    this.cake.update(time);

    this.renderer.render(this.scene, this.camera);
  }
}

// Start application
window.addEventListener('DOMContentLoaded', () => {
  new BirthdayApp();
});
