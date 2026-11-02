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
    this.totalSteps = 1;
    this.hasStarted = false;
    this.isTransitioning = false;
    this.isAutoTour = false;
    this.autoTourTimer = null;

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
    this.camPos = new THREE.Vector3(0, 10, 24);
    this.lookTarget = new THREE.Vector3(0, 0, -20);

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
      const cacheBust = `?t=${Date.now()}`;
      const [configRes, memRes] = await Promise.all([
        fetch(`./data/config.json${cacheBust}`),
        fetch(`./data/memories.json${cacheBust}`)
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

    // Populate Milestone navigation chips (clean, no dates)
    const yearNav = document.getElementById('year-nav-container');
    if (yearNav && this.memories.length > 0) {
      const milestones = [
        { label: '🌟 Kỷ Niệm 1', idx: 0 },
        { label: '📸 Kỷ Niệm 6', idx: 5 },
        { label: '💬 Kỷ Niệm 12', idx: 11 },
        { label: '✨ Kỷ Niệm 18', idx: 17 },
        { label: '🎂 Bánh Sinh Nhật', idx: this.memories.length }
      ];

      milestones.forEach(m => {
        const chip = document.createElement('button');
        chip.className = 'year-chip';
        chip.innerText = m.label;
        chip.addEventListener('click', () => {
          this.goToStep(m.idx);
        });
        yearNav.appendChild(chip);
      });
    }
  }

  setupThree() {
    this.scene = new THREE.Scene();
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
    this.cake = new BirthdayCake(this.scene, this.config?.recipientName || 'Azai');
    this.cake.group.position.copy(this.universe.cakePosition);

    // Initial camera position
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
      if (!this.hasStarted) return;
      if (e.target.closest('#intro-screen, #hud-overlay, #cake-ceremony-panel, .floating-nav, dialog')) return;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.universe.cardMeshes, false);
      if (intersects.length > 0) {
        this.universe.handleClick(intersects[0].object);
      }
    });

    // START BUTTON: Click button to start experience!
    const startBtn = document.getElementById('btn-start');
    startBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startExperience();
    });

    // STEP BY STEP NAVIGATION: Click to advance to next/prev animation
    document.getElementById('btn-next')?.addEventListener('click', () => this.nextStep());
    document.getElementById('float-btn-next')?.addEventListener('click', () => this.nextStep());

    document.getElementById('btn-prev')?.addEventListener('click', () => this.prevStep());
    document.getElementById('float-btn-prev')?.addEventListener('click', () => this.prevStep());

    document.getElementById('btn-warp-cake')?.addEventListener('click', () => this.goToStep(this.memories.length));
    document.getElementById('btn-sound')?.addEventListener('click', () => this.toggleSound());
    document.getElementById('btn-auto-tour')?.addEventListener('click', () => this.toggleAutoTour());
    document.getElementById('btn-blow-candles')?.addEventListener('click', () => this.blowCandles());
    document.getElementById('btn-open-letter')?.addEventListener('click', () => this.openLetterModal());

    // Keyboard navigation (Arrow keys & Space)
    window.addEventListener('keydown', (e) => {
      if (!this.hasStarted) {
        if (e.code === 'Space' || e.code === 'Enter') this.startExperience();
        return;
      }
      if (document.querySelector('dialog[open]')) return;

      if (e.code === 'ArrowRight' || e.code === 'Space') {
        e.preventDefault();
        this.nextStep();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.prevStep();
      }
    });

    // Wheel navigation (1 scroll gesture = 1 discrete step forward/back)
    let wheelCooldown = false;
    window.addEventListener('wheel', (e) => {
      if (!this.hasStarted || this.isTransitioning || document.querySelector('dialog[open]')) return;
      if (wheelCooldown) return;
      wheelCooldown = true;
      setTimeout(() => { wheelCooldown = false; }, 600);

      if (e.deltaY > 25) {
        this.nextStep();
      } else if (e.deltaY < -25) {
        this.prevStep();
      }
    }, { passive: true });

    // Touch swipe navigation for mobile (1 swipe = 1 step)
    let touchStartY = 0;
    let touchStartX = 0;
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (!this.hasStarted || this.isTransitioning || document.querySelector('dialog[open]')) return;
      const diffY = touchStartY - e.changedTouches[0].clientY;
      const diffX = touchStartX - e.changedTouches[0].clientX;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 45) this.nextStep();
        else if (diffX < -45) this.prevStep();
      } else {
        if (diffY > 45) this.nextStep();
        else if (diffY < -45) this.prevStep();
      }
    }, { passive: true });

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
    if (this.hasStarted) return;
    this.hasStarted = true;

    try {
      sound.startBackgroundMusic();
      sound.playWhoosh();
    } catch (err) {
      console.warn('Audio start error:', err);
    }

    const intro = document.getElementById('intro-screen');
    const hud = document.getElementById('hud-overlay');

    if (intro) {
      intro.classList.add('hidden');
      intro.style.display = 'none';
    }
    if (hud) {
      hud.classList.remove('hidden');
      hud.style.display = 'flex';
    }

    // Smooth cinematic warp to Memory 0
    this.goToStep(0, 2.0);
  }

  goToStep(index, duration = 1.5) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    this.currentIndex = Math.max(0, Math.min(index, this.totalSteps));
    const isCake = this.currentIndex === this.totalSteps;

    sound.playWhoosh();

    let targetCamPos;
    let targetLook;

    if (isCake) {
      const cakePos = this.universe.cakePosition;
      targetCamPos = new THREE.Vector3(cakePos.x, cakePos.y + 4.6, cakePos.z + 14.5);
      targetLook = new THREE.Vector3(cakePos.x, cakePos.y + 3.4, cakePos.z);
    } else {
      const cardPos = this.universe.cardMeshes[this.currentIndex].userData.initialPos;
      targetCamPos = new THREE.Vector3(cardPos.x, cardPos.y + 0.35, cardPos.z + 7.5);
      targetLook = new THREE.Vector3(cardPos.x, cardPos.y + 0.1, cardPos.z);
    }

    gsap.killTweensOf(this.camPos);
    gsap.killTweensOf(this.lookTarget);

    gsap.to(this.camPos, {
      x: targetCamPos.x,
      y: targetCamPos.y,
      z: targetCamPos.z,
      duration: duration,
      ease: 'power2.inOut',
      onComplete: () => {
        this.isTransitioning = false;
      }
    });

    gsap.to(this.lookTarget, {
      x: targetLook.x,
      y: targetLook.y,
      z: targetLook.z,
      duration: duration,
      ease: 'power2.inOut'
    });

    // Update 3D card highlights
    this.universe.cardMeshes.forEach((mesh, idx) => {
      const group = mesh.userData.group;
      const halo = mesh.userData.haloMesh;
      if (idx === this.currentIndex && !isCake) {
        gsap.to(group.scale, { x: 1.08, y: 1.08, z: 1.08, duration: 0.5, ease: 'back.out(1.5)' });
        if (halo) halo.material.opacity = 0.8;
      } else {
        gsap.to(group.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.5, ease: 'power2.out' });
        if (halo) halo.material.opacity = 0.35;
      }
    });

    this.updateHUD(isCake);
  }

  nextStep() {
    if (this.currentIndex < this.totalSteps) {
      this.goToStep(this.currentIndex + 1);
    } else {
      this.goToStep(0);
    }
  }

  prevStep() {
    if (this.currentIndex > 0) {
      this.goToStep(this.currentIndex - 1);
    } else {
      this.goToStep(this.totalSteps);
    }
  }

  updateHUD(isCake) {
    const indicator = document.getElementById('memory-indicator');
    const cakePanel = document.getElementById('cake-ceremony-panel');
    const chips = document.querySelectorAll('.year-chip');
    const floatNext = document.getElementById('float-btn-next');
    const floatPrev = document.getElementById('float-btn-prev');

    if (floatPrev) {
      floatPrev.style.display = this.currentIndex === 0 ? 'none' : 'flex';
    }

    if (isCake) {
      if (indicator) indicator.innerText = `🎂 Bánh Sinh Nhật`;
      if (cakePanel) cakePanel.classList.remove('hidden');
      if (floatNext) floatNext.style.display = 'none';
      chips.forEach(c => c.classList.toggle('active', c.innerText.includes('Bánh')));
    } else {
      const currentMem = this.memories[this.currentIndex];
      if (indicator && currentMem) {
        indicator.innerText = `[${this.currentIndex + 1} / ${this.memories.length}] • ${currentMem.title}`;
      }
      if (cakePanel) cakePanel.classList.add('hidden');
      if (floatNext) {
        floatNext.style.display = 'flex';
        const label = floatNext.querySelector('span');
        if (label) {
          label.innerText = (this.currentIndex === this.memories.length - 1) ? 'Tới Bánh Sinh Nhật 🎂' : 'Tiếp Theo';
        }
      }
      chips.forEach((c, idx) => {
        // Highlight milestone chips if applicable
        c.classList.toggle('active', (idx === 0 && this.currentIndex < 5) || (idx === 1 && this.currentIndex >= 5 && this.currentIndex < 11) || (idx === 2 && this.currentIndex >= 11 && this.currentIndex < 17) || (idx === 3 && this.currentIndex >= 17 && this.currentIndex < this.memories.length));
      });
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
      this.nextStep();
    }, 4500);
  }

  openMemoryModal(memory) {
    sound.playChime();
    const modal = document.getElementById('memory-modal');
    const mediaContainer = document.getElementById('modal-media-container');
    const title = document.getElementById('modal-title');
    const caption = document.getElementById('modal-caption');
    const badge = document.getElementById('modal-type-badge');

    if (title) title.innerText = memory.title;
    if (caption) caption.innerText = memory.caption;
    if (badge) badge.innerText = memory.type === 'video' ? '🎬 Video Kỷ Niệm' : '📸 Khoảnh Khắc Đẹp';

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

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Smooth subtle mouse parallax sway (camera stays firmly parked at current memory)
    this.smoothMouse.x = THREE.MathUtils.damp(this.smoothMouse.x, this.mouse.x, 3.5, delta);
    this.smoothMouse.y = THREE.MathUtils.damp(this.smoothMouse.y, this.mouse.y, 3.5, delta);

    this.camera.position.x = this.camPos.x + this.smoothMouse.x * 0.7;
    this.camera.position.y = this.camPos.y + this.smoothMouse.y * 0.5;
    this.camera.position.z = this.camPos.z;

    this.camera.lookAt(this.lookTarget);

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

window.addEventListener('DOMContentLoaded', () => {
  new BirthdayApp();
});
