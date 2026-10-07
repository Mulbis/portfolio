document.addEventListener("DOMContentLoaded", () => {
  
  /* ==========================================================================
     1. NAVIGAATION AKTIIVISEN OSION SEURANTA (Klikkaus-esto)
     ========================================================================= */
  const navLinks = document.querySelectorAll(".navigation_list a");
  const sections = document.querySelectorAll("section[id]");

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
      
      lightbox.showModal();
      updateNavButtons();
    });
  });

  function updateLightboxContent(src, title) {
    lightboxImg.setAttribute("src", src);
    lightboxCaption.textContent = title;
  }

  function updateNavButtons() {
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

  nextBtn.addEventListener("click", showNext);
  prevBtn.addEventListener("click", showPrev);
  closeBtn.addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.close();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.open) return;
    
    if (e.key === "ArrowRight") {
      showNext();
    } else if (e.key === "ArrowLeft") {
      showPrev();
    }
  });


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

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible'); 
          observer.unobserve(entry.target); 
        }
      });
    }, observerOptions);

    observer.observe(showcaseContainer);
  }


  /* ==========================================================================
     4. NAVIGAATION SCROLLSPY (Tarkka dynaamisen ajon seuranta)
     ========================================================================= */
  const navBar = document.querySelector('.sticky');
  const scrollLinks = document.querySelectorAll('.navigation_list a[href^="#"]:not([href="#"])');
  
  if (navBar && scrollLinks.length > 0) {
    let isClickScrolling = false;

    const updateScrollspy = () => {
      if (isClickScrolling) return;

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
          const section = document.querySelector(id);
          
          if (section) {
            const sectionTop = section.offsetTop - (navHeight + 15);
            if (currentScroll >= sectionTop) {
              activeSectionId = id.substring(1);
            }
          }
        });
      }

      scrollLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === `#${activeSectionId}`);
      });
    };

    window.addEventListener('scroll', updateScrollspy, { passive: true });
    updateScrollspy();

    // 🚀 DYNAAMINEN REITIÄ KORJAAVA LIIKENNEOPASTAJA:
    scrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault(); 
        isClickScrolling = true;
        
        scrollLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          const navHeight = navBar.offsetHeight;

          // Funktio, joka laskee ja ajaa skrollauksen aina uusimpaan dynaamiseen pisteeseen
          const performScroll = () => {
            const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          };

          // Ajetaan eka skrollausliike heti
          performScroll();

          // KORJAUSAJO: Ajetaan pieni reittipäivitys matkan aikana (250ms ja 500ms kohdalla),
          // jolloin koodi huomaa jos laiterivistön animaatio venytti sivua ja korjaa maalin lennosta perille asti!
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