document.addEventListener('DOMContentLoaded', () => {
  let lightbox = document.getElementById('lightbox-modal');
  
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox-modal';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <span class="lightbox-close" id="lightbox-close" aria-label="Close lightbox">&times;</span>
      <button class="lightbox-arrow prev" id="lightbox-prev" aria-label="Previous image">&lt;</button>
      <div class="lightbox-wrapper">
        <img class="lightbox-content" id="lightbox-img" src="" alt="Enlarged view">
        <div class="lightbox-caption" id="lightbox-caption"></div>
      </div>
      <button class="lightbox-arrow next" id="lightbox-next" aria-label="Next image">&gt;</button>
    `;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const caption = document.getElementById('lightbox-caption');

  let currentIndex = 0;
  let zoomableImages = [];

  const updateLightbox = (index) => {
    currentIndex = index;
    const img = zoomableImages[currentIndex];
    lightboxImg.src = img.src;
    
    const altText = img.alt || 'Enlarged project detail';
    lightboxImg.alt = altText;
    
    let titleText = '';
    const parentItem = img.closest('.process-item, .hero-image-wrapper');
    if (parentItem) {
      const heading = parentItem.querySelector('.item-title, h1.page-title');
      if (heading) {
        titleText = heading.textContent.trim();
      }
    }
    
    if (zoomableImages.length > 1) {
      caption.innerHTML = `${titleText ? `<strong>${titleText}</strong> &bull; ` : ''}Image ${currentIndex + 1} of ${zoomableImages.length}`;
      prevBtn.style.display = 'block';
      nextBtn.style.display = 'block';
    } else {
      caption.innerHTML = titleText;
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }
  };

  const showNext = (e) => {
    e.stopPropagation();
    let nextIndex = (currentIndex + 1) % zoomableImages.length;
    updateLightbox(nextIndex);
  };

  const showPrev = (e) => {
    e.stopPropagation();
    let prevIndex = (currentIndex - 1 + zoomableImages.length) % zoomableImages.length;
    updateLightbox(prevIndex);
  };

  zoomableImages = Array.from(document.querySelectorAll('.hero-img, .process-img'));

  zoomableImages.forEach((img, index) => {
    img.addEventListener('click', () => {
      updateLightbox(index);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!lightbox.classList.contains('active')) {
        lightboxImg.src = '';
      }
    }, 300);
  };

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-wrapper')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight' && zoomableImages.length > 1) {
      updateLightbox((currentIndex + 1) % zoomableImages.length);
    } else if (e.key === 'ArrowLeft' && zoomableImages.length > 1) {
      updateLightbox((currentIndex - 1 + zoomableImages.length) % zoomableImages.length);
    }
  });

  const initTwinklingBackground = () => {
    const canvas = document.createElement('canvas');
    canvas.className = 'bg-checkers-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-2';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const size = 60;
    let cols = Math.ceil(width / size);
    let rows = Math.ceil(height / size);

    const twinkles = {};

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cols = Math.ceil(width / size);
      rows = Math.ceil(height / size);
    };

    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if ((c + r) % 2 === 0) {
            ctx.fillStyle = 'rgba(241, 179, 179, 0.02)';
            ctx.fillRect(c * size, r * size, size, size);
          }
        }
      }

      const keys = Object.keys(twinkles);
      keys.forEach(key => {
        const [c, r] = key.split(',').map(Number);
        const twinkle = twinkles[key];
        
        ctx.fillStyle = twinkle.color === 'white' 
          ? `rgba(255, 255, 255, ${twinkle.alpha})`
          : `rgba(217, 139, 139, ${twinkle.alpha})`;
          
        ctx.fillRect(c * size, r * size, size, size);

        twinkle.alpha += twinkle.dir * twinkle.speed;
        if (twinkle.alpha >= twinkle.maxAlpha) {
          twinkle.dir = -1;
        }
        if (twinkle.alpha <= 0) {
          delete twinkles[key];
        }
      });

      if (Math.random() < 0.05 && Object.keys(twinkles).length < 12) {
        const randC = Math.floor(Math.random() * cols);
        const randR = Math.floor(Math.random() * rows);
        const key = `${randC},${randR}`;
        if (!twinkles[key]) {
          twinkles[key] = {
            alpha: 0,
            maxAlpha: Math.random() * 0.06 + 0.03,
            dir: 1,
            speed: Math.random() * 0.003 + 0.002,
            color: Math.random() > 0.4 ? 'pink' : 'white'
          };
        }
      }

      requestAnimationFrame(draw);
    };

    draw();
  };

  initTwinklingBackground();
});
