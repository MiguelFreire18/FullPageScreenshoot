// Content Script - Extensión de Capturas de Pantalla para Brave & Chrome (Windows / Mac)

(function () {
  // Limpiar cualquier residuo de instancias previas (por recargas de la extensión)
  const oldBanner = document.getElementById('screenshot-ext-banner-root');
  if (oldBanner) oldBanner.remove();
  const oldOverlay = document.getElementById('screenshot-ext-area-overlay');
  if (oldOverlay) oldOverlay.remove();
  const oldToast = document.getElementById('screenshot-ext-toast');
  if (oldToast) oldToast.remove();

  let isCapturing = false;

  // Escuchar mensajes del Service Worker (clic en icono 📸)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'TOGGLE_BANNER') {
      toggleBanner();
      sendResponse({ status: 'ok' });
    }
    return true;
  });

  function toggleBanner() {
    const existing = document.getElementById('screenshot-ext-banner-root');
    if (existing) {
      removeBanner(false);
    } else {
      createBanner();
    }
  }

  function removeBanner(immediate = false) {
    const bannerElement = document.getElementById('screenshot-ext-banner-root');
    if (!bannerElement) return;

    if (immediate) {
      if (bannerElement.parentNode) {
        bannerElement.parentNode.removeChild(bannerElement);
      }
    } else {
      bannerElement.style.animation = 'screenshot-ext-fade-out 0.15s forwards';
      setTimeout(() => {
        const el = document.getElementById('screenshot-ext-banner-root');
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }, 150);
    }
  }

  function createBanner() {
    if (document.getElementById('screenshot-ext-banner-root') || isCapturing) return;

    const bannerElement = document.createElement('div');
    bannerElement.id = 'screenshot-ext-banner-root';
    bannerElement.innerHTML = `
      <div class="screenshot-ext-banner-bar">
        <div class="screenshot-ext-brand">
          <span class="screenshot-ext-brand-icon">📸</span>
          <span>Captura <span class="screenshot-ext-brand-text">PRO</span></span>
        </div>
        <div class="screenshot-ext-btn-group">
          <button id="screenshot-ext-btn-full" class="screenshot-ext-btn screenshot-ext-btn-full" title="Capturar toda la página con scroll automático">
            <span>📜</span>
            <span>Pantalla completa</span>
          </button>
          <button id="screenshot-ext-btn-custom" class="screenshot-ext-btn screenshot-ext-btn-custom" title="Seleccionar un área específica con el cursor 👈🏻">
            <span>👈🏻</span>
            <span>Captura personalizada</span>
          </button>
          <button id="screenshot-ext-btn-close" class="screenshot-ext-btn-close" title="Cerrar">✕</button>
        </div>
      </div>
    `;

    document.body.appendChild(bannerElement);

    document.getElementById('screenshot-ext-btn-full').addEventListener('click', () => {
      removeBanner(true);
      captureFullPage();
    });

    document.getElementById('screenshot-ext-btn-custom').addEventListener('click', () => {
      removeBanner(true);
      startCustomAreaCapture();
    });

    document.getElementById('screenshot-ext-btn-close').addEventListener('click', () => {
      removeBanner(false);
    });
  }

  // =========================================================================
  // 1. CAPTURA DE PANTALLA COMPLETA: MÚLTIPLES CAPTURAS Y ENSAMBLADO EN CANVAS
  // =========================================================================
  async function captureFullPage() {
    if (isCapturing) return;
    isCapturing = true;

    removeBanner(true);

    const originalScrollX = window.scrollX || (document.documentElement ? document.documentElement.scrollLeft : 0);
    const originalScrollY = getScrollPosition();
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body ? document.body.style.overflow : '';
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;

    document.documentElement.style.scrollBehavior = 'auto';
    if (document.body) document.body.style.scrollBehavior = 'auto';

    showToast('📸 Preparando captura de toda la página...', true);

    try {
      const layout = analyzePageLayout();
      const viewportWidth = layout.viewportWidth;
      const viewportHeight = layout.viewportHeight;
      const dpr = layout.dpr;
      const totalHeight = layout.fullHeight;
      const mainContainer = layout.mainContainer;

      const positions = [];
      const maxScrollY = Math.max(0, totalHeight - viewportHeight);
      
      let stepY = 0;
      while (stepY < maxScrollY) {
        positions.push(stepY);
        stepY += viewportHeight;
      }
      positions.push(maxScrollY);

      const uniquePositions = [...new Set(positions)];
      const totalSteps = uniquePositions.length;

      const fixedElements = getFixedElements();
      const capturedSlices = [];

      for (let i = 0; i < totalSteps; i++) {
        const targetY = uniquePositions[i];

        if (i > 0) {
          toggleFixedElements(fixedElements, false);
        } else {
          toggleFixedElements(fixedElements, true);
        }

        performScroll(targetY, mainContainer);
        await sleep(320);

        const actualY = getScrollPosition(mainContainer);

        hideToast();
        await sleep(40);

        const res = await sendRuntimeMessage({ action: 'CAPTURE_VISIBLE_TAB' });
        if (!res || !res.success || !res.dataUrl) {
          throw new Error(res?.error || `Error al capturar la sección ${i + 1}`);
        }

        capturedSlices.push({
          targetY: targetY,
          actualY: actualY,
          isLast: (i === totalSteps - 1),
          dataUrl: res.dataUrl
        });

        const progressPercent = Math.round(((i + 1) / totalSteps) * 100);
        showToast(`📸 Capturando parte ${i + 1} de ${totalSteps} (${progressPercent}%)...`, true);
      }

      toggleFixedElements(fixedElements, true);

      performScroll(originalScrollY, mainContainer);
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
      document.documentElement.style.overflow = originalHtmlOverflow;
      if (document.body) document.body.style.overflow = originalBodyOverflow;

      showToast('🎨 Uniendo todas las partes en una sola imagen...', true);
      await sleep(50);

      let finalCanvasHeight = totalHeight;
      if (capturedSlices.length > 0) {
        const lastSlice = capturedSlices[capturedSlices.length - 1];
        finalCanvasHeight = Math.max(totalHeight, lastSlice.actualY + viewportHeight);
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewportWidth * dpr);
      canvas.height = Math.floor(finalCanvasHeight * dpr);
      const ctx = canvas.getContext('2d');

      for (let i = 0; i < capturedSlices.length; i++) {
        const slice = capturedSlices[i];
        const img = await loadImage(slice.dataUrl);

        let drawY = slice.actualY * dpr;
        if (slice.isLast) {
          drawY = (finalCanvasHeight - viewportHeight) * dpr;
        }

        ctx.drawImage(img, 0, Math.floor(drawY), img.width, img.height);
      }

      showToast('💾 Guardando captura completa en Descargas...', true);

      const finalDataUrl = canvas.toDataURL('image/png');
      const filename = generateCleanScreenshotFilename();

      const downloadRes = await sendRuntimeMessage({
        action: 'DOWNLOAD_SCREENSHOT',
        dataUrl: finalDataUrl,
        filename: filename
      });

      if (downloadRes && downloadRes.success) {
        showToast('✅ ¡Web completa capturada y guardada en Descargas!', false, 4500);
      } else {
        showToast('⚠️ No se pudo descargar el archivo.', false, 4500);
      }

    } catch (err) {
      console.error('Error en captura de página completa:', err);
      performScroll(originalScrollY);
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
      document.documentElement.style.overflow = originalHtmlOverflow;
      if (document.body) document.body.style.overflow = originalBodyOverflow;
      showToast('❌ Error al capturar la página completa', false, 4500);
    } finally {
      isCapturing = false;
    }
  }

  // =========================================================================
  // 2. CAPTURA PERSONALIZADA (SELECTOR DE ÁREA CON CURSOR 👈🏻 Y COLOR #ccff00)
  // =========================================================================
  function startCustomAreaCapture() {
    if (isCapturing) return;

    removeBanner(true);

    const overlay = document.createElement('div');
    overlay.id = 'screenshot-ext-area-overlay';

    const customPointer = document.createElement('div');
    customPointer.id = 'screenshot-ext-custom-pointer';
    customPointer.textContent = '👈🏻';

    const hintBadge = document.createElement('div');
    hintBadge.id = 'screenshot-ext-hint-badge';
    hintBadge.innerHTML = `
      <span>👈🏻</span>
      <span>Haz clic y arrastra para seleccionar el área • Pulsa <b>ESC</b> para cancelar</span>
    `;

    const selectionBox = document.createElement('div');
    selectionBox.id = 'screenshot-ext-selection-box';
    selectionBox.innerHTML = `
      <div class="screenshot-ext-handle screenshot-ext-handle-tl"></div>
      <div class="screenshot-ext-handle screenshot-ext-handle-tr"></div>
      <div class="screenshot-ext-handle screenshot-ext-handle-bl"></div>
      <div class="screenshot-ext-handle screenshot-ext-handle-br"></div>
      <div id="screenshot-ext-dimension-badge">0 × 0 px</div>
    `;

    overlay.appendChild(customPointer);
    overlay.appendChild(hintBadge);
    overlay.appendChild(selectionBox);
    document.body.appendChild(overlay);

    const dimensionBadge = selectionBox.querySelector('#screenshot-ext-dimension-badge');

    let isSelecting = false;
    let startX = 0;
    let startY = 0;

    const onMouseMove = (e) => {
      customPointer.style.left = `${e.clientX}px`;
      customPointer.style.top = `${e.clientY}px`;

      if (!isSelecting) return;

      const currentX = e.clientX;
      const currentY = e.clientY;

      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      selectionBox.style.display = 'block';
      selectionBox.style.left = `${x}px`;
      selectionBox.style.top = `${y}px`;
      selectionBox.style.width = `${width}px`;
      selectionBox.style.height = `${height}px`;

      dimensionBadge.textContent = `${Math.round(width)} × ${Math.round(height)} px`;
    };

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;

      customPointer.style.opacity = '0';

      selectionBox.style.display = 'block';
      selectionBox.style.left = `${startX}px`;
      selectionBox.style.top = `${startY}px`;
      selectionBox.style.width = '0px';
      selectionBox.style.height = '0px';
      dimensionBadge.textContent = '0 × 0 px';
    };

    const cleanup = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keydown', onKeyDown);
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        cleanup();
        createBanner();
      }
    };

    const onMouseUp = async (e) => {
      if (!isSelecting) return;
      isSelecting = false;

      const currentX = e.clientX;
      const currentY = e.clientY;

      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      cleanup();

      if (width < 10 || height < 10) {
        createBanner();
        return;
      }

      await sleep(60);

      try {
        isCapturing = true;
        showToast('📸 Procesando captura seleccionada...', true);

        const response = await sendRuntimeMessage({ action: 'CAPTURE_VISIBLE_TAB' });
        if (!response || !response.success || !response.dataUrl) {
          throw new Error(response?.error || 'No se pudo capturar la pantalla');
        }

        const img = await loadImage(response.dataUrl);
        const dpr = window.devicePixelRatio || 1;

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = Math.floor(width * dpr);
        cropCanvas.height = Math.floor(height * dpr);
        const cropCtx = cropCanvas.getContext('2d');

        cropCtx.drawImage(
          img,
          Math.floor(x * dpr),
          Math.floor(y * dpr),
          Math.floor(width * dpr),
          Math.floor(height * dpr),
          0,
          0,
          Math.floor(width * dpr),
          Math.floor(height * dpr)
        );

        const croppedDataUrl = cropCanvas.toDataURL('image/png');
        const filename = generateCleanScreenshotFilename();

        const downloadRes = await sendRuntimeMessage({
          action: 'DOWNLOAD_SCREENSHOT',
          dataUrl: croppedDataUrl,
          filename: filename
        });

        if (downloadRes && downloadRes.success) {
          showToast('✅ ¡Captura personalizada guardada en Descargas!', false, 4000);
        } else {
          showToast('⚠️ Error al guardar la captura.', false, 4000);
        }
      } catch (err) {
        console.error('Error en captura personalizada:', err);
        showToast('❌ Error en la captura personalizada', false, 4000);
      } finally {
        isCapturing = false;
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
  }

  // =========================================================================
  // GENERACIÓN DE NOMBRE DE ARCHIVO BASADO EN LA URL LIMPIA + FECHA
  // =========================================================================
  function generateCleanScreenshotFilename() {
    try {
      const url = window.location.href;

      // 1. Quitar protocolo (http://, https://)
      let clean = url.replace(/^https?:\/\//i, '');

      // 2. Quitar prefijo www. (o www1., www2., etc.)
      clean = clean.replace(/^www\d*\./i, '');

      // 3. Quitar parámetros de consulta (?...) y fragmentos (#...)
      clean = clean.split('?')[0].split('#')[0];

      // 4. Separar dominio y ruta
      const parts = clean.split('/');
      let domain = parts[0] || 'captura';
      const pathSegments = parts.slice(1).filter(Boolean);

      // 5. Quitar TLDs y extensiones de dominio (.com, .es, .org, .net, .io, .dev, etc.)
      domain = domain.replace(/\.(com|es|org|net|io|co|uk|dev|ai|app|info|biz|me|eu|tv|tech|store|site|online|xyz|cat|eus|gal|us|fr|de|it|pt|br|mx|ar|cl|co\.[a-z]{2}|com\.[a-z]{2}|org\.[a-z]{2}|edu\.[a-z]{2}|gov\.[a-z]{2}|gob\.[a-z]{2})$/i, '');
      domain = domain.replace(/\.[a-z]{2,8}$/i, '');

      // 6. Procesar rutas si existen
      let pathPart = pathSegments
        .map((seg) => seg.replace(/\.(html|htm|php|asp|aspx|jsp)$/i, ''))
        .filter(Boolean)
        .join('_');

      if (pathPart.length > 25) {
        pathPart = pathPart.substring(0, 25);
      }

      let baseName = domain;
      if (pathPart && pathPart.length > 0) {
        baseName = `${domain}_${pathPart}`;
      }

      // Limpiar caracteres inválidos para nombres de archivo en Windows y macOS
      baseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      if (!baseName) baseName = 'captura';

      // 7. Añadir la fecha y hora
      const timestamp = getFormattedTimestamp();

      return `${baseName}_${timestamp}.png`;
    } catch (e) {
      return `captura_${getFormattedTimestamp()}.png`;
    }
  }

  // =========================================================================
  // FUNCIONES DE CONTROL DE SCROLL, LAYOUT Y ELEMENTOS FIJOS
  // =========================================================================
  function analyzePageLayout() {
    const doc = document;
    const html = doc.documentElement;
    const body = doc.body;
    const scrollingEl = doc.scrollingElement || html;

    let fullHeight = Math.max(
      html.scrollHeight,
      body ? body.scrollHeight : 0,
      html.offsetHeight,
      body ? body.offsetHeight : 0,
      scrollingEl ? scrollingEl.scrollHeight : 0,
      window.innerHeight
    );

    let mainContainer = null;
    let containerMax = 0;
    const candidates = document.querySelectorAll('main, [role="main"], #root, #app, #__next, .application-outlet, .main-container, body > div');
    
    for (const el of candidates) {
      if (el.scrollHeight > window.innerHeight + 50) {
        if (el.scrollHeight > containerMax) {
          containerMax = el.scrollHeight;
          mainContainer = el;
        }
      }
    }

    if (mainContainer && containerMax > fullHeight) {
      fullHeight = containerMax;
    }

    return {
      fullHeight: Math.max(fullHeight, window.innerHeight),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
      mainContainer: mainContainer
    };
  }

  function getScrollPosition(mainContainer) {
    if (mainContainer && mainContainer.scrollTop > 0) {
      return mainContainer.scrollTop;
    }
    const scrollingEl = document.scrollingElement || document.documentElement || document.body;
    return window.scrollY ||
      window.pageYOffset ||
      (document.documentElement ? document.documentElement.scrollTop : 0) ||
      (document.body ? document.body.scrollTop : 0) ||
      (scrollingEl ? scrollingEl.scrollTop : 0);
  }

  function performScroll(y, mainContainer) {
    window.scrollTo({ left: 0, top: y, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = y;
    if (document.body) document.body.scrollTop = y;
    if (document.scrollingElement) document.scrollingElement.scrollTop = y;
    if (mainContainer) mainContainer.scrollTop = y;
  }

  function getFixedElements() {
    const fixed = [];
    const all = document.querySelectorAll('*');
    for (const el of all) {
      if (el.id && el.id.startsWith('screenshot-ext')) continue;
      
      const pos = window.getComputedStyle(el).position;
      if (pos === 'fixed' || pos === 'sticky') {
        fixed.push({
          element: el,
          originalVisibility: el.style.visibility
        });
      }
    }
    return fixed;
  }

  function toggleFixedElements(fixedList, show) {
    for (const item of fixedList) {
      if (show) {
        item.element.style.visibility = item.originalVisibility;
      } else {
        item.element.style.visibility = 'hidden';
      }
    }
  }

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  let toastElement = null;
  let toastTimer = null;

  function showToast(message, withSpinner = false, duration = 0) {
    hideToast();

    toastElement = document.createElement('div');
    toastElement.id = 'screenshot-ext-toast';

    if (withSpinner) {
      toastElement.innerHTML = `
        <div class="screenshot-ext-spinner"></div>
        <span>${message}</span>
      `;
    } else {
      toastElement.innerHTML = `
        <span class="screenshot-ext-toast-icon">📸</span>
        <span>${message}</span>
      `;
    }

    document.body.appendChild(toastElement);

    if (duration > 0) {
      toastTimer = setTimeout(() => {
        hideToast();
      }, duration);
    }
  }

  function hideToast() {
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }
    if (toastElement && toastElement.parentNode) {
      toastElement.parentNode.removeChild(toastElement);
      toastElement = null;
    }
  }

  // =========================================================================
  // UTILIDADES
  // =========================================================================
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function sendRuntimeMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response);
      });
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  }

  function getFormattedTimestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const mins = pad(d.getMinutes());
    const secs = pad(d.getSeconds());
    return `${year}-${month}-${day}_${hours}-${mins}-${secs}`;
  }
})();
