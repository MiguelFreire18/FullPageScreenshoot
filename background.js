// Background Service Worker - Manifest V3

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  
  const isRestrictedUrl = tab.url && (
    tab.url.startsWith('chrome://') ||
    tab.url.startsWith('brave://') ||
    tab.url.startsWith('edge://') ||
    tab.url.startsWith('about:') ||
    tab.url.startsWith('chrome-extension://')
  );

  if (isRestrictedUrl) {
    console.warn('No se pueden ejecutar capturas en páginas internas del navegador.');
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_BANNER' });
  } catch (error) {
    try {
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content.css']
      });
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_BANNER' });
        } catch (e) {
          console.error('Error al abrir banner:', e);
        }
      }, 120);
    } catch (injectError) {
      console.error('Error al inyectar scripts:', injectError);
    }
  }
});

// Escuchar solicitudes de captura y descarga
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'CAPTURE_VISIBLE_TAB') {
    const windowId = sender.tab ? sender.tab.windowId : null;
    
    captureTabWithRetry(windowId, 3, 300)
      .then((result) => {
        sendResponse(result);
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message || 'Error en captura' });
      });

    return true;
  }

  if (request.action === 'DOWNLOAD_SCREENSHOT') {
    const { dataUrl, filename } = request;
    if (!dataUrl) {
      sendResponse({ success: false, error: 'DataURL no válido' });
      return false;
    }

    const finalFilename = filename || `captura-${formatTimestamp(new Date())}.png`;

    chrome.downloads.download(
      {
        url: dataUrl,
        filename: finalFilename,
        saveAs: false
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error('Error al descargar:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true, downloadId: downloadId, filename: finalFilename });
        }
      }
    );
    return true;
  }
});

function captureTabWithRetry(windowId, maxRetries = 3, delayMs = 300) {
  return new Promise((resolve) => {
    function attempt(remaining) {
      chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError || !dataUrl) {
          const errMsg = chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Sin datos';
          if (remaining > 0) {
            setTimeout(() => attempt(remaining - 1), delayMs);
          } else {
            resolve({ success: false, error: errMsg });
          }
        } else {
          resolve({ success: true, dataUrl: dataUrl });
        }
      });
    }
    attempt(maxRetries);
  });
}

function formatTimestamp(d) {
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const mins = pad(d.getMinutes());
  const secs = pad(d.getSeconds());
  return `${year}-${month}-${day}_${hours}-${mins}-${secs}`;
}
