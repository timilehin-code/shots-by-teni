document.addEventListener('DOMContentLoaded', () => {
	const currentYear = document.querySelector('#current-year');
	if (currentYear) currentYear.textContent = new Date().getFullYear();
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const revealItems = document.querySelectorAll('.section-reveal');
	const modal = document.querySelector('.video-modal');
	const modalVideo = document.querySelector('.modal-video');
	const modalTitle = document.querySelector('#modal-title');
	const modalContext = document.querySelector('.modal-context');
	const closeButton = document.querySelector('.modal-close');
	const openModal = (card) => { const startPlayback = () => modalVideo.play().catch(() => {}); modalVideo.pause(); modalVideo.src = card.dataset.video; modalVideo.load(); modalVideo.addEventListener('loadeddata', startPlayback, { once: true }); modalTitle.textContent = card.dataset.title; modalContext.textContent = card.dataset.context; modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open'); closeButton.focus(); };
	const closeModal = () => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); modalVideo.pause(); modalVideo.removeAttribute('src'); modalVideo.load(); document.body.classList.remove('modal-open'); };
	document.querySelectorAll('.film-card').forEach((card) => { const preview = card.querySelector('video'); const trigger = card.querySelector('.play-mark'); trigger.addEventListener('pointerdown', (event) => event.stopPropagation()); trigger.addEventListener('click', (event) => { event.stopPropagation(); openModal(card); }); card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openModal(card); } }); card.addEventListener('mouseenter', () => preview.play().catch(() => {})); card.addEventListener('mouseleave', () => preview.pause()); });
	closeButton.addEventListener('click', closeModal); modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); }); document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
	const reel = document.querySelector('[data-drag-scroll]'); let isDown = false; let startX = 0; let scrollStart = 0;
	reel.addEventListener('pointerdown', (event) => { isDown = true; startX = event.clientX; scrollStart = reel.scrollLeft; reel.setPointerCapture(event.pointerId); }); reel.addEventListener('pointermove', (event) => { if (isDown) reel.scrollLeft = scrollStart - (event.clientX - startX) * 1.2; }); reel.addEventListener('pointerup', () => { isDown = false; }); reel.addEventListener('pointercancel', () => { isDown = false; });
	const updateScrollbar = () => { const progress = reel.scrollWidth > reel.clientWidth ? reel.scrollLeft / (reel.scrollWidth - reel.clientWidth) : 0; document.querySelector('.reel-scrollbar span').style.left = `${progress * 84}%`; }; reel.addEventListener('scroll', updateScrollbar, { passive:true });
	revealItems.forEach((item) => { if (reduceMotion) item.classList.add('is-visible'); else new IntersectionObserver((entries, observer) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, { threshold:.12 }).observe(item); });
	if (!reduceMotion && window.Lenis) { const lenis = new Lenis({ lerp:.08, smoothWheel:true }); const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); }; requestAnimationFrame(raf); if (window.gsap && window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add((time) => lenis.raf(time * 1000)); gsap.ticker.lagSmoothing(0); } }
	if (!reduceMotion && window.gsap) { gsap.to('.phone-wrap', { y:-24, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:true } }); gsap.from('.hero-copy > *', { y:24, opacity:0, filter:'blur(8px)', duration:.9, stagger:.08, ease:'power2.out' }); }
});
