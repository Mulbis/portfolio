document.addEventListener("DOMContentLoaded", () => {
  
  /* ==========================================================================
     1. NAVIGAATION AKTIIVISEN OSION SEURANTA (Tarkka offset-seuranta)
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

  function updateActiveNav() {
    // Jos ollaan aivan sivun yläreunassa, pakotetaan "home" aktiiviseksi
    if (window.scrollY === 0) {
      navLinks.forEach((link) => link.classList.remove("active"));
      const homeLink = document.querySelector('.navigation_list a[href="#home"]');
      if (homeLink) homeLink.classList.add("active");
      return;
    }

    let currentActiveSection = null;
    
    // 💡 SÄÄDÄ TÄTÄ LUKUA: 
    // Mitä suurempi luku (esim. 150 tai 200), sitä PIDEMPÄÄN koodi odottaa 
    // ennen kuin se vaihtaa seuraavan linkin aktiiviseksi!
    const offset = 40; 

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      
      // Katsotaan onko osion yläreuna noussut reilusti ohi suojavyöhykkeen
      if (rect.top <= offset) {
        currentActiveSection = section;
      }
    });

    if (currentActiveSection) {
      const id = currentActiveSection.getAttribute("id");
      const targetLink = document.querySelector(`.navigation_list a[href="#${id}"]`);
      
      if (targetLink && !targetLink.classList.contains("active")) {
        navLinks.forEach((link) => link.classList.remove("active"));
        targetLink.classList.add("active");
      }
    }
  }

  // Ajetaan kuuntelijat tehokkaasti ilman viiveitä
  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();


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

      // Haetaan ryhmän (esim. rel="fractals") kaikki kuvat selausta varten
      if (groupName) {
        currentGroupItems = Array.from(document.querySelectorAll(`.lightbox-trigger[rel="${groupName}"]`));
        currentIndex = currentGroupItems.indexOf(trigger);
      } else {
        currentGroupItems = [trigger];
        currentIndex = 0;
      }

      updateLightboxContent(currentSrc, currentTitle);
      
      // Avataan selaimen natiivi dialogi modaalina
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

  // Nappien tapahtumakuuntelijat
  nextBtn.addEventListener("click", showNext);
  prevBtn.addEventListener("click", showPrev);
  closeBtn.addEventListener("click", () => lightbox.close());

  // Suljetaan dialogi, jos klikataan kuvan ulkopuolelle sumennukseen
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.close();
    }
  });

  // Nuolinäppäintuki tietokoneella selaamiseen (Oikealle / Vasemmalle)
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
     4. NAVIGAATION SCROLLSPY (Puhdas Matemaattinen Skrollaustunnistus)
     ========================================================================= */
  const navBar = document.querySelector('.sticky');
  const scrollLinks = document.querySelectorAll('.navigation_list a[href^="#"]:not([href="#"])');
  
  if (navBar && scrollLinks.length > 0) {
    let isClickScrolling = false;

    // Funktio, joka laskee ja päivittää aktiivisen linkin lennosta
    const updateScrollspy = () => {
      // Jos skrollaus johtuu linkin klikkauksesta, annetaan sen hallita tilannetta
      if (isClickScrolling) return;

      // Haetaan nykyinen skrollausasema ja ikkunan korkeudet mahdollisimman yhteensopivasti
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const totalDocHeight = document.documentElement.scrollHeight;
      const navHeight = navBar.offsetHeight;
      
      // 🚀 SATAVARMA JA KUMMITUSVAPAA POHJATARKISTUS:
      // Jos näytön alareuna + 60px pelivara saavuttaa tai ylittää sivun kokonaiskorkeuden,
      // ollaan sataprosenttisen varmasti sivun aivan alalaidassa!
      const isAtBottom = (windowScrollTop() + windowHeight >= totalDocHeight - 60);

      // Apufunktio, joka varmistaa skrollausarvon lukemisen eri selaimilla
      function windowScrollTop() {
        return window.pageYOffset || document.scrollingElement.scrollTop || document.documentElement.scrollTop;
      }

      let activeSectionId = 'home'; // Oletusarvo

      if (isAtBottom) {
        // ⚡ Pakotetaan se iMacilla jumiutuva vika linkki aktiiviseksi!
        activeSectionId = 'contact';
      } else {
        // Muuten ajetaan sun loistava matemaattinen osiotarkistus
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

      // Päivitetään linkkien aktiiviset luokat (.active)
      scrollLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === `#${activeSectionId}`);
      });
    };


    // Kuunnellaan skrollausta aktiivisesti (sekä hiirellä että Firefoxin smooth scrollilla)
    window.addEventListener('scroll', updateScrollspy, { passive: true });
    
    // Alustetaan tilanne heti sivun latautuessa
    updateScrollspy();

    // Navigaation linkkien klikkaaminen (pakotetaan heti aktiiviseksi)
    scrollLinks.forEach(link => {
      link.addEventListener('click', () => {
        isClickScrolling = true;
        
        // Aktivoidaan klikattu linkki heti ilman odottelua
        scrollLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Avataan lukitus vasta kun smooth scroll -animaatio on varmasti loppunut
        setTimeout(() => {
          isClickScrolling = false;
          updateScrollspy(); // Tehdään lopputarkistus
        }, 1000);
      });
    });
  }

    // ==========================================================================
    // 5. DARK MODE / LIGHT MODE TOGGLE
    // ==========================================================================
    const toggleButton = document.getElementById('theme-toggle');
    
    // Tarkistetaan onko käyttäjä valinnut teeman aiemmin (löytyykö selaimen muistista)
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }

    // Varmistetaan, että painike on olemassa ennen kuin kuunnellaan klikkausta
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

    // ==========================================================================
    // 6. MONITASOINEN GALLERIAN "SHOW MORE" (Kummitusvapaa versio)
    // ==========================================================================
    const btn1 = document.getElementById('btn-show-level-1');
    const btn2 = document.getElementById('btn-show-level-2');
    
    const level1Items = document.querySelectorAll('.lightbox-trigger.level-1');
    const level2Items = document.querySelectorAll('.lightbox-trigger.level-2');

    // Eka klikkaus: Tuo Tason 1 kuvat ja vaihtaa napit
    if (btn1) {
      btn1.addEventListener('click', () => {
        level1Items.forEach(item => item.classList.add('is-visible'));
        btn1.classList.add('is-hidden'); // Piilotetaan eka nappi luokalla!
        
        if (btn2) {
          btn2.classList.remove('is-hidden'); // Tuodaan toka nappi näkyviin!
        }
      });
    }

    // Toka klikkaus: Tuo Tason 2 kuvat ja häivyttää tokan napin
    if (btn2) {
      btn2.addEventListener('click', () => {
        level2Items.forEach(item => item.classList.add('is-visible'));
        btn2.classList.add('is-hidden'); // Piilotetaan myös toka nappi!
      });
    }


      // ==========================================================================
    // 7. ARTIKKELIN "READ MORE" FUNKTIO - (Täydellinen versio häivytyksen ohjauksella)
    // ==========================================================================
    const articleButtons = document.querySelectorAll('.toggle-article-btn');

    articleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Etsitään painikkeen yläpuolella oleva tekstilaatikko ja koko artikkeli-isäntä
        const content = btn.previousElementSibling;
        const postParent = btn.closest('.hidden_post');
        
        if (content && content.classList.contains('article-body')) {
          content.classList.toggle('is-open');
          
          // Vaihdetaan napin teksti ja ohjataan intro-laatikon häivytystä isännän kautta
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



}); // 🚀 SE AINOA JA VIIMEINEN SULKU JOKA LUKITSEE KOKO TIEDOSTON PUHTAASTI KIINNI!
