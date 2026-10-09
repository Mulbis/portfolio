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

  // Kuunnellaan gallerian linkkien klikkauksia
  const triggers = document.querySelectorAll(".lightbox-trigger");

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault(); // Estetään selaimen oletushypyt

      const groupName = trigger.getAttribute("rel");
      const currentSrc = trigger.getAttribute("href");
      const currentTitle = trigger.getAttribute("title") || "";

      if (groupName) {
        currentGroupItems = Array.from(document.querySelectorAll(`.lightbox-trigger[rel="${groupName}"]`));
        currentIndex = currentGroupItems.indexOf(trigger);
      } else {
        currentGroupItems = [trigger];
        currentIndex = 0;
      }

      updateLightboxContent(currentSrc, currentTitle);
      
      if (lightbox) {
        lightbox.showModal();
        updateNavButtons();
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
  if (closeBtn && lightbox) closeBtn.addEventListener("click", () => lightbox.close());

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.close();
      }
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

  /* LISÄTTY: Mobiilipyhkäisy (Touch Swipe) – Optimoitu ja herkempi versio */
  if (lightbox) {
    let kosketusAlkuX = 0;
    let kosketusLoppuX = 0;
    
    // MUUTETTU: Tiputettu raja arvoon 30px (paljon herkempi ja lyhyempi pyhkäisy riittää!)
    const pyhkaisyRaja = 30; 

    lightbox.addEventListener('touchstart', (e) => {
      kosketusAlkuX = e.changedTouches.screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      kosketusLoppuX = e.changedTouches.screenX;
      
      const etaisyys = kosketusLoppuX - kosketusAlkuX;

      if (Math.abs(etaisyys) > pyhkaisyRaja) {
        // TÄMÄ HOITAA LUKITUKSEN: Estää taustasivun liikkumisen sivusuunnassa pyhkäisyn aikana!
        if (e.cancelable) e.preventDefault(); 
        
        if (etaisyys < 0) {
          // Sormi liikkui oikealta vasemmalle -> Seuraava kuva
          showNext();
        } else {
          // Sormi liikkui vasemmalta oikealle -> Edellinen kuva
          showPrev();
        }
      }
    }); // Huom: poistettu { passive: true } touchendista, jotta preventDefault() saa toimia!
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
  
  if (scrollLinks.length > 0) {
    let isClickScrolling = false;

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

    window.addEventListener('scroll', updateScrollspy, { passive: true });
    updateScrollspy();

    // Reittiä korjaava opastaja kaikille ankkurilinkeille (mukaan lukien Hero)
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
            const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
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
        }, 850);
      });
    });
  }


  /* ==========================================================================
     5. DARK MODE / LIGHT MODE TOGGLE
     ========================================================================== */
  const toggleButton = document.getElementById('theme-toggle');
  
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }

  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      let theme = document.documentElement.getAttribute('data-theme');
      
      if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
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
      level1Items.forEach(item => item.classList.add('is-visible'));
btn1.classList.add('is-hidden');
if (btn2) {
btn2.classList.remove('is-hidden');
}
});
}
if (btn2) {
btn2.addEventListener('click', () => {
level2Items.forEach(item => item.classList.add('is-visible'));
btn2.classList.add('is-hidden');
});
}
/* ==========================================================================
7. ARTIKKELIN "READ MORE" FUNKTIO
========================================================================== */
const articleButtons = document.querySelectorAll('.toggle-article-btn');
articleButtons.forEach(btn => {
btn.addEventListener('click', () => {
const content = btn.previousElementSibling;
const postParent = btn.closest('.hidden_post');
if (content && content.classList.contains('article-body')) {
content.classList.toggle('is-open');
if (content.classList.contains('is-open')) {
btn.textContent = 'Read Less';
if (postParent) postParent.classList.add('has-opened');
} else {
btn.textContent = 'Read More';
if (postParent) postParent.classList.remove('has-opened');
}
}
});
});
});