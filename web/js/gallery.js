// Gallery Application Logic

async function initGallery(dataPath) {
  try {
    // 1. Fetch Nav Data and Render Navigation
    await renderNavigation();

    // 2. Fetch Album Data
    const response = await fetch(dataPath);
    const albumData = await response.json();

    // 3. Render Header
    renderHeader(albumData);

    // 4. Render Grid
    renderGrid(albumData);

    // 5. Initialize PhotoSwipe
    initPhotoSwipe();

    // 6. Init Navbar Scroll Effect
    initNavbarEffect();

    // 7. Render Footer
    renderFooter(albumData);
  } catch (error) {
    console.error("Error loading gallery:", error);
    document.body.innerHTML =
      '<div class="text-center py-20">Error loading gallery data.</div>';
  }
}

async function renderNavigation() {
  try {
    const response = await fetch("config/nav.json");
    const navItems = await response.json();
    const navLinksContainer = document.getElementById("nav-links");
    const mobileNavLinksContainer = document.getElementById("mobile-nav-links");

    // Clear existing just in case
    navLinksContainer.innerHTML = "";
    if (mobileNavLinksContainer) mobileNavLinksContainer.innerHTML = "";

    // Get current filename to set active state
    const currentPath = window.location.pathname;
    const currentFile =
      currentPath.substring(currentPath.lastIndexOf("/") + 1) || "nature.html"; // default to nature if root

    navItems.forEach((item) => {
      // Logic: if current file matches link, OR if link is 'nature.html' and current file is empty/index.html
      let isActive = false;
      if (item.link === currentFile) isActive = true;
      if (
        item.link === "nature.html" &&
        (currentFile === "" || currentFile === "index.html")
      )
        isActive = true;

      // Desktop Link
      const link = document.createElement("a");
      link.href = item.link;
      link.textContent = item.title;
      link.className = `font-bold px-3 py-1.5 rounded-md transition-all duration-300 backdrop-blur-sm ${
        isActive
          ? "bg-white text-gray-900 shadow-md scale-105"
          : "bg-white/10 text-white hover:bg-white/20 hover:scale-105"
      }`;
      navLinksContainer.appendChild(link);

      // Mobile Link
      if (mobileNavLinksContainer) {
        const mobileLink = document.createElement("a");
        mobileLink.href = item.link;
        mobileLink.textContent = item.title;
        mobileLink.className = `text-2xl font-bold transition-colors ${
          isActive ? "text-white" : "text-white/60 hover:text-white"
        }`;
        mobileNavLinksContainer.appendChild(mobileLink);
      }
    });

    // Mobile Menu Interaction
    const menuBtn = document.getElementById("mobile-menu-btn");
    const closeBtn = document.getElementById("close-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    if (menuBtn && closeBtn && mobileMenu) {
      menuBtn.addEventListener("click", () => {
        mobileMenu.classList.remove("translate-x-full");
      });
      closeBtn.addEventListener("click", () => {
        mobileMenu.classList.add("translate-x-full");
      });
    }
  } catch (error) {
    console.error("Error loading navigation:", error);
  }
}

function renderHeader(data) {
  document.title = `${data.title} - Gallery`;
  document.getElementById("album-title").textContent = data.title;

  const descEl = document.getElementById("album-desc");
  if (Array.isArray(data.description)) {
    descEl.innerHTML = data.description
      .map((line) => `<p class="block">${line}</p>`)
      .join("");
  } else {
    descEl.textContent = data.description;
  }

  const heroBg = document.getElementById("hero-bg");
  if (data.cover) {
    heroBg.style.backgroundImage = `url('${data.cover}')`;
    // Trigger animation
    requestAnimationFrame(() => {
      heroBg.classList.remove("opacity-0");
      heroBg.classList.remove("scale-105");
      heroBg.classList.add("scale-100");
    });
  }

  // Animate text in
  setTimeout(() => {
    const title = document.getElementById("album-title");
    const desc = document.getElementById("album-desc");
    title.classList.remove("translate-y-8", "opacity-0");
    desc.classList.remove("translate-y-8", "opacity-0");

    // Render Album Author if exists
    if (data.author) {
      const metaDiv = document.createElement("div");
      metaDiv.className =
        "mt-4 flex items-center text-white/80 translate-y-8 opacity-0 transition-all duration-700 delay-500";
      metaDiv.innerHTML = `
        <span class="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
            © ${data.author}
        </span>
      `;
      desc.parentNode.appendChild(metaDiv);

      requestAnimationFrame(() => {
        metaDiv.classList.remove("translate-y-8", "opacity-0");
      });
    }
  }, 100);
}

function renderGrid(data) {
  const gridContainer = document.getElementById("gallery-grid");
  let html = "";

  data.images.forEach((img) => {
    html += `
            <a href="${img.src}" 
               data-pswp-width="${img.width}" 
               data-pswp-height="${img.height}" 
               data-author="${img.author || ""}"
               target="_blank"
               class="relative block mb-4 break-inside-avoid group overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300">
                <img src="${img.thumbnail || img.src}" 
                     alt="${img.alt || ""}" 
                     class="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
                     loading="lazy" />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                ${
                  img.author
                    ? `
                <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p class="text-white text-xs font-medium tracking-wide truncate">© ${img.author}</p>
                </div>
                `
                    : ""
                }
            </a>
        `;
  });

  gridContainer.innerHTML = html;
  document.getElementById("gallery-grid").classList.remove("opacity-0");
}

function renderFooter(data) {
  // Only create footer if it doesn't exist
  if (document.querySelector("footer")) return;

  const footer = document.createElement("footer");
  footer.className = "py-12 bg-white text-center";
  footer.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p class="text-gray-500 text-sm">
                © ${new Date().getFullYear()} ${
    data.author
  }. All rights reserved.
            </p>
        </div>
    `;
  document.querySelector("main").appendChild(footer);
}

function initPhotoSwipe() {
  const lightbox = new PhotoSwipeLightbox({
    gallery: "#gallery-grid",
    children: "a",
    pswpModule: PhotoSwipe,
    // Optimize animation and transition
    // showHideOpacity: true, // Fade opacity for smoother transition
    // showAnimationDuration: 500, // Slightly slower animation
    // hideAnimationDuration: 400,
    // bgOpacity: 0.92, // Darker background
    // wheelToZoom: true, // Enable mouse wheel zoom
    // // Improve closing behavior
    // closeOnVerticalDrag: true,
    // // Add padding to avoid edge sticking
    // padding: { top: 20, bottom: 20, left: 20, right: 20 },
  });

  lightbox.on("uiRegister", function () {
    lightbox.pswp.ui.registerElement({
      name: "custom-caption",
      order: 9,
      isButton: false,
      appendTo: "root",
      onInit: (el, pswp) => {
        lightbox.pswp.on("change", () => {
          const currSlide = lightbox.pswp.currSlide;
          if (currSlide && currSlide.data && currSlide.data.element) {
            const author = currSlide.data.element.getAttribute("data-author");
            if (author) {
              el.innerHTML = `
                <div class="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                  <span class="inline-block bg-black/50 backdrop-blur-md text-white/90 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    © ${author}
                  </span>
                </div>
              `;
            } else {
              el.innerHTML = "";
            }
          }
        });
      },
    });
  });

  lightbox.init();
}

function initNavbarEffect() {
  const navbar = document.getElementById("navbar");

  // Initial check
  updateNavbar();

  window.addEventListener("scroll", updateNavbar);

  function updateNavbar() {
    if (window.scrollY > 50) {
      navbar.classList.add(
        "bg-white/90",
        "backdrop-blur-md",
        "shadow-sm",
        "text-gray-900"
      );
      navbar.classList.remove("text-white");
    } else {
      navbar.classList.remove(
        "bg-white/90",
        "backdrop-blur-md",
        "shadow-sm",
        "text-gray-900"
      );
      navbar.classList.add("text-white");
    }
  }
}
