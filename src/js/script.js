// Core Interaction Architecture

'use strict';

const CONFIG = {
    isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isMobile: window.innerWidth < 768,
    classes: {
        visible: 'is-visible',
        scrolledNav: 'nav-scrolled'
    }
};

const Utils = {
    throttle: (fn, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    debounce: (fn, delay) => {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },
    easeOutQuart: (x) => 1 - Math.pow(1 - x, 4),
    scrollToTarget: (targetId, duration = 1200) => {
        const target = document.getElementById(targetId);
        if (!target) return;

        // Offset to account for the fixed/sticky navigation header
        const headerOffset = 80; 
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            const ease = Utils.easeOutQuart(progress);
            window.scrollTo(0, startPosition + distance * ease);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }
};

/* =========================================
   Highly Optimized Canvas Engine
========================================= */
class CanvasParticleSystem {
    constructor(canvasId, type = 'particles') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas || CONFIG.isReducedMotion) return;
        
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.type = type;
        this.particles = [];
        this.dpr = window.devicePixelRatio || 1;
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', Utils.debounce(() => this.resize(), 200));
        
        const count = this.type === 'graph' ? 35 : (CONFIG.isMobile ? 20 : 60);
        this.createParticles(count);
        
        this.animate();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        this.ctx.scale(this.dpr, this.dpr);
        
        this.width = rect.width;
        this.height = rect.height;
    }

    createParticles(count) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: this.type === 'particles' ? (Math.random() * 0.5 + 0.1) : (Math.random() - 0.5) * 0.5,
                radius: this.type === 'graph' ? Math.random() * 2 + 2 : Math.random() * 1.5 + 0.5,
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            if (this.type === 'particles') {
                p.y -= p.vy;
                if (p.y < -10) p.y = this.height + 10;
            } else {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x <= 0 || p.x >= this.width) p.vx *= -1;
                if (p.y <= 0 || p.y >= this.height) p.vy *= -1;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();

            if (this.type === 'graph') {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p2 = this.particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = dx * dx + dy * dy;
                    
                    if (dist < 20000) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.stroke();
                    }
                }
            }
        }
        requestAnimationFrame(this.animate.bind(this));
    }
}

/* =========================================
   Scroll & UI Controllers
========================================= */
class ScrollManager {
    constructor() {
        this.header = document.getElementById('site-header');
        this.lastScroll = 0;
        this.init();
    }

    init() {
        if (!this.header) return;
        window.addEventListener('scroll', Utils.throttle(() => {
            const currentScroll = window.scrollY;
            if (currentScroll > 20) this.header.classList.add(CONFIG.classes.scrolledNav);
            else this.header.classList.remove(CONFIG.classes.scrolledNav);

            if (currentScroll > this.lastScroll && currentScroll > 50) this.header.style.transform = 'translateY(-100%)';
            else this.header.style.transform = 'translateY(0)';
            
            this.lastScroll = currentScroll;
        }, 100), { passive: true });
    }
}

class RevealEngine {
    constructor() {
        this.observerOptions = { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 };
        this.init();
    }

    init() {
        if (CONFIG.isReducedMotion) {
            document.querySelectorAll('.slide-up').forEach(el => el.classList.add(CONFIG.classes.visible));
            return;
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(CONFIG.classes.visible);
                    this.observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);
        
        const elements = document.querySelectorAll('.slide-up');
        elements.forEach(el => {
            this.observer.observe(el);
        });
    }
}

class DataVisualizations {
    constructor() {
        this.initCounters();
    }

    initCounters() {
        const numbers = document.querySelectorAll('.insight-metrics strong');
        if (!numbers.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateValue(entry.target, 0, parseInt(entry.target.innerText), 2000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        numbers.forEach(num => observer.observe(num));
    }

    animateValue(obj, start, end, duration) {
        if (CONFIG.isReducedMotion) { obj.innerHTML = end; return; }
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(Utils.easeOutQuart(progress) * (end - start) + start);
            if (progress < 1) window.requestAnimationFrame(step);
            else obj.innerHTML = end;
        };
        window.requestAnimationFrame(step);
    }
}

/* =========================================
   Interactive CTAs & Navigation
========================================= */
class InteractionManager {
    constructor() {
        this.header = document.getElementById('site-header');
        this.initHeroCTAs();
        this.initNavigation();
        this.initMobileNav();
    }

    initHeroCTAs() {
        const heroGroup = document.querySelector('#hero .cta-group');
        if (!heroGroup) return;

        const experienceBtn = heroGroup.querySelector('.btn-primary');
        const manifestoBtn = heroGroup.querySelector('.btn-secondary');

        if (experienceBtn) {
            experienceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                Utils.scrollToTarget('introducing-nexvault', 700); 
            });
        }

        if (manifestoBtn) {
            manifestoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                Utils.scrollToTarget('invisible-crisis', 700);
            });
        }
    }

    initNavigation() {
        const logo = document.querySelector('.site-logo');
        if (logo) {
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMobileMenu();
                Utils.scrollToTarget('hero', 700);
            });
        }

        const navLinks = document.querySelectorAll('.nav-links a, .nav-cta-group a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    const targetId = href.substring(1);
                    if (document.getElementById(targetId)) {
                        e.preventDefault();
                        this.closeMobileMenu();
                        Utils.scrollToTarget(targetId, 700);
                    }
                }
            });
        });
    }

    initMobileNav() {
        this.toggleBtn = document.querySelector('.mobile-menu-toggle');
        this.navMenu = document.getElementById('mobile-nav');
        
        if (!this.toggleBtn || !this.navMenu) return;

        // Toggle Button Click
        this.toggleBtn.addEventListener('click', () => {
            const isOpen = this.header.classList.contains('is-menu-open');
            if (isOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        });

        // Close on Escape Key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.header.classList.contains('is-menu-open')) {
                this.closeMobileMenu();
            }
        });

        // Close if resizing past mobile breakpoint
        window.addEventListener('resize', Utils.debounce(() => {
            if (window.innerWidth > 768 && this.header.classList.contains('is-menu-open')) {
                this.closeMobileMenu();
            }
        }, 200));

        // Close if clicking the glass overlay background directly (outside links)
        this.navMenu.addEventListener('click', (e) => {
            if (e.target === this.navMenu) {
                this.closeMobileMenu();
            }
        });
    }

    openMobileMenu() {
        if (!this.header) return;
        this.header.classList.add('is-menu-open');
        this.toggleBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        if (this.header) {
            this.header.classList.remove('is-menu-open');
        }
        // Add a safety check before trying to modify the button
        if (this.toggleBtn) {
            this.toggleBtn.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
    }
}
/* =========================================
   Scroll Spy (Active Navigation)
========================================= */
class NavigationObserver {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-links a');
        this.sections = [];
        this.init();
    }

    init() {
        if (this.navLinks.length === 0) return;

        // Map each link to its corresponding section DOM element
        this.navLinks.forEach(link => {
            const targetId = link.getAttribute('href').substring(1);
            const section = document.getElementById(targetId);
            if (section) {
                this.sections.push({ link, section });
            }
        });

        // Configure the observer boundary 
        // Triggers when a section crosses the upper-middle of the screen
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px', 
            threshold: 0
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Remove active state from all links
                    this.navLinks.forEach(l => l.classList.remove('is-active'));
                    
                    // Add active state to the currently intersecting section
                    const activePair = this.sections.find(s => s.section === entry.target);
                    if (activePair) {
                        activePair.link.classList.add('is-active');
                    }
                }
            });
        }, observerOptions);

        // Begin observing all mapped sections
        this.sections.forEach(s => this.observer.observe(s.section));
    }
}
/* =========================================
   Product Mockup Animation Sequence
========================================= */
class MockupSequence {
    constructor() {
        this.container = document.getElementById('mockup-sequence');
        if (!this.container || CONFIG.isReducedMotion) return;

        this.phases = Array.from(this.container.querySelectorAll('.mockup-phase'));
        this.currentIndex = 0;
        this.intervalTime = 2500; // 2.5s per phase (10s total loop)
        this.timer = null;
        
        this.initObserver();
    }

    initObserver() {
        // Only run the heavy sequence when the mockup is actually in the viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startSequence();
                } else {
                    this.stopSequence();
                }
            });
        }, { threshold: 0.2 });

        observer.observe(this.container);
    }

    startSequence() {
        if (this.timer) return;
        this.runPhase();
        this.timer = setInterval(() => this.runPhase(), this.intervalTime);
    }

    stopSequence() {
        clearInterval(this.timer);
        this.timer = null;
        this.phases.forEach(p => p.classList.remove('is-active'));
        this.currentIndex = 0;
    }

    runPhase() {
        this.phases.forEach((phase, index) => {
            if (index === this.currentIndex) {
                phase.classList.add('is-active');
            } else {
                phase.classList.remove('is-active');
            }
        });
        
        this.currentIndex = (this.currentIndex + 1) % this.phases.length;
    }
}
/* =========================================
   Living Knowledge Graph Engine
========================================= */
class LivingKnowledgeGraph {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.dpr = window.devicePixelRatio || 1;
        this.isReducedMotion = CONFIG.isReducedMotion;
        
        this.nodes = [];
        this.edges = [];
        this.mouse = { x: -1000, y: -1000, radius: 60 };
        this.hoveredNode = null;
        
        // Zoom scaling properties (If these are missing, the canvas goes blank!)
        this.scale = 1;
        this.targetScale = 1;
        this.minScale = 0.5;
        this.maxScale = 2.0;
        
        this.isRunning = false;
        this.rafId = null;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', Utils.debounce(() => this.resize(), 200));
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) * this.dpr;
            this.mouse.y = (e.clientY - rect.top) * this.dpr;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });

        this.buildGraph();
        this.setupIntersectionObserver();

        // Bind Zoom Controls
        const zoomIn = document.querySelector('.zoom-in');
        const zoomOut = document.querySelector('.zoom-out');
        const resetView = document.querySelector('.reset-view');

        if (zoomIn) zoomIn.addEventListener('click', () => this.setZoom(0.25));
        if (zoomOut) zoomOut.addEventListener('click', () => this.setZoom(-0.25));
        if (resetView) resetView.addEventListener('click', () => this.targetScale = 1);
    }

    setZoom(amount) {
        this.targetScale = Math.max(this.minScale, Math.min(this.maxScale, this.targetScale + amount));
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (!this.isRunning) {
                    this.isRunning = true;
                    this.animate();
                }
            } else {
                this.isRunning = false;
                if (this.rafId) cancelAnimationFrame(this.rafId);
            }
        }, { threshold: 0.1 });

        observer.observe(this.canvas);
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        this.ctx.scale(this.dpr, this.dpr);
        this.width = rect.width;
        this.height = rect.height;
    }

    buildGraph() {
        const labels = [
            "AI", "Deep Learning", "Stanford Lecture", 
            "Neural Networks", "Research Notes", 
            "Startup Idea", "Computer Vision",
            "Data Architecture", "Market Trends"
        ];

        labels.forEach((label, i) => {
            this.nodes.push({
                id: i,
                label: label,
                x: Math.random() * (this.width - 200) + 100,
                y: Math.random() * (this.height - 200) + 100,
                vx: this.isReducedMotion ? 0 : (Math.random() - 0.5) * 0.4,
                vy: this.isReducedMotion ? 0 : (Math.random() - 0.5) * 0.4,
                baseRadius: 4,
                currentRadius: 4,
                targetRadius: 4
            });
        });

        const connections = [
            [0, 1], [0, 6], [0, 5], [1, 3], [1, 2], 
            [2, 4], [3, 7], [4, 5], [5, 8], [6, 7]
        ];

        connections.forEach(([sourceId, targetId]) => {
            this.edges.push({
                source: this.nodes[sourceId],
                target: this.nodes[targetId]
            });
        });
    }

    animate() {
        if (!this.isRunning) return;

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.hoveredNode = null;

        // Smoothly interpolate the current scale towards the target scale
        this.scale += (this.targetScale - this.scale) * 0.1;

        // Save context state before applying zoom transforms
        this.ctx.save();
        
        // Translate to the center of the canvas, scale, then translate back
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(-this.width / 2, -this.height / 2);

        // Adjust mouse coordinates based on current scale
        const scaledMouseX = (this.mouse.x - this.width / 2) / this.scale + this.width / 2;
        const scaledMouseY = (this.mouse.y - this.height / 2) / this.scale + this.height / 2;

        this.nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;

            if (node.x < 50 || node.x > this.width - 50) node.vx *= -1;
            if (node.y < 50 || node.y > this.height - 50) node.vy *= -1;

            const dx = scaledMouseX - node.x;
            const dy = scaledMouseY - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 80 * this.dpr) {
                this.hoveredNode = node;
                node.targetRadius = 8;
            } else {
                node.targetRadius = 4;
            }
            node.currentRadius += (node.targetRadius - node.currentRadius) * 0.1;
        });

        this.edges.forEach(edge => {
            const isHovered = (this.hoveredNode === edge.source || this.hoveredNode === edge.target);
            
            this.ctx.beginPath();
            this.ctx.moveTo(edge.source.x, edge.source.y);
            this.ctx.lineTo(edge.target.x, edge.target.y);
            
            if (isHovered) {
                this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)'; 
                this.ctx.lineWidth = 2 * this.dpr;
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = 'rgba(139, 92, 246, 1)';
            } else {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.lineWidth = 1 * this.dpr;
                this.ctx.shadowBlur = 0;
            }
            this.ctx.stroke();
        });

        this.ctx.shadowBlur = 0;
        this.ctx.font = `12px -apple-system, BlinkMacSystemFont, "Inter", sans-serif`;
        this.ctx.textAlign = 'center';
        
        this.nodes.forEach(node => {
            const isHovered = (this.hoveredNode === node);

            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.currentRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = isHovered ? '#FFFFFF' : '#8B5CF6';
            this.ctx.fill();

            this.ctx.fillStyle = isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)';
            if (isHovered) {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
            } else {
                this.ctx.shadowBlur = 0;
            }
            this.ctx.fillText(node.label, node.x, node.y - (15 * this.dpr));
        });

        this.ctx.restore();

        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }
}
/* =========================================
   Memory Engine Visual Coordinator
========================================= */
class MemoryEngineAnimation {
    constructor() {
        this.container = document.querySelector('.memory-engine-visual');
        if (!this.container || CONFIG.isReducedMotion) return;
        this.initObserver();
    }

    initObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Start CSS animation loop
                    this.container.classList.add('is-playing');
                } else {
                    // Pause CSS animation to save resources when offscreen
                    this.container.classList.remove('is-playing');
                }
            });
        }, { threshold: 0.3 }); // Trigger when 30% visible

        observer.observe(this.container);
    }
}
/* =========================================
   Premium Motion System (Ticket #007)
========================================= */
class PremiumMotionSystem {
    constructor() {
        if (CONFIG.isReducedMotion) return;
        
        this.glow = document.getElementById('ambient-cursor-glow');
        this.cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        
        this.parallaxElements = [];
        this.scrollY = window.scrollY;
        this.rafId = null;
        
        this.init();
    }

    init() {
        // 1. Ambient Glow Tracker
        document.body.addEventListener('mousemove', (e) => {
            document.body.classList.add('has-mouse');
            this.target.x = e.clientX;
            this.target.y = e.clientY;
        });

        // 2. 3D Tilt Cards
        const cards = document.querySelectorAll('.glass-card, .pricing-card, .compliance-card, .memory-card, .timeline-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => card.classList.add('is-tilting'));
            card.addEventListener('mousemove', (e) => this.handleTilt(e, card));
            card.addEventListener('mouseleave', () => this.resetTilt(card));
        });

        // 3. Magnetic CTA Buttons
        const ctas = document.querySelectorAll('.btn-primary');
        ctas.forEach(btn => {
            btn.addEventListener('mousemove', (e) => this.handleMagnetic(e, btn));
            btn.addEventListener('mouseleave', () => this.resetMagnetic(btn));
        });

        // 4. Parallax Observer
        const pElements = document.querySelectorAll('.section-badge, .cinematic-headline');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                entry.target.dataset.parallaxVisible = entry.isIntersecting;
            });
        }, { rootMargin: '100px' });

        pElements.forEach(el => {
            observer.observe(el);
            this.parallaxElements.push({
                el,
                speed: el.classList.contains('section-badge') ? 0.05 : 0.02
            });
        });

        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        }, { passive: true });

        this.animate();
    }

    handleTilt(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate percentages (-1 to 1) mapped to max 3 degrees
        const xPct = (x / rect.width - 0.5) * 2; 
        const yPct = (y / rect.height - 0.5) * 2; 
        
        card.style.setProperty('--rx', `${-yPct * 3}deg`);
        card.style.setProperty('--ry', `${xPct * 3}deg`);
        card.style.setProperty('--scale', '1.02');
    }

    resetTilt(card) {
        card.classList.remove('is-tilting');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--scale', '1');
    }

    handleMagnetic(e, btn) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Max magnetic pull of 8px
        const maxMove = 8;
        const xMove = (x / (rect.width / 2)) * maxMove;
        const yMove = (y / (rect.height / 2)) * maxMove;
        
        btn.style.setProperty('--mag-x', `${xMove}px`);
        btn.style.setProperty('--mag-y', `${yMove}px`);
    }

    resetMagnetic(btn) {
        btn.style.setProperty('--mag-x', '0px');
        btn.style.setProperty('--mag-y', '0px');
    }

    animate() {
        // Lerp cursor glow for silky smooth follow
        this.cursor.x += (this.target.x - this.cursor.x) * 0.15;
        this.cursor.y += (this.target.y - this.cursor.y) * 0.15;
        
        if (this.glow) {
            this.glow.style.transform = `translate3d(${this.cursor.x}px, ${this.cursor.y}px, 0)`;
        }

        // Apply Parallax only to visible elements
        this.parallaxElements.forEach(item => {
            if (item.el.dataset.parallaxVisible === 'true') {
                const offset = this.scrollY * item.speed;
                item.el.style.setProperty('--parallax-y', `${-offset}px`);
            }
        });

        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }
}

class EarlyAccessModal {
    constructor() {
        this.modal = document.getElementById('early-access-modal');
        this.openButtons = document.querySelectorAll('#early-access-btn, [data-open-early-access]');
        this.closeButtons = this.modal?.querySelectorAll('[data-close-early-access]');
        this.form = document.getElementById('early-access-form');
        this.success = document.getElementById('early-access-success');
        this.emailInput = document.getElementById('early-access-email');
        this.lastTrigger = null;

        if (!this.modal || this.openButtons.length === 0) return;

        this.init();
    }

    init() {
        this.openButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.open(button);
            });
        });

        this.closeButtons?.forEach(button => {
            button.addEventListener('click', () => this.close());
        });

        this.form?.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!this.form.checkValidity()) {
                this.form.reportValidity();
                return;
            }

            this.form.hidden = true;
            this.success.hidden = false;
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modal.classList.contains('is-open')) {
                this.close();
            }
        });
    }

    open(triggerEl = null) {
        this.lastTrigger = triggerEl;
        this.modal.classList.add('is-open');
        this.modal.setAttribute('aria-hidden', 'false');

        requestAnimationFrame(() => {
            this.emailInput?.focus();
        });
    }

    close() {
        this.modal.classList.remove('is-open');
        this.modal.setAttribute('aria-hidden', 'true');
        (this.lastTrigger || document.getElementById('early-access-btn'))?.focus();
    }
}

/* =========================================
   Boot
========================================= */
document.addEventListener('DOMContentLoaded', () => {
    new ScrollManager();
    new RevealEngine();
    new DataVisualizations();
    new InteractionManager(); 
    new NavigationObserver();
    new MockupSequence(); 
    new MemoryEngineAnimation();
    new PremiumMotionSystem();
    new EarlyAccessModal();
    
    // Canvas Engines
    new CanvasParticleSystem('ambient-canvas', 'particles');
    new LivingKnowledgeGraph('knowledge-graph-canvas'); // <-- TICKET #003 REPLACEMENT

    // Hero Reveal Sequence
    setTimeout(() => {
        document.querySelectorAll('.hero-content > *').forEach((el, i) => {
            el.classList.add('slide-up');
            setTimeout(() => el.classList.add(CONFIG.classes.visible), i * 150);
        });
    }, 100);
});