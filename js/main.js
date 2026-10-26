document.addEventListener("DOMContentLoaded", () => {
  
  /* ==========================================================================
     1. NAVIGAATION AKTIIVISEN OSION SEURANTA (Klikkaus-esto)
     ========================================================================= */
  const navLinks = document.querySelectorAll(".navigation_list a");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.classList.contains("active")) {
        e.preventDefault(); // Estää selaimen turhan pikselihypyn
      }
    });
  });

  /* ==========================================================================
     2. GLOBAALI NATIIVI LIGHTBOX-GALLERIA (<dialog>)
     ========================================================================= */
  const lightbox = document.getElementById("global-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  
  const closeBtn = document.getElementById("close-lightbox-btn");
  const prevBtn = document.getElementById("prev-lightbox-btn");
  const nextBtn = document.getElementById("next-lightbox-btn");

  let currentGroupItems = [];
  let currentIndex = 0;

  const triggers = document.querySelectorAll(".lightbox-trigger");

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();

      const groupName = trigger.getAttribute("rel");
      const currentSrc = trigger.getAttribute("href");
      const currentTitle = trigger.getAttribute("title") || "";

      if (groupName) {
        const allInGroup = Array.from(document.querySelectorAll(`.lightbox-trigger[rel="${groupName}"]`));
        
        currentGroupItems = allInGroup.filter(item => {
          const isLevel1 = item.classList.contains('level-1');
          const isLevel2 = item.classList.contains('level-2');
          const isVisible = item.classList.contains('is-visible');
          
          return (!isLevel1 && !isLevel2) || isVisible;
        });

        currentIndex = currentGroupItems.indexOf(trigger);
      } else {
        currentGroupItems = [trigger];
        currentIndex = 0;
      }

      updateLightboxContent(currentSrc, currentTitle);
      
      if (lightbox) {
        lightbox.showModal();
        updateNavButtons();
        document.body.classList.add("lightbox-open");
      }
    });
  });


  function updateLightboxContent(src, title) {
    if (lightboxImg) lightboxImg.setAttribute("src", src);
    if (lightboxCaption) lightboxCaption.textContent = title;
  }

  function updateNavButtons() {
    if (!prevBtn || !nextBtn) return;
    if (currentGroupItems.length <= 1) {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    } else {
      prevBtn.style.display = "block";
      nextBtn.style.display = "block";
    }
  }

  function showNext() {
    if (currentGroupItems.length <= 1) return;
    currentIndex = (currentIndex + 1) % currentGroupItems.length;
    const nextItem = currentGroupItems[currentIndex];
    updateLightboxContent(nextItem.getAttribute("href"), nextItem.getAttribute("title") || "");
  }

  function showPrev() {
    if (currentGroupItems.length <= 1) return;
    currentIndex = (currentIndex - 1 + currentGroupItems.length) % currentGroupItems.length;
    const nextItem = currentGroupItems[currentIndex];
    updateLightboxContent(nextItem.getAttribute("href"), nextItem.getAttribute("title") || "");
  }

  if (nextBtn) nextBtn.addEventListener("click", showNext);
  if (prevBtn) prevBtn.addEventListener("click", showPrev);
  
  if (closeBtn && lightbox) {
    closeBtn.addEventListener("click", () => {
      lightbox.close();
      document.body.classList.remove("lightbox-open");
    });
  }

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.close();
        document.body.classList.remove("lightbox-open");
      }
    });

    lightbox.addEventListener("close", () => {
      document.body.classList.remove("lightbox-open");
    });
  }

  document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.open) return;
    
    if (e.key === "ArrowRight") {
      showNext();
    } else if (e.key === "ArrowLeft") {
      showPrev();
    }
  });

  if (lightbox) {
    let kosketusAlkuX = 0;
    let kosketusLoppuX = 0;
    const pyhkaisyRaja = 40;

    lightbox.addEventListener('touchstart', (e) => {
      kosketusAlkuX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      kosketusLoppuX = e.changedTouches[0].screenX;
      
      const etaisyys = kosketusLoppuX - kosketusAlkuX;

      if (Math.abs(etaisyys) > pyhkaisyRaja) {
        if (etaisyys < 0) {
          showNext();
        } else {
          showPrev();
        }
      }
    }, { passive: true });
  }


  /* ==========================================================================
     3. LAITERIVISTÖN INTERSECTION OBSERVER (Animaatiot livenä)
     ========================================================================= */
  const showcaseContainer = document.querySelector('.hardware-showcase-container');

  if (showcaseContainer) {
    const observerOptions = {
      root: null, 
      rootMargin: '0px',
      threshold: 0.15 
    };

    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible'); 
          observerInstance.unobserve(entry.target); 
        }
      });
    }, observerOptions);

    observer.observe(showcaseContainer);
  }


  /* ==========================================================================
     4. NAVIGAATION SCROLLSPY JA ANKKURILINKIT
     ========================================================================= */
  const navBar = document.querySelector('.sticky');
  const scrollLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  
  let isClickScrolling = false; 

  if (scrollLinks.length > 0) {

    const updateScrollspy = () => {
      if (isClickScrolling || !navBar) return;

      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const totalDocHeight = document.documentElement.scrollHeight;
      const navHeight = navBar.offsetHeight;
      
      const isAtBottom = (window.pageYOffset || document.documentElement.scrollTop) + windowHeight >= totalDocHeight - 60;

      let activeSectionId = 'home';

      if (isAtBottom) {
        activeSectionId = 'contact';
      } else {
        scrollLinks.forEach(link => {
          const id = link.getAttribute('href');
          if (id && id.startsWith('#')) {
            const section = document.querySelector(id);
            if (section) {
              const sectionTop = section.offsetTop - (navHeight + 15);
              if (currentScroll >= sectionTop) {
                activeSectionId = id.substring(1);
              }
            }
          }
        });
      }

      const navMenuLinks = document.querySelectorAll('.navigation_list a[href^="#"]');
      navMenuLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === `#${activeSectionId}`);
      });
    };

    let scrollTimeout;

    window.addEventListener('scroll', () => {
      if (!scrollTimeout) {
        scrollTimeout = requestAnimationFrame(() => {
          updateScrollspy();
          scrollTimeout = null;
        });
      }
    }, { passive: true });

    updateScrollspy();

    scrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault(); 
        isClickScrolling = true;
        
        const navMenuLinks = document.querySelectorAll('.navigation_list a[href^="#"]');
        navMenuLinks.forEach(l => l.classList.remove('active'));

        const targetId = link.getAttribute('href');
        const targetSection = targetId ? document.querySelector(targetId) : null;
        
        if (targetSection) {
          const navHeight = navBar ? navBar.offsetHeight : 0;

          const performScroll = () => {
            const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - navHeight + 20;
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          };

          performScroll();
          setTimeout(performScroll, 250);
          setTimeout(performScroll, 500);
        }

        setTimeout(() => {
          isClickScrolling = false;
          updateScrollspy(); 
        }, 1100);
      });
    });
  }


 /* ==========================================================================
   5. TEEMAN VAIHTO (DARK / LIGHT MODE)
   ========================================================================== */
  const themeBtn = document.getElementById('theme-toggle');

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      themeBtn.textContent = newTheme === 'dark' ? '🌙' : '☀️';
      localStorage.setItem('theme', newTheme);
    });
  }

  /* ==========================================================================
     6. MONITASOINEN GALLERIAN "SHOW MORE"
     ========================================================================== */
  const btn1 = document.getElementById('btn-show-level-1');
  const btn2 = document.getElementById('btn-show-level-2');
  const level1Items = document.querySelectorAll('.lightbox-trigger.level-1');
  const level2Items = document.querySelectorAll('.lightbox-trigger.level-2');
  
  if (btn1) {
    btn1.addEventListener('click', () => {
      level1Items.forEach(item => item.classList.add('is-visible', 'is-revealed'));
      btn1.classList.add('is-hidden');
      if (btn2) {
        btn2.classList.remove('is-hidden');
      }
    });
  }
  if (btn2) {
    btn2.addEventListener('click', () => {
      level2Items.forEach(item => item.classList.add('is-visible', 'is-revealed'));
      btn2.classList.add('is-hidden');
    });
  }


 /* ==========================================================================
     7. ARTIKKELIN "READ MORE" FUNKTIO
     ========================================================================= */
  const articleButtons = document.querySelectorAll('.toggle-article-btn');

  articleButtons.forEach(btn => {
    let scrollPositionBeforeOpen = 0;

    btn.addEventListener("click", () => {
      const content = btn.previousElementSibling;
      const postParent = btn.closest(".hidden_post");
      
      if (content && content.classList.contains("article-body")) {
        const isOpen = content.classList.contains("is-open");
        
        if (!isOpen) {
          scrollPositionBeforeOpen = window.pageYOffset;
          content.classList.add("is-open");
          btn.textContent = "Read Less";
          if (postParent) postParent.classList.add("has-opened");
        } else {
          content.classList.remove("is-open");
          if (postParent) postParent.classList.remove("has-opened");

          window.scrollTo({
            top: scrollPositionBeforeOpen,
            behavior: 'smooth'
          });

          setTimeout(() => {
            btn.textContent = "Read More";
          }, 550);
        }
      }
    });
  });

  /* =========================================
     8. HAMBURGER MENU
     ========================================= */
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNavList = document.getElementById('main-nav-list');
  const mobileNavLinks = document.querySelectorAll('.navigation_list a');

  if (mobileMenuToggle && mobileNavList) {
    mobileMenuToggle.addEventListener('click', () => {
      const isOpen = mobileNavList.classList.toggle('is-open');
      mobileMenuToggle.classList.toggle('is-active');
      mobileMenuToggle.setAttribute('aria-expanded', isOpen);
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavList.classList.remove('is-open');
        mobileMenuToggle.classList.remove('is-active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
});


/* ==========================================================================
   9. SMART STICKY NAVIGATION CONTROLLER (IIFE-suojaus)
   ========================================================================== */
(function() {
  const navBar = document.querySelector('.sticky');

  if (navBar) {
    let smartLastScrollY = window.scrollY || document.documentElement.scrollTop;
    let navTicking = false;

    window.addEventListener('scroll', () => {
      if (window.isScrolling || window.isClickScrolling) {
        smartLastScrollY = window.scrollY || document.documentElement.scrollTop;
        return;
      }

      if (navTicking) return;

      navTicking = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY || document.documentElement.scrollTop;

        if (currentScrollY <= 60) {
          navBar.classList.remove('nav-hidden');
          smartLastScrollY = currentScrollY;
          navTicking = false;
          return;
        }

        const delta = 10;
        if (Math.abs(currentScrollY - smartLastScrollY) < delta) {
          navTicking = false;
          return;
        }

        if (currentScrollY > smartLastScrollY && currentScrollY > 60) {
          navBar.classList.add('nav-hidden');
        } else if (currentScrollY < smartLastScrollY) {
          navBar.classList.remove('nav-hidden');
        }

        smartLastScrollY = currentScrollY;
        navTicking = false;
      });
    }, { passive: true });
  }
})();


/* ==========================================================================
   10. BUTTERY VANILLA SCROLL + ANCHORS (IIFE-suojaus)
   ========================================================================== */
(function() {
  if (typeof window.currentScroll === 'undefined') {
    window.currentScroll = window.scrollY;
    window.targetScroll = window.scrollY;
    window.isScrolling = false;
    window.isClickScrolling = false;
  }

  const ease = 0.05;
  const scrollSpeed = 0.85;

  window.addEventListener('wheel', (e) => {
    e.preventDefault(); 
    
    window.targetScroll += e.deltaY * scrollSpeed;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.targetScroll = Math.max(0, Math.min(window.targetScroll, maxScroll));
    
    if (!window.isScrolling) {
      window.isScrolling = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: false });

  function updateScroll() {
    window.currentScroll += (window.targetScroll - window.currentScroll) * ease;
    window.scrollTo(0, window.currentScroll);
    
    if (Math.abs(window.targetScroll - window.currentScroll) > 0.5) {
      requestAnimationFrame(updateScroll);
    } else {
      window.isScrolling = false;
      setTimeout(() => {
        window.isClickScrolling = false;
      }, 100);
    }
  }

  window.addEventListener('scroll', () => {
    if (!window.isScrolling) {
      window.currentScroll = window.scrollY;
      window.targetScroll = window.scrollY;
    }
  });

  const navBar = document.querySelector('.sticky');

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        window.isClickScrolling = true; 
        
        const isMobile = window.innerWidth <= 768;
        const navHeight = isMobile ? 44 : (navBar ? navBar.offsetHeight : 0);
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        
        let elementPosition = 0;
        if (targetId !== '#home') {
          elementPosition = targetEl.offsetTop - navHeight;
        }
        
        window.targetScroll = Math.max(0, Math.min(elementPosition, maxScroll));
        
        if (!window.isScrolling) {
          window.isScrolling = true;
          requestAnimationFrame(updateScroll);
        }
      }
    });
  });
})();