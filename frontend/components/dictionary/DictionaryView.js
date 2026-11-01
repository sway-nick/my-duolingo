import { speakWord } from '../../services/audioService.js?v=386.0';
import { toggleFavoriteApi, getUserFavorites, getUserProgress, isWordMastered, addCustomWord, suggestTranslations, batchAddCustomWords, scanDocumentImage, getUserSettings, saveUserSettings } from '../../services/api.js?v=386.0';
import { t, getInterfaceLanguage, getWordTranslation, getWordNotes } from '../../services/i18n.js?v=386.0';
import { AdService } from '../../services/adService.js?v=386.0';

function compressImageFile(file, maxDimension = 2048, quality = 0.88) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error(t('scan_err_read_file')));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUri = e.target?.result;
      if (!dataUri || typeof dataUri !== 'string') {
        reject(new Error(t('scan_err_read_file')));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      const proceed = () => {
        const natW = img.naturalWidth || img.width;
        const natH = img.naturalHeight || img.height;
        if (!natW || !natH) {
          reject(new Error(t('scan_err_read_image')));
          return;
        }

        let width = natW;
        let height = natH;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        width = Math.max(1, width);
        height = Math.max(1, height);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error(t('scan_err_read_image')));
          return;
        }

        // Draw image pixels first to guarantee image content is never overwritten
        ctx.drawImage(img, 0, 0, width, height);

        // Fill background with white ONLY under transparent regions (e.g. transparent PNG)
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const parts = dataUrl.split(',');
        resolve({
          dataUrl,
          base64: parts.length > 1 ? parts[1] : '',
          mimeType: 'image/jpeg',
        });
      };

      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode().then(proceed).catch(proceed);
        } else {
          proceed();
        }
      };

      img.onerror = () => {
        reject(new Error(t('scan_err_read_image')));
      };

      img.src = dataUri;
    };

    reader.onerror = () => {
      reject(new Error(t('scan_err_read_file')));
    };

    reader.readAsDataURL(file);
  });
}

function cropAndCompressImage(sourceImg, cropNorm, rotationDeg = 0, enhanceContrast = false, maxDimension = 2048, quality = 0.88) {
  return new Promise((resolve, reject) => {
    try {
      const natW = sourceImg.naturalWidth || sourceImg.width;
      const natH = sourceImg.naturalHeight || sourceImg.height;
      if (!natW || !natH) {
        reject(new Error(t('scan_err_read_image')));
        return;
      }

      const rot = ((rotationDeg % 360) + 360) % 360;
      const rotCanvas = document.createElement('canvas');
      if (rot === 90 || rot === 270) {
        rotCanvas.width = natH;
        rotCanvas.height = natW;
      } else {
        rotCanvas.width = natW;
        rotCanvas.height = natH;
      }
      const rCtx = rotCanvas.getContext('2d');
      rCtx.save();
      rCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
      rCtx.rotate((rot * Math.PI) / 180);
      rCtx.drawImage(sourceImg, -natW / 2, -natH / 2, natW, natH);
      rCtx.restore();
      rCtx.globalCompositeOperation = 'destination-over';
      rCtx.fillStyle = '#ffffff';
      rCtx.fillRect(0, 0, rotCanvas.width, rotCanvas.height);
      rCtx.globalCompositeOperation = 'source-over';

      const sx = Math.max(0, Math.round((cropNorm?.x || 0) * rotCanvas.width));
      const sy = Math.max(0, Math.round((cropNorm?.y || 0) * rotCanvas.height));
      const sw = Math.max(32, Math.min(rotCanvas.width - sx, Math.round((cropNorm?.w || 1) * rotCanvas.width)));
      const sh = Math.max(32, Math.min(rotCanvas.height - sy, Math.round((cropNorm?.h || 1) * rotCanvas.height)));

      let targetW = sw;
      let targetH = sh;
      if (targetW > maxDimension || targetH > maxDimension) {
        if (targetW > targetH) {
          targetH = Math.round((targetH * maxDimension) / targetW);
          targetW = maxDimension;
        } else {
          targetW = Math.round((targetW * maxDimension) / targetH);
          targetH = maxDimension;
        }
      }

      const outCanvas = document.createElement('canvas');
      outCanvas.width = targetW;
      outCanvas.height = targetH;
      const oCtx = outCanvas.getContext('2d');
      if (enhanceContrast) {
        oCtx.filter = 'contrast(1.38) brightness(1.06) saturate(0.15)';
      }
      oCtx.drawImage(rotCanvas, sx, sy, sw, sh, 0, 0, targetW, targetH);
      oCtx.filter = 'none';
      oCtx.globalCompositeOperation = 'destination-over';
      oCtx.fillStyle = '#ffffff';
      oCtx.fillRect(0, 0, targetW, targetH);
      oCtx.globalCompositeOperation = 'source-over';

      const dataUrl = outCanvas.toDataURL('image/jpeg', quality);
      resolve({
        dataUrl,
        base64: dataUrl.split(',')[1],
        mimeType: 'image/jpeg',
      });
    } catch (err) {
      reject(err);
    }
  });
}

function openDocScannerModal(words = [], onWordsSaved = () => {}) {
  if (window.trackScreen) {
    window.trackScreen('scanner_modal', 'ScannerModal');
  }
  if (window.trackEvent) {
    window.trackEvent('scanner_open');
  }

  const modalEl = document.createElement('div');
  modalEl.id = 'doc-scanner-modal-overlay';
  modalEl.className = 'scanner-modal-overlay';

  const cameraSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`;
  const gallerySvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
  const pasteSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>`;

  const cleanBtnText = (str) => String(str || '').replace(/^[^\p{L}\p{N}()«»"'¡¿]+/u, '').trim();
  const photoText = cleanBtnText(t('scan_take_photo')) || 'Фото';
  const galleryText = cleanBtnText(t('scan_choose_gallery')) || 'Галерея';
  const pasteText = cleanBtnText(t('scan_paste_btn')) || 'Вставить текст';

  modalEl.innerHTML = `
    <div class="scanner-modal-card" id="scanner-modal-card">
      <div class="scanner-modal-header">
        <div class="scanner-header-left" id="scanner-header-left">
          <div class="scanner-spinner" id="scanner-header-spinner" style="visibility: hidden;"></div>
        </div>
        <h3 class="scanner-modal-title" id="scanner-modal-title">${t('scan_modal_title')}</h3>
        <button type="button" id="scanner-close-btn" class="scanner-close-btn" title="${t('modal_close') || 'Закрыть'}" aria-label="${t('modal_close') || 'Закрыть'}">✕</button>
      </div>

      <div class="scanner-modal-body" id="scanner-modal-body">
        <input type="file" id="scanner-camera-input" accept="image/*" capture="environment" style="display: none;" />
        <input type="file" id="scanner-gallery-input" accept="image/*" style="display: none;" />

        <div id="scanner-error" class="scanner-error" style="display: none; margin-bottom: 12px;"></div>

        <!-- 1. Upload View (Compact 440px Dialog) -->
        <div id="scanner-upload-view" class="scanner-upload-view">
          <div class="scanner-actions-stack" id="scanner-dropzone">
            <button type="button" id="scanner-take-photo-btn" class="primary-button scanner-action-btn">
              <span class="scanner-btn-icon">${cameraSvg}</span>
              <span class="scanner-btn-text">${photoText}</span>
            </button>
            <button type="button" id="scanner-gallery-btn" class="primary-button scanner-action-btn">
              <span class="scanner-btn-icon">${gallerySvg}</span>
              <span class="scanner-btn-text">${galleryText}</span>
            </button>
            <button type="button" id="scanner-open-paste-btn" class="primary-button scanner-action-btn">
              <span class="scanner-btn-icon">${pasteSvg}</span>
              <span class="scanner-btn-text">${pasteText}</span>
            </button>
          </div>
        </div>

        <!-- 1b. Paste Text View -->
        <div id="scanner-paste-view" class="scanner-paste-view" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <button type="button" id="scanner-paste-back-btn" class="scanner-link-btn" style="font-size: 12.5px;">
              ${cleanBtnText(t('scan_back_to_upload'))}
            </button>
            <button type="button" id="scanner-clipboard-auto-btn" class="scanner-link-btn" style="font-size: 12.5px;">
              ${cleanBtnText(t('scan_paste_clipboard_btn'))}
            </button>
          </div>
          <textarea id="scanner-text-input" class="search-input" rows="6" placeholder="${t('scan_paste_placeholder')}" style="width: 100%; height: auto; min-height: 130px; max-height: 220px; padding: 12px; font-size: 14px; font-family: inherit; resize: vertical; box-sizing: border-box; line-height: 1.45; border-radius: var(--radius-md);"></textarea>
          <div class="scanner-crop-actions" style="margin-top: 12px;">
            <button type="button" id="scanner-paste-translate-btn" class="primary-button btn-orange scanner-crop-half-btn">
              ${t('scan_crop_translate_btn')}
            </button>
            <button type="button" id="scanner-paste-submit-btn" class="primary-button btn-blue scanner-crop-half-btn">
              ${t('scan_crop_dict_btn')}
            </button>
          </div>
        </div>

        <!-- 1c. Interactive Book Page Crop View (Full-Page) -->
        <div id="scanner-crop-view" class="scanner-crop-view" style="display: none;">
          <div class="scanner-crop-stage" id="scanner-crop-stage">
            <div class="scanner-crop-img-wrap" id="scanner-crop-img-wrap">
              <img id="scanner-crop-img" class="scanner-crop-img" alt="Crop Preview" />
              <div class="scanner-crop-box" id="scanner-crop-box">
                <div class="scanner-crop-grid"></div>
                <div class="crop-handle nw" data-handle="nw"></div>
                <div class="crop-handle ne" data-handle="ne"></div>
                <div class="crop-handle se" data-handle="se"></div>
                <div class="crop-handle sw" data-handle="sw"></div>
              </div>
            </div>
          </div>

          <div class="scanner-crop-actions">
            <button type="button" id="scanner-crop-translate-btn" class="primary-button btn-orange scanner-crop-half-btn">
              ${t('scan_crop_translate_btn')}
            </button>
            <button type="button" id="scanner-crop-dict-btn" class="primary-button btn-blue scanner-crop-half-btn">
              ${t('scan_crop_dict_btn')}
            </button>
          </div>
        </div>

        <!-- 1d. Full-Text Translation View (Full-Page) -->
        <div id="scanner-translate-view" class="scanner-translate-view" style="display: none;">
          <div class="scanner-translate-scroll">
            <div class="scanner-translate-card scanner-translate-card--full">
              <div class="scanner-translate-label">${t('scan_translation_title')}</div>
              <div id="scanner-translated-text" class="scanner-translated-body" dir="auto"></div>
            </div>
          </div>
          <div class="scanner-crop-actions">
            <button type="button" id="scanner-translate-back-btn" class="primary-button btn-blue scanner-crop-half-btn">
              ${t('scan_back_to_crop_btn')}
            </button>
            <button type="button" id="scanner-translate-to-dict-btn" class="primary-button btn-blue scanner-crop-half-btn">
              ${t('scan_crop_dict_btn')}
            </button>
          </div>
        </div>

        <!-- 2. Processing View (Full-Page Preview for Photos) -->
        <div id="scanner-processing-view" class="scanner-processing-view" style="display: none;">
          <div class="scanner-preview-container" id="scanner-preview-container">
            <img id="scanner-preview-img" class="scanner-preview-img" alt="Scanned Document" style="display: none;" />
            <div id="scanner-text-icon-preview" style="display: none; padding: 24px; font-size: 42px; text-align: center;">📄</div>
            <div class="scanner-laser-line"></div>
          </div>
        </div>

        <!-- 3. Results View (Vocabulary Mode) -->
        <div id="scanner-results-view" class="scanner-results-view" style="display: none;">
          <div id="scanner-words-panel" class="scanner-words-panel">
            <div class="scanner-lemmas-header">
              <button type="button" id="scanner-group-cat-btn" class="scanner-group-cat-btn" title="${t('scan_group_cat_title')}">
                <span style="opacity: 0.75;">${cleanBtnText(t('scan_group_cat_all'))}</span>
                <strong id="scanner-group-cat-label" class="scanner-group-cat-label">Elementary ⇄</strong>
              </button>
              <div class="scanner-select-actions">
                <button type="button" id="scanner-toggle-select-btn" class="scanner-link-btn">
                  ${t('scan_deselect_all')}
                </button>
              </div>
            </div>

            <div id="scanner-lemmas-list" class="scanner-lemmas-list"></div>

            <!-- Existing Words Collapsible -->
            <div id="scanner-existing-box" class="scanner-existing-box" style="display: none;">
              <div class="scanner-existing-header" id="scanner-existing-toggle">
                <span id="scanner-existing-title">${cleanBtnText(t('scan_already_exists'))} (0)</span>
                <span class="scanner-existing-arrow" id="scanner-existing-arrow">▼</span>
              </div>
              <div id="scanner-existing-list" class="scanner-existing-list" style="display: none;"></div>
            </div>
          </div>

          <div class="scanner-results-footer">
            <button type="button" id="scanner-rescan-btn" class="primary-button scanner-btn-rescan">
              ${cleanBtnText(t('scan_rescan_btn'))}
            </button>
            <button type="button" id="scanner-submit-btn" class="primary-button btn-green scanner-btn-save">
              ${cleanBtnText(t('scan_add_btn'))}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  const modalCard = modalEl.querySelector('#scanner-modal-card');
  const closeBtn = modalEl.querySelector('#scanner-close-btn');
  const headerSpinner = modalEl.querySelector('#scanner-header-spinner');
  const uploadView = modalEl.querySelector('#scanner-upload-view');
  const pasteView = modalEl.querySelector('#scanner-paste-view');
  const cropView = modalEl.querySelector('#scanner-crop-view');
  const processingView = modalEl.querySelector('#scanner-processing-view');
  const resultsView = modalEl.querySelector('#scanner-results-view');
  const previewImg = modalEl.querySelector('#scanner-preview-img');
  const textIconPreview = modalEl.querySelector('#scanner-text-icon-preview');
  const errorBox = modalEl.querySelector('#scanner-error');
  const dropzone = modalEl.querySelector('#scanner-dropzone');

  const cameraInput = modalEl.querySelector('#scanner-camera-input');
  const galleryInput = modalEl.querySelector('#scanner-gallery-input');
  const takePhotoBtn = modalEl.querySelector('#scanner-take-photo-btn');
  const galleryBtn = modalEl.querySelector('#scanner-gallery-btn');
  const openPasteBtn = modalEl.querySelector('#scanner-open-paste-btn');

  const textInput = modalEl.querySelector('#scanner-text-input');
  const clipboardAutoBtn = modalEl.querySelector('#scanner-clipboard-auto-btn');
  const pasteBackBtn = modalEl.querySelector('#scanner-paste-back-btn');
  const pasteTranslateBtn = modalEl.querySelector('#scanner-paste-translate-btn');
  const pasteSubmitBtn = modalEl.querySelector('#scanner-paste-submit-btn');

  // Crop & Translation View elements
  const cropImg = modalEl.querySelector('#scanner-crop-img');
  const cropBox = modalEl.querySelector('#scanner-crop-box');
  const cropTranslateBtn = modalEl.querySelector('#scanner-crop-translate-btn');
  const cropDictBtn = modalEl.querySelector('#scanner-crop-dict-btn');
  const translateView = modalEl.querySelector('#scanner-translate-view');
  const translatedTextEl = modalEl.querySelector('#scanner-translated-text');
  const originalTextEl = modalEl.querySelector('#scanner-original-text');
  const translateBackBtn = modalEl.querySelector('#scanner-translate-back-btn');
  const translateToDictBtn = modalEl.querySelector('#scanner-translate-to-dict-btn');

  // Reader & Tabs elements
  const tabsRow = modalEl.querySelector('#scanner-tabs-row');
  const tabWordsBtn = modalEl.querySelector('#scanner-tab-words-btn');
  const tabWordsCount = modalEl.querySelector('#scanner-tab-words-count');
  const tabReaderBtn = modalEl.querySelector('#scanner-tab-reader-btn');
  const readerPanel = modalEl.querySelector('#scanner-reader-panel');
  const wordsPanel = modalEl.querySelector('#scanner-words-panel');
  const readerBody = modalEl.querySelector('#scanner-reader-body');
  const wordPopover = modalEl.querySelector('#scanner-word-popover');
  const readerPhotoToggle = modalEl.querySelector('#scanner-reader-photo-toggle');
  const readerPhotoBox = modalEl.querySelector('#scanner-reader-photo-box');
  const readerPhotoImg = modalEl.querySelector('#scanner-reader-photo-img');

  const groupCatBtn = modalEl.querySelector('#scanner-group-cat-btn');
  const groupCatLabel = modalEl.querySelector('#scanner-group-cat-label');
  const lemmasList = modalEl.querySelector('#scanner-lemmas-list');
  const toggleSelectBtn = modalEl.querySelector('#scanner-toggle-select-btn');

  const existingBox = modalEl.querySelector('#scanner-existing-box');
  const existingToggle = modalEl.querySelector('#scanner-existing-toggle');
  const existingTitle = modalEl.querySelector('#scanner-existing-title');
  const existingArrow = modalEl.querySelector('#scanner-existing-arrow');
  const existingList = modalEl.querySelector('#scanner-existing-list');

  const rescanBtn = modalEl.querySelector('#scanner-rescan-btn');
  const submitBtn = modalEl.querySelector('#scanner-submit-btn');

  let currentNewLemmas = [];
  let selectedIndices = new Set();
  let currentGroupCategory = 'Elementary';
  let currentScannedText = '';
  let currentScannedPhotoDataUrl = '';

  let activePreviewUrl = null;
  let rawImageElement = null;
  let cropRotationDeg = 0;
  let cropEnhanceContrast = false;
  let cropState = { x: 0, y: 0, w: 1, h: 1 };

  const setFullpageMode = (enabled) => {
    modalEl.classList.toggle('scanner-fullpage', Boolean(enabled));
    if (modalCard) {
      modalCard.classList.toggle('scanner-fullpage', Boolean(enabled));
    }
  };

  const closeModal = () => {
    if (activePreviewUrl) {
      try { URL.revokeObjectURL(activePreviewUrl); } catch (e) {}
      activePreviewUrl = null;
    }
    modalEl.remove();
  };

  closeBtn.addEventListener('click', closeModal);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
  });

  const showError = (msg) => {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.style.display = 'block';
    }
  };

  const hideError = () => {
    if (errorBox) errorBox.style.display = 'none';
  };

  // --- Interactive Crop Box Logic ---
  function updateCropBoxStyles() {
    if (!cropBox) return;
    cropBox.style.left = `${(cropState.x * 100).toFixed(2)}%`;
    cropBox.style.top = `${(cropState.y * 100).toFixed(2)}%`;
    cropBox.style.width = `${(cropState.w * 100).toFixed(2)}%`;
    cropBox.style.height = `${(cropState.h * 100).toFixed(2)}%`;
  }

  let dragMode = null;
  let dragStart = { clientX: 0, clientY: 0, x: 0, y: 0, w: 0, h: 0 };

  function onPointerDownCrop(e) {
    if (!cropImg || !cropBox) return;
    const handleEl = e.target.closest('.crop-handle');
    const isBox = e.target === cropBox || handleEl;
    if (!isBox) return;
    e.preventDefault();
    e.stopPropagation();

    dragMode = handleEl ? handleEl.getAttribute('data-handle') : 'move';
    const pt = e.touches ? e.touches[0] : e;
    dragStart = {
      clientX: pt.clientX,
      clientY: pt.clientY,
      x: cropState.x,
      y: cropState.y,
      w: cropState.w,
      h: cropState.h,
    };

    window.addEventListener('mousemove', onPointerMoveCrop, { passive: false });
    window.addEventListener('touchmove', onPointerMoveCrop, { passive: false });
    window.addEventListener('mouseup', onPointerUpCrop);
    window.addEventListener('touchend', onPointerUpCrop);
  }

  function onPointerMoveCrop(e) {
    if (!dragMode || !cropImg) return;
    e.preventDefault();
    const rect = cropImg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const pt = e.touches ? e.touches[0] : e;
    const dx = (pt.clientX - dragStart.clientX) / rect.width;
    const dy = (pt.clientY - dragStart.clientY) / rect.height;
    const minSize = 0.12;

    if (dragMode === 'move') {
      cropState.x = Math.max(0, Math.min(1 - dragStart.w, dragStart.x + dx));
      cropState.y = Math.max(0, Math.min(1 - dragStart.h, dragStart.y + dy));
    } else {
      let nx = dragStart.x;
      let ny = dragStart.y;
      let nw = dragStart.w;
      let nh = dragStart.h;

      if (dragMode.includes('w')) {
        const maxLeft = dragStart.x + dragStart.w - minSize;
        nx = Math.max(0, Math.min(maxLeft, dragStart.x + dx));
        nw = dragStart.w + (dragStart.x - nx);
      }
      if (dragMode.includes('e')) {
        nw = Math.max(minSize, Math.min(1 - dragStart.x, dragStart.w + dx));
      }
      if (dragMode.includes('n')) {
        const maxTop = dragStart.y + dragStart.h - minSize;
        ny = Math.max(0, Math.min(maxTop, dragStart.y + dy));
        nh = dragStart.h + (dragStart.y - ny);
      }
      if (dragMode.includes('s')) {
        nh = Math.max(minSize, Math.min(1 - dragStart.y, dragStart.h + dy));
      }

      cropState = { x: nx, y: ny, w: nw, h: nh };
    }
    updateCropBoxStyles();
  }

  function onPointerUpCrop() {
    dragMode = null;
    window.removeEventListener('mousemove', onPointerMoveCrop);
    window.removeEventListener('touchmove', onPointerMoveCrop);
    window.removeEventListener('mouseup', onPointerUpCrop);
    window.removeEventListener('touchend', onPointerUpCrop);
  }

  let lastScanData = null;

  if (cropBox) {
    cropBox.addEventListener('mousedown', onPointerDownCrop);
    cropBox.addEventListener('touchstart', onPointerDownCrop, { passive: false });
  }

  if (cropTranslateBtn) {
    cropTranslateBtn.addEventListener('click', async () => {
      hideError();
      cropTranslateBtn.disabled = true;
      if (cropDictBtn) cropDictBtn.disabled = true;
      try {
        const adRes = await AdService.showScannerTranslationRewardedAd();
        if (!adRes || (!adRes.rewardEarned && !adRes.success)) {
          return;
        }
        await runImageScanWithCrop(cropState, 'translate');
      } finally {
        cropTranslateBtn.disabled = false;
        if (cropDictBtn) cropDictBtn.disabled = false;
      }
    });
  }

  if (cropDictBtn) {
    cropDictBtn.addEventListener('click', () => {
      runImageScanWithCrop(cropState, 'dict');
    });
  }

  if (translateBackBtn) {
    translateBackBtn.addEventListener('click', () => {
      if (translateView) translateView.style.display = 'none';
      if (resultsView) resultsView.style.display = 'none';
      if (rawImageElement) {
        setFullpageMode(true);
        cropView.style.display = 'flex';
      } else if (currentScannedText || (textInput && textInput.value.trim())) {
        setFullpageMode(false);
        pasteView.style.display = 'block';
      } else {
        setFullpageMode(false);
        uploadView.style.display = 'block';
      }
      hideError();
    });
  }

  if (translateToDictBtn) {
    translateToDictBtn.addEventListener('click', () => {
      if (translateView) translateView.style.display = 'none';
      if (lastScanData) {
        displayResults(lastScanData);
      }
    });
  }

  // --- Tabs Switching (Vocabulary vs Book Reader) ---
  function switchScannerTab(tabName) {
    const isReader = tabName === 'reader';
    if (tabWordsBtn) tabWordsBtn.classList.toggle('active', !isReader);
    if (tabReaderBtn) tabReaderBtn.classList.toggle('active', isReader);
    if (wordsPanel) wordsPanel.style.display = isReader ? 'none' : 'flex';
    if (readerPanel) readerPanel.style.display = isReader ? 'flex' : 'none';
  }

  if (tabWordsBtn) {
    tabWordsBtn.addEventListener('click', () => switchScannerTab('words'));
  }
  if (tabReaderBtn) {
    tabReaderBtn.addEventListener('click', () => switchScannerTab('reader'));
  }

  if (readerPhotoToggle && readerPhotoBox) {
    readerPhotoToggle.addEventListener('click', () => {
      const isHidden = readerPhotoBox.style.display === 'none';
      readerPhotoBox.style.display = isHidden ? 'flex' : 'none';
      readerPhotoToggle.textContent = isHidden ? t('scan_hide_original') : t('scan_show_original');
    });
  }

  takePhotoBtn.addEventListener('click', () => {
    hideError();
    if (window.trackEvent) window.trackEvent('scan_source_photo');
    cameraInput.value = '';
    cameraInput.click();
  });

  galleryBtn.addEventListener('click', () => {
    hideError();
    if (window.trackEvent) window.trackEvent('scan_source_gallery');
    galleryInput.value = '';
    galleryInput.click();
  });

  openPasteBtn.addEventListener('click', async () => {
    hideError();
    if (window.trackEvent) window.trackEvent('scan_source_paste');
    rawImageElement = null;
    setFullpageMode(false);
    uploadView.style.display = 'none';
    pasteView.style.display = 'block';

    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText.trim().length > 0 && !textInput.value) {
          textInput.value = clipText.trim();
        }
      }
    } catch (e) {}

    setTimeout(() => {
      textInput.focus();
    }, 100);
  });

  clipboardAutoBtn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          textInput.value = clipText.trim();
          textInput.focus();
        }
      } else {
        showError(t('scan_err_clipboard_denied'));
      }
    } catch (e) {
      showError(t('scan_err_clipboard_read'));
    }
  });

  if (pasteBackBtn) {
    pasteBackBtn.addEventListener('click', () => {
      hideError();
      pasteView.style.display = 'none';
      uploadView.style.display = 'block';
      setFullpageMode(false);
    });
  }

  async function runPasteScan(rawText, mode = 'dict') {
    try {
      hideError();
      if (window.trackEvent) {
        window.trackEvent('scan_paste_submit', { length: rawText.length, mode });
      }
      rawImageElement = null;
      currentScannedPhotoDataUrl = '';
      currentScannedText = rawText;
      pasteView.style.display = 'none';
      if (translateView) translateView.style.display = 'none';
      processingView.style.display = 'flex';
      resultsView.style.display = 'none';
      previewImg.style.display = 'none';
      textIconPreview.style.display = 'block';
      if (headerSpinner) headerSpinner.style.visibility = 'visible';

      const res = await scanDocumentImage({ text: rawText });
      if (!res.detected_text) res.detected_text = rawText;
      lastScanData = res;

      if (mode === 'translate') {
        const translatedPassage = await translateFullTextToLocale(rawText);
        if (headerSpinner) headerSpinner.style.visibility = 'hidden';
        processingView.style.display = 'none';
        setFullpageMode(true);
        if (translateView) {
          if (translatedTextEl) {
            translatedTextEl.textContent = translatedPassage || rawText || t('scan_no_new_words');
          }
          if (originalTextEl) {
            originalTextEl.textContent = rawText || '';
          }
          translateView.style.display = 'flex';
        } else {
          displayResults(res);
        }
        return;
      }

      displayResults(res);
    } catch (err) {
      console.error('Text scan error:', err);
      if (headerSpinner) headerSpinner.style.visibility = 'hidden';
      setFullpageMode(false);
      pasteView.style.display = 'block';
      if (translateView) translateView.style.display = 'none';
      processingView.style.display = 'none';
      resultsView.style.display = 'none';
      showError(err.message || t('scan_err_lemmas'));
    }
  }

  if (pasteTranslateBtn) {
    pasteTranslateBtn.addEventListener('click', async () => {
      const rawText = textInput.value.trim();
      if (!rawText || rawText.length < 2) {
        showError(t('scan_err_empty_text'));
        return;
      }
      hideError();
      pasteTranslateBtn.disabled = true;
      if (pasteSubmitBtn) pasteSubmitBtn.disabled = true;
      try {
        const adRes = await AdService.showScannerTranslationRewardedAd();
        if (!adRes || (!adRes.rewardEarned && !adRes.success)) {
          return;
        }
        await runPasteScan(rawText, 'translate');
      } finally {
        pasteTranslateBtn.disabled = false;
        if (pasteSubmitBtn) pasteSubmitBtn.disabled = false;
      }
    });
  }

  if (pasteSubmitBtn) {
    pasteSubmitBtn.addEventListener('click', async () => {
      const rawText = textInput.value.trim();
      if (!rawText || rawText.length < 2) {
        showError(t('scan_err_empty_text'));
        return;
      }
      await runPasteScan(rawText, 'dict');
    });
  }

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  cameraInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  galleryInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  rescanBtn.addEventListener('click', () => {
    if (activePreviewUrl) {
      try { URL.revokeObjectURL(activePreviewUrl); } catch (e) {}
      activePreviewUrl = null;
    }
    rawImageElement = null;
    currentScannedPhotoDataUrl = '';
    currentScannedText = '';
    previewImg.removeAttribute('src');
    if (cropImg) cropImg.removeAttribute('src');
    setFullpageMode(false);
    uploadView.style.display = 'block';
    pasteView.style.display = 'none';
    cropView.style.display = 'none';
    processingView.style.display = 'none';
    resultsView.style.display = 'none';
    if (headerSpinner) headerSpinner.style.visibility = 'hidden';
    hideError();
  });

  async function handleFileSelected(file) {
    const isImage = file && (
      (file.type && file.type.startsWith('image/')) ||
      (file.name && file.name.match(/\.(jpe?g|png|webp|heic|heif)$/i))
    );
    if (!isImage) {
      showError(t('scan_err_select_image'));
      return;
    }

    try {
      hideError();
      if (headerSpinner) headerSpinner.style.visibility = 'visible';
      if (window.trackEvent) {
        window.trackEvent('scan_image_upload', { size_kb: Math.round((file.size || 0) / 1024) });
      }

      if (activePreviewUrl) {
        try { URL.revokeObjectURL(activePreviewUrl); } catch (e) {}
        activePreviewUrl = null;
      }

      // Pre-compress and convert to dataUrl (100% reliable across all Android WebViews, avoids blob: origin issues)
      const compressed = await compressImageFile(file, 2048, 0.88);

      const img = new Image();
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(t('scan_err_read_image')));
      });
      img.src = compressed.dataUrl;

      rawImageElement = await loadPromise;
      cropRotationDeg = 0;
      cropEnhanceContrast = false;
      // Default to 100% full image capture so no text is ever cut off by default
      cropState = { x: 0, y: 0, w: 1, h: 1 };

      // Switch modal to Full-Page mode for Book Page Crop View
      setFullpageMode(true);
      uploadView.style.display = 'none';
      pasteView.style.display = 'none';
      processingView.style.display = 'none';
      resultsView.style.display = 'none';
      if (translateView) translateView.style.display = 'none';
      cropView.style.display = 'flex';

      cropImg.onload = () => {
        updateCropBoxStyles();
      };
      cropImg.src = compressed.dataUrl;
      if (cropImg.complete) {
        updateCropBoxStyles();
      }
    } catch (err) {
      console.error('Image load error:', err);
      setFullpageMode(false);
      showError(err.message || t('scan_err_read_image'));
    } finally {
      if (headerSpinner) headerSpinner.style.visibility = 'hidden';
    }
  }

  async function translateFullTextToLocale(sourceText) {
    const clean = String(sourceText || '').trim();
    if (!clean) return '';
    let targetLang = 'ru';
    try {
      const stored = getInterfaceLanguage();
      if (stored && typeof stored === 'string') {
        targetLang = stored.toLowerCase().split(/[-_]/)[0] || 'ru';
      }
    } catch (e) {}
    const gtxLang = targetLang === 'zh' ? 'zh-CN' : targetLang;
    try {
      const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(gtxLang)}&dt=t&q=${encodeURIComponent(clean)}`;
      const res = await fetch(gtxUrl).then((r) => r.json());
      if (res && Array.isArray(res[0])) {
        return res[0].map((part) => (part && part[0] ? String(part[0]) : '')).join('').trim();
      }
    } catch (err) {
      console.warn('Full text translation error:', err);
    }
    return '';
  }

  async function runImageScanWithCrop(selectedCropNorm, mode = 'dict') {
    try {
      hideError();
      setFullpageMode(true);
      uploadView.style.display = 'none';
      pasteView.style.display = 'none';
      cropView.style.display = 'none';
      if (translateView) translateView.style.display = 'none';
      processingView.style.display = 'flex';
      resultsView.style.display = 'none';
      previewImg.style.display = 'block';
      textIconPreview.style.display = 'none';
      if (headerSpinner) headerSpinner.style.visibility = 'visible';

      const compressed = await cropAndCompressImage(
        rawImageElement,
        selectedCropNorm,
        cropRotationDeg,
        cropEnhanceContrast,
        2048,
        0.88
      );

      previewImg.src = compressed.dataUrl;
      currentScannedPhotoDataUrl = compressed.dataUrl;

      const res = await scanDocumentImage(compressed.base64, compressed.mimeType);
      lastScanData = res;

      if (mode === 'translate') {
        let extractedText = String(res.detected_text || res.detected_text_snippet || '').trim();
        if (!extractedText && Array.isArray(res.lemmas) && res.lemmas.length > 0) {
          const uniqueContexts = [];
          res.lemmas.forEach((l) => {
            const ctx = String(l.context || l.original || l.word || '').trim();
            if (ctx && !uniqueContexts.includes(ctx)) uniqueContexts.push(ctx);
          });
          extractedText = uniqueContexts.join('\n');
        }
        const translatedPassage = await translateFullTextToLocale(extractedText);
        if (headerSpinner) headerSpinner.style.visibility = 'hidden';
        processingView.style.display = 'none';
        if (translateView) {
          if (translatedTextEl) {
            translatedTextEl.textContent = translatedPassage || extractedText || t('scan_no_new_words');
          }
          if (originalTextEl) {
            originalTextEl.textContent = extractedText || '';
          }
          translateView.style.display = 'flex';
        } else {
          displayResults(res);
        }
        return;
      }

      displayResults(res);
    } catch (err) {
      console.error('Scan error:', err);
      if (headerSpinner) headerSpinner.style.visibility = 'hidden';
      setFullpageMode(false);
      uploadView.style.display = 'block';
      pasteView.style.display = 'none';
      cropView.style.display = 'none';
      if (translateView) translateView.style.display = 'none';
      processingView.style.display = 'none';
      resultsView.style.display = 'none';
      showError(err.message || t('scan_err_ocr'));
    }
  }

  function displayResults(data) {
    setFullpageMode(true);
    processingView.style.display = 'none';
    cropView.style.display = 'none';
    resultsView.style.display = 'flex';
    if (headerSpinner) headerSpinner.style.visibility = 'hidden';

    const allLemmas = Array.isArray(data.lemmas) ? data.lemmas : [];
    currentScannedText = String(data.detected_text || data.detected_text_snippet || currentScannedText || '').trim();

    const existingWordsSet = new Set(
      words.map((w) => String(w.word || '').trim().toLowerCase())
    );

    currentNewLemmas = [];
    const existingLemmas = [];
    const catCounts = {};

    allLemmas.forEach((raw) => {
      const wClean = String(raw.word || '').trim().toLowerCase();
      if (!wClean) return;
      if (existingWordsSet.has(wClean)) {
        existingLemmas.push(raw);
      } else {
        if (!currentNewLemmas.some((x) => x.word.toLowerCase() === wClean)) {
          const rawTrans = String(raw.translation || '').trim();
          let uniqueVariants = [];
          if (rawTrans) {
            uniqueVariants.push(rawTrans.toLowerCase());
          }

          let cat = sanitizeCategory(raw.category);
          catCounts[cat] = (catCounts[cat] || 0) + 1;
          const isSpecialCategory = cat === 'Pattern' || cat === 'Irregular verbs';

          currentNewLemmas.push({
            word: wClean,
            original: String(raw.original || raw.word || '').trim(),
            category: cat,
            level: isSpecialCategory ? '' : String(raw.level || 'A2').trim().toUpperCase(),
            transcription: cat === 'Pattern' ? '' : String(raw.transcription || '').trim(),
            context: String(raw.context || '').trim(),
            translationVariants: uniqueVariants,
            selectedVariants: new Set(uniqueVariants),
            isEditingTrans: false,
            customTranslation: uniqueVariants.join(', '),
          });
        }
      }
    });

    // Set initial group category based on dominant category
    let topCat = 'Elementary';
    let topCount = 0;
    Object.keys(catCounts).forEach((c) => {
      if (catCounts[c] > topCount) {
        topCount = catCounts[c];
        topCat = c;
      }
    });
    currentGroupCategory = topCat;
    if (groupCatLabel) groupCatLabel.textContent = `${currentGroupCategory} ⇄`;

    selectedIndices = new Set(currentNewLemmas.map((_, i) => i));

    if (tabWordsCount) {
      tabWordsCount.textContent = `(${currentNewLemmas.length})`;
    }

    // Setup Reader Mode & Original Photo Comparison
    if (currentScannedPhotoDataUrl && readerPhotoToggle && readerPhotoImg && readerPhotoBox) {
      readerPhotoToggle.style.display = 'inline-block';
      readerPhotoToggle.textContent = t('scan_show_original');
      readerPhotoBox.style.display = 'none';
      readerPhotoImg.src = currentScannedPhotoDataUrl;
    } else if (readerPhotoToggle && readerPhotoBox) {
      readerPhotoToggle.style.display = 'none';
      readerPhotoBox.style.display = 'none';
    }

    renderBookReaderView(existingLemmas);
    if (tabsRow) {
      tabsRow.style.display = currentScannedText.length >= 15 ? 'flex' : 'none';
    }
    switchScannerTab('words');

    renderLemmasList();
    renderExistingSection(existingLemmas);
    updateSubmitButton();
  }

  function renderBookReaderView(existingLemmas = []) {
    if (!readerBody) return;
    if (wordPopover) wordPopover.style.display = 'none';

    const textToRender = currentScannedText || currentNewLemmas.map((l) => l.context || l.original || l.word).join('\n');
    if (!textToRender.trim()) {
      readerBody.innerHTML = `<p class="scanner-reader-paragraph" style="color: var(--text-muted);">${escapeHtml(t('scan_no_new_words'))}</p>`;
      return;
    }

    // Build lookup map from both new lemmas and existing dictionary words
    const lemmaLookup = new Map();
    currentNewLemmas.forEach((item, idx) => {
      lemmaLookup.set(item.word.toLowerCase(), { type: 'new', item, idx });
      if (item.original) {
        lemmaLookup.set(item.original.toLowerCase(), { type: 'new', item, idx });
      }
    });
    existingLemmas.forEach((raw) => {
      const wKey = String(raw.word || '').trim().toLowerCase();
      if (wKey && !lemmaLookup.has(wKey)) {
        lemmaLookup.set(wKey, { type: 'existing', item: raw });
      }
      if (raw.original && !lemmaLookup.has(String(raw.original).toLowerCase())) {
        lemmaLookup.set(String(raw.original).toLowerCase(), { type: 'existing', item: raw });
      }
    });

    const paragraphs = textToRender.split(/\n\s*\n|\r?\n/).map((p) => p.trim()).filter(Boolean);
    readerBody.innerHTML = paragraphs
      .map((para) => {
        const tokensHtml = para.replace(/[a-zA-Z]+(?:'[a-zA-Z]+)?/g, (match) => {
          const lower = match.toLowerCase();
          let entry = lemmaLookup.get(lower);
          if (!entry && lower.length > 3) {
            const stripped = lower.replace(/(?:ing|ed|es|s)$/, '');
            if (stripped.length >= 3) entry = lemmaLookup.get(stripped);
          }
          const cls = entry
            ? entry.type === 'existing'
              ? 'scanner-reader-word in-dict'
              : 'scanner-reader-word is-lemma'
            : 'scanner-reader-word';
          return `<span class="${cls}" data-word="${escapeHtml(lower)}">${escapeHtml(match)}</span>`;
        });
        return `<p class="scanner-reader-paragraph">${tokensHtml}</p>`;
      })
      .join('');

    readerBody.onclick = async (e) => {
      const wordEl = e.target.closest('.scanner-reader-word');
      if (!wordEl || !wordPopover) return;

      readerBody.querySelectorAll('.scanner-reader-word.active-word').forEach((el) => el.classList.remove('active-word'));
      wordEl.classList.add('active-word');

      const clickedLower = (wordEl.getAttribute('data-word') || '').toLowerCase();
      if (!clickedLower) return;

      let entry = lemmaLookup.get(clickedLower);
      if (!entry && clickedLower.length > 3) {
        const stripped = clickedLower.replace(/(?:ing|ed|es|s)$/, '');
        if (stripped.length >= 3) entry = lemmaLookup.get(stripped);
      }

      // Check existing user dictionary as well
      const activeLang = getInterfaceLanguage();
      const dictMatch = words.find((w) => w.word && w.word.trim().toLowerCase() === clickedLower);

      let displayWord = entry?.item?.word || dictMatch?.word || clickedLower;
      let displayIpa = entry?.item?.transcription || dictMatch?.transcription || '';
      let displayTrans = entry?.item?.customTranslation || entry?.item?.translation || (dictMatch ? getWordTranslation(dictMatch, activeLang) : '');
      let displayLevel = entry?.item?.level || '';
      let isAlreadyInDict = Boolean(dictMatch || entry?.type === 'existing');

      wordPopover.style.display = 'flex';
      wordPopover.innerHTML = `
        <div class="scanner-popover-main">
          <div class="scanner-popover-head">
            <span class="scanner-popover-word">${escapeHtml(displayWord)}</span>
            ${displayIpa ? `<span class="scanner-popover-ipa">${escapeHtml(displayIpa)}</span>` : ''}
            ${displayLevel ? `<span class="scanner-lemma-level">${escapeHtml(displayLevel)}</span>` : ''}
          </div>
          <div class="scanner-popover-trans" id="scanner-popover-trans-text">
            ${displayTrans ? escapeHtml(displayTrans) : `⏳ ${escapeHtml(t('dict_searching_trans'))}`}
          </div>
        </div>
        <div class="scanner-popover-actions">
          <button type="button" class="scanner-popover-speak-btn" id="scanner-popover-speak-btn" title="${t('sound_on')}">🔊</button>
          <button type="button" class="scanner-popover-add-btn" id="scanner-popover-add-btn" ${isAlreadyInDict ? 'disabled' : ''}>
            ${isAlreadyInDict ? escapeHtml(t('scan_word_in_dict')) : escapeHtml(t('scan_word_add_btn'))}
          </button>
        </div>
      `;

      const speakBtnEl = wordPopover.querySelector('#scanner-popover-speak-btn');
      if (speakBtnEl) {
        speakBtnEl.addEventListener('click', () => speakWord(displayWord));
      }

      // If translation wasn't pre-extracted, fetch on-demand in user's locale
      if (!displayTrans) {
        try {
          const sug = await suggestTranslations(displayWord);
          if (sug && Array.isArray(sug.suggestions) && sug.suggestions.length > 0) {
            displayTrans = sug.suggestions.slice(0, 2).join(', ');
            if (!displayIpa && sug.transcription) displayIpa = sug.transcription;
            const transEl = wordPopover.querySelector('#scanner-popover-trans-text');
            if (transEl) transEl.textContent = displayTrans;
          }
        } catch (err) {}
      }

      const addBtnEl = wordPopover.querySelector('#scanner-popover-add-btn');
      if (addBtnEl && !isAlreadyInDict) {
        addBtnEl.addEventListener('click', () => {
          const existingNewIdx = currentNewLemmas.findIndex((x) => x.word.toLowerCase() === displayWord.toLowerCase());
          if (existingNewIdx >= 0) {
            selectedIndices.add(existingNewIdx);
          } else {
            const finalTr = (displayTrans || displayWord).toLowerCase();
            const newIdx = currentNewLemmas.length;
            currentNewLemmas.push({
              word: displayWord.toLowerCase(),
              original: clickedLower,
              category: currentGroupCategory || 'Elementary',
              level: displayLevel || 'B1',
              transcription: displayIpa || '',
              context: '',
              translationVariants: [finalTr],
              selectedVariants: new Set([finalTr]),
              isEditingTrans: false,
              customTranslation: finalTr,
            });
            selectedIndices.add(newIdx);
          }
          wordEl.classList.add('in-dict');
          addBtnEl.disabled = true;
          addBtnEl.textContent = t('scan_word_in_dict');
          if (tabWordsCount) tabWordsCount.textContent = `(${currentNewLemmas.length})`;
          renderLemmasList();
          updateSubmitButton();
        });
      }
    };
  }

  function renderLemmasList() {
    if (currentNewLemmas.length === 0) {
      lemmasList.innerHTML = `
        <div style="text-align: center; padding: 24px 12px; color: var(--text-muted); font-size: 14px;">
          ${t('scan_no_new_words')}
        </div>
      `;
      submitBtn.style.display = 'none';
      if (groupCatBtn) groupCatBtn.style.display = 'none';
      if (toggleSelectBtn) toggleSelectBtn.style.display = 'none';
      return;
    }

    if (groupCatBtn) groupCatBtn.style.display = 'inline-flex';
    if (toggleSelectBtn) toggleSelectBtn.style.display = 'inline-block';
    submitBtn.style.display = 'flex';
    lemmasList.innerHTML = currentNewLemmas
      .map((item, idx) => {
        const isChecked = selectedIndices.has(idx);
        const isSpecialCategory = item.category === 'Pattern' || item.category === 'Irregular verbs';
        const catClass = `cat-${item.category.toLowerCase().replace(/\s+/g, '-')}`;
        const catBadge = `<button type="button" class="scanner-lemma-cat ${catClass}" data-lemma-idx="${idx}" title="${t('scan_click_change_cat')} (${escapeHtml(item.category)})">${escapeHtml(item.category)} ⇄</button>`;
        const ipaText = (!isSpecialCategory && item.transcription) ? `<span class="scanner-lemma-ipa">${escapeHtml(item.transcription)}</span>` : '';
        const origSnippet = item.original && item.original.toLowerCase() !== item.word.toLowerCase()
          ? `<span style="font-size: 11px; color: var(--text-muted);">${escapeHtml(t('scan_in_text', { orig: item.original }))}</span>`
          : '';

        let transHtml = '';
        if (item.isEditingTrans) {
          transHtml = `
            <div class="scanner-trans-edit-row">
              <input type="text" class="scanner-trans-input" data-lemma-idx="${idx}" value="${escapeHtml(item.customTranslation)}" placeholder="${t('scan_trans_placeholder')}" />
              <button type="button" class="scanner-trans-done-btn" data-lemma-idx="${idx}" title="${t('scan_save_trans_title')}">✓</button>
            </div>
          `;
        } else {
          transHtml = `
            <div class="scanner-lemma-trans-chips">
              ${item.translationVariants.map((v, vIdx) => {
                const isVariantSelected = item.selectedVariants.has(v);
                return `
                  <button type="button" class="scanner-trans-chip ${isVariantSelected ? 'selected' : 'unselected'}" data-lemma-idx="${idx}" data-variant-idx="${vIdx}" title="${t('scan_toggle_variant_title')}">
                    <span class="scanner-chip-check">${isVariantSelected ? '✓' : '✕'}</span>
                    <span>${escapeHtml(v)}</span>
                  </button>
                `;
              }).join('')}
              <button type="button" class="scanner-trans-edit-btn" data-lemma-idx="${idx}" title="${t('scan_edit_trans_manual_title')}">✏️</button>
            </div>
          `;
        }

        return `
          <div class="scanner-lemma-item ${isChecked ? 'selected' : ''}" data-idx="${idx}">
            <input type="checkbox" class="scanner-lemma-checkbox" data-idx="${idx}" ${isChecked ? 'checked' : ''} />
            <div class="scanner-lemma-content">
              <div class="scanner-lemma-head">
                <span class="scanner-lemma-word">${escapeHtml(item.word)}</span>
                <button type="button" class="scanner-lemma-speak-btn" data-speak-word="${escapeHtml(item.word)}" title="${t('sound_on')}">🔊</button>
                ${ipaText}
                ${origSnippet}
                ${catBadge}
              </div>
              ${transHtml}
            </div>
          </div>
        `;
      })
      .join('');
  }

  function renderExistingSection(existingLemmas) {
    if (existingLemmas.length === 0) {
      existingBox.style.display = 'none';
      return;
    }

    existingBox.style.display = 'block';
    existingTitle.textContent = `${cleanBtnText(t('scan_already_exists'))} (${existingLemmas.length})`;
    existingList.innerHTML = existingLemmas
      .map((item) => `<span class="scanner-existing-chip">${escapeHtml(item.word)}</span>`)
      .join('');
  }

  existingToggle.addEventListener('click', () => {
    const isHidden = existingList.style.display === 'none';
    existingList.style.display = isHidden ? 'flex' : 'none';
    existingArrow.textContent = isHidden ? '▲' : '▼';
  });

  lemmasList.addEventListener('input', (e) => {
    if (e.target.classList.contains('scanner-trans-input')) {
      const lemmaIdx = parseInt(e.target.getAttribute('data-lemma-idx'), 10);
      const item = currentNewLemmas[lemmaIdx];
      if (item) {
        item.customTranslation = e.target.value;
      }
    }
  });

  lemmasList.addEventListener('click', (e) => {
    // 0. Audio Speak Button Click
    const speakBtn = e.target.closest('.scanner-lemma-speak-btn');
    if (speakBtn) {
      e.stopPropagation();
      const w = speakBtn.getAttribute('data-speak-word');
      if (w) speakWord(w);
      return;
    }

    // 1. Category Badge Click -> Cycle Category
    const catBtn = e.target.closest('.scanner-lemma-cat');
    if (catBtn) {
      e.stopPropagation();
      const lemmaIdx = parseInt(catBtn.getAttribute('data-lemma-idx'), 10);
      const item = currentNewLemmas[lemmaIdx];
      if (item) {
        const catCycle = ['Pattern', 'Irregular verbs', 'Elementary', 'Intermediate', 'Advanced'];
        const curIdx = catCycle.indexOf(item.category);
        if (curIdx === -1) {
          item.category = item.category === 'Pattern' ? 'Irregular verbs' : 'Pattern';
        } else {
          item.category = catCycle[(curIdx + 1) % catCycle.length];
        }

        if (item.category === 'Pattern' || item.category === 'Irregular verbs') {
          item.level = '';
          if (item.category === 'Pattern') item.transcription = '';
        } else if (!item.level) {
          item.level = 'A2';
        }

        renderLemmasList();
      }
      return;
    }

    // 2. Translation Variant Chip Click -> Toggle Translation Variant Checkbox
    const chipBtn = e.target.closest('.scanner-trans-chip');
    if (chipBtn) {
      e.stopPropagation();
      const lemmaIdx = parseInt(chipBtn.getAttribute('data-lemma-idx'), 10);
      const vIdx = parseInt(chipBtn.getAttribute('data-variant-idx'), 10);
      const item = currentNewLemmas[lemmaIdx];
      if (item && item.translationVariants[vIdx]) {
        const v = item.translationVariants[vIdx];
        if (item.selectedVariants.has(v)) {
          if (item.selectedVariants.size > 1) {
            item.selectedVariants.delete(v);
          }
        } else {
          item.selectedVariants.add(v);
        }
        item.customTranslation = Array.from(item.selectedVariants).join(', ');
        renderLemmasList();
      }
      return;
    }

    // 3. Edit Translation Button ✏️
    const editBtn = e.target.closest('.scanner-trans-edit-btn');
    if (editBtn) {
      e.stopPropagation();
      const lemmaIdx = parseInt(editBtn.getAttribute('data-lemma-idx'), 10);
      const item = currentNewLemmas[lemmaIdx];
      if (item) {
        item.isEditingTrans = true;
        renderLemmasList();
        setTimeout(() => {
          const input = lemmasList.querySelector(`.scanner-trans-input[data-lemma-idx="${lemmaIdx}"]`);
          if (input) input.focus();
        }, 50);
      }
      return;
    }

    // 4. Done Edit Translation Button ✓
    const doneBtn = e.target.closest('.scanner-trans-done-btn');
    if (doneBtn) {
      e.stopPropagation();
      const lemmaIdx = parseInt(doneBtn.getAttribute('data-lemma-idx'), 10);
      const item = currentNewLemmas[lemmaIdx];
      if (item) {
        const input = lemmasList.querySelector(`.scanner-trans-input[data-lemma-idx="${lemmaIdx}"]`);
        if (input) {
          const val = input.value.trim();
          item.customTranslation = val;
          const splitParts = val.split(/[,;\/]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
          item.translationVariants = splitParts.length > 0 ? splitParts : [val];
          item.selectedVariants = new Set(item.translationVariants);
        }
        item.isEditingTrans = false;
        renderLemmasList();
      }
      return;
    }

    // 5. Normal Item Selection Toggle
    const itemEl = e.target.closest('.scanner-lemma-item');
    if (!itemEl) return;
    const idx = parseInt(itemEl.getAttribute('data-idx'), 10);
    const cb = itemEl.querySelector('.scanner-lemma-checkbox');

    if (e.target !== cb) {
      cb.checked = !cb.checked;
    }

    if (cb.checked) {
      selectedIndices.add(idx);
      itemEl.classList.add('selected');
    } else {
      selectedIndices.delete(idx);
      itemEl.classList.remove('selected');
    }

    updateSubmitButton();
  });

  // Group Category Cycler (all words at once)
  if (groupCatBtn) {
    groupCatBtn.addEventListener('click', () => {
      const catCycle = ['Elementary', 'Intermediate', 'Advanced', 'Pattern', 'Irregular verbs'];
      const curIdx = catCycle.indexOf(currentGroupCategory);
      currentGroupCategory = catCycle[(curIdx + 1) % catCycle.length];
      if (groupCatLabel) {
        groupCatLabel.textContent = `${currentGroupCategory} ⇄`;
      }

      currentNewLemmas.forEach((item) => {
        item.category = currentGroupCategory;
        if (currentGroupCategory === 'Pattern' || currentGroupCategory === 'Irregular verbs') {
          item.level = '';
          if (currentGroupCategory === 'Pattern') item.transcription = '';
        } else if (currentGroupCategory === 'Elementary') {
          item.level = 'A2';
        } else if (currentGroupCategory === 'Intermediate') {
          item.level = 'B1';
        } else if (currentGroupCategory === 'Advanced') {
          item.level = 'C1';
        }
      });

      renderLemmasList();
    });
  }

  // Single Toggle Select Button (Select all / Deselect all)
  if (toggleSelectBtn) {
    toggleSelectBtn.addEventListener('click', () => {
      const allSelected = selectedIndices.size === currentNewLemmas.length && currentNewLemmas.length > 0;
      if (allSelected) {
        selectedIndices.clear();
        lemmasList.querySelectorAll('.scanner-lemma-item').forEach((el) => el.classList.remove('selected'));
        lemmasList.querySelectorAll('.scanner-lemma-checkbox').forEach((cb) => (cb.checked = false));
      } else {
        selectedIndices = new Set(currentNewLemmas.map((_, i) => i));
        lemmasList.querySelectorAll('.scanner-lemma-item').forEach((el) => el.classList.add('selected'));
        lemmasList.querySelectorAll('.scanner-lemma-checkbox').forEach((cb) => (cb.checked = true));
      }
      updateSubmitButton();
    });
  }

  function updateSubmitButton() {
    const count = selectedIndices.size;
    submitBtn.textContent = cleanBtnText(t('scan_add_btn'));
    submitBtn.disabled = count === 0;
    submitBtn.style.opacity = count === 0 ? '0.5' : '1';

    if (toggleSelectBtn) {
      const allSelected = count === currentNewLemmas.length && currentNewLemmas.length > 0;
      toggleSelectBtn.textContent = allSelected ? t('scan_deselect_all') : t('scan_select_all');
    }
  }

  submitBtn.addEventListener('click', async () => {
    const selectedWords = Array.from(selectedIndices).map((idx) => {
      const item = currentNewLemmas[idx];
      let finalTrans = '';
      if (item.isEditingTrans) {
        const input = lemmasList.querySelector(`.scanner-trans-input[data-lemma-idx="${idx}"]`);
        finalTrans = (input ? input.value : item.customTranslation).trim();
      } else {
        finalTrans = Array.from(item.selectedVariants).join(', ').trim() || item.customTranslation.trim() || item.word;
      }
      if (!finalTrans) finalTrans = item.word;

      return {
        word: item.word,
        original: item.original || item.word,
        translation: finalTrans,
        category: item.category,
        level: (item.category === 'Pattern' || item.category === 'Irregular verbs') ? '' : item.level,
        transcription: item.category === 'Pattern' ? '' : item.transcription,
        notes: '',
      };
    });
    if (selectedWords.length === 0) return;

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = cleanBtnText(t('scan_adding_to_dict'));

      const res = await batchAddCustomWords(selectedWords);
      const added = res.words || selectedWords;

      for (let i = 0; i < added.length; i++) {
        const w = added[i];
        if (w.id) {
          toggleFavoriteApi(w.id, true).catch(() => {});
        }
      }

      onWordsSaved(added);

      if (window.trackEvent) {
        window.trackEvent('scanner_words_added', { count: added.length, category: currentGroupCategory });
      }

      submitBtn.textContent = `${cleanBtnText(t('scan_added_success'))}${added.length}!`;
      setTimeout(() => {
        closeModal();
      }, 1100);
    } catch (err) {
      submitBtn.disabled = false;
      updateSubmitButton();
      showError(err.message || t('scan_err_save_words'));
    }
  });
}

const _dictCategoryCache = new Map();
function sanitizeCategory(cat) {
  if (!cat) return 'Elementary';
  const raw = String(cat);
  const cached = _dictCategoryCache.get(raw);
  if (cached !== undefined) return cached;
  const s = raw.replace(/\s*[•\-–—]?\s*[A-C][1-2].*$/i, '').trim();
  const clean = s.toLowerCase();
  let cleaned = 'Elementary';
  if (clean.includes('elementary')) cleaned = 'Elementary';
  else if (clean.includes('irregular')) cleaned = 'Irregular verbs';
  else if (clean.includes('pattern')) cleaned = 'Pattern';
  else if (clean.includes('intermediate')) cleaned = 'Intermediate';
  else if (clean.includes('advanced')) cleaned = 'Advanced';
  _dictCategoryCache.set(raw, cleaned);
  return cleaned;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatWordCount(count) {
  const lang = getInterfaceLanguage();
  if (lang === 'ru' || lang === 'uk') {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod100 >= 11 && mod100 <= 19) return `${count} ${t('words')}`;
    if (mod10 === 1) return `${count} ${t('word_1')}`;
    if (mod10 >= 2 && mod10 <= 4) return `${count} ${t('word_2')}`;
    return `${count} ${t('words')}`;
  }
  return `${count} ${t('words')}`;
}

const BATCH_SIZE = 35;

function renderWordCardHtml(w, isFav, prog, activeLang) {
  const isMastered = isWordMastered(prog);
  const cleanCat = sanitizeCategory(w.category);
  const quizCount = prog?.quizCorrect || 0;
  const pairsCount = prog?.pairsCorrect || 0;
  const testCount = prog?.inputCorrect || 0;
  const seen = prog?.seenInCards;

  let stageBadge = '';
  if (isMastered) {
    stageBadge = `<span class="mastered-badge">🏆 ${t('dict_filter_mastered')}</span>`;
  } else if (pairsCount >= 2) {
    stageBadge = `<span class="in-progress-badge" style="background:#e0e7ff; color:#3730a3; border: 1px solid #818cf8;">✍️ ${t('dict_stage_test') || 'Тест'}: ${testCount}/2</span>`;
  } else if (quizCount >= 5) {
    stageBadge = `<span class="in-progress-badge" style="background:#f3e8ff; color:#6b21a8; border: 1px solid #c084fc;">🧩 ${t('dict_stage_pairs') || 'Пары'}: ${pairsCount}/2</span>`;
  } else if (seen) {
    stageBadge = `<span class="in-progress-badge" style="background:#fef3c7; color:#92400e; border: 1px solid #f59e0b;">🎯 ${t('dict_stage_quiz') || 'Квиз'}: ${quizCount}/5</span>`;
  }

  const transText = getWordTranslation(w, activeLang);
  const noteText = getWordNotes(w, activeLang);

  return `
    <div class="dict-card ${isMastered ? 'mastered' : ''}" data-id="${w.id}">
      <div class="dict-card-header">
        <span class="category-badge">${cleanCat}</span>
        ${stageBadge ? `<div class="dict-card-center-badge">${stageBadge}</div>` : ''}
        <div class="dict-card-actions">
          <button type="button" class="dict-audio-btn" data-word="${escapeHtml(w.word)}" data-id="${w.id}" title="${t('sound_on')}" aria-label="${t('sound_on')}">
            🔊
          </button>
          <button type="button" class="fav-icon-btn ${isFav ? 'active' : ''}" data-id="${w.id}" title="${t('fav_toggle')}" aria-label="${t('fav_toggle')}">
            ${isFav ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
      
      <div class="dict-card-body">
        <h3>${escapeHtml(w.word)}</h3>
        <p class="dict-translation">${escapeHtml(transText)}</p>
        ${noteText ? `<p class="dict-notes">${escapeHtml(noteText)}</p>` : ''}
      </div>
    </div>
  `;
}


function openAddWordModal(words = [], initialWord = '', onWordSaved = () => {}) {
  const modalEl = document.createElement('div');
  modalEl.id = 'add-word-modal-overlay';
  modalEl.style.cssText = 'position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box; backdrop-filter: blur(4px);';

  const standardCats = ['Elementary', 'Intermediate', 'Advanced', 'Irregular verbs', 'Pattern'];
  const existingCats = Array.from(new Set([...standardCats, ...words.map((w) => String(w.category || '').trim()).filter(Boolean)]));
  existingCats.sort();
  if (existingCats.length === 0) existingCats.push('Elementary');

  const titleText = t('dict_add_word_title');
  const wordLabel = t('dict_word_label');
  const transLabel = t('dict_trans_label');
  const catLabel = t('dict_cat_label');
  const notesLabel = t('dict_notes_label');
  const saveBtnText = t('dict_save_btn');
  const cancelBtnText = t('dict_cancel_btn');
  const updateNoteText = t('dict_update_note_btn');
  const checkingBtnText = t('dict_checking_btn');

  modalEl.innerHTML = `
    <div style="background: var(--card-bg, #1a2234); border: 1px solid var(--border-color, #2e3a52); border-radius: 16px; padding: 22px; max-width: 440px; width: 100%; box-shadow: 0 12px 36px rgba(0,0,0,0.5); box-sizing: border-box; position: relative; max-height: 90vh; overflow-y: auto; text-align: left;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: var(--text-main); text-align: left;">${titleText}</h3>
        <button type="button" id="add-word-close-btn" style="background: none; border: none; font-size: 22px; cursor: pointer; color: var(--text-muted); padding: 2px 6px; line-height: 1;">✕</button>
      </div>

      <form id="add-word-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div id="add-word-notice" style="display: none; padding: 10px 12px; background: rgba(217, 119, 6, 0.12); border: 1px solid #d97706; border-radius: 8px; font-size: 13px; color: var(--text-main); line-height: 1.4;"></div>
        <div id="add-word-error" style="display: none; padding: 10px 12px; background: rgba(239, 68, 68, 0.12); border: 1px solid #ef4444; border-radius: 8px; font-size: 13px; color: #ef4444; font-weight: 500;"></div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">
            <label for="add-word-input">${wordLabel}</label>
            <span id="add-word-len" style="color: var(--text-muted); font-size: 11px;">0/50</span>
          </div>
          <input type="text" id="add-word-input" class="search-input" maxlength="50" required value="${escapeHtml(initialWord.toLowerCase())}" placeholder="${t('dict_word_placeholder')}" style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 9px 12px; font-size: 15px; box-sizing: border-box;" />
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">
            <label for="add-trans-input">${transLabel}</label>
            <span id="add-trans-len" style="color: var(--text-muted); font-size: 11px;">0/75</span>
          </div>
          <input type="text" id="add-trans-input" class="search-input" maxlength="75" required placeholder="${t('dict_trans_placeholder')}" style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 9px 12px; font-size: 15px; box-sizing: border-box;" />
          <div id="add-trans-suggestions" style="display: none; flex-wrap: wrap; gap: 6px; margin-top: 6px; align-items: center;">
            <span style="font-size: 11px; color: var(--text-muted);">${t('dict_variants_label')}</span>
            <div id="add-trans-pills" style="display: flex; flex-wrap: wrap; gap: 6px;"></div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">
            <label for="add-cat-select">${catLabel}</label>
          </div>
          <select id="add-cat-select" style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 9px 12px; font-size: 14px; background: var(--card-bg, #1a2234); color: var(--text-main); box-sizing: border-box;">
            ${existingCats.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
          </select>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">
            <label for="add-notes-input">${notesLabel}</label>
            <span id="add-notes-len" style="color: var(--text-muted); font-size: 11px;">0/100</span>
          </div>
          <textarea id="add-notes-input" maxlength="100" rows="2" placeholder="${t('dict_notes_placeholder')}" style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; font-size: 14px; background: var(--card-bg, #1a2234); color: var(--text-main); font-family: inherit; resize: none; box-sizing: border-box;"></textarea>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 8px;">
          <button type="button" id="add-word-cancel-btn" class="primary-button" style="flex: 1; min-height: 42px; background: rgba(255,255,255,0.08); color: var(--text-main); border-radius: 8px; font-size: 14px; font-weight: 600; padding: 6px 8px; box-sizing: border-box;">
            ${cancelBtnText}
          </button>
          <button type="submit" id="add-word-submit-btn" class="primary-button btn-green" style="flex: 1; min-height: 42px; border-radius: 8px; font-weight: 700; font-size: 13.5px; padding: 6px 6px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.2;">
            ${saveBtnText}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalEl);

  const wordInput = modalEl.querySelector('#add-word-input');
  const transInput = modalEl.querySelector('#add-trans-input');
  const catSelect = modalEl.querySelector('#add-cat-select');
  const notesInput = modalEl.querySelector('#add-notes-input');
  const noticeBox = modalEl.querySelector('#add-word-notice');
  const errorBox = modalEl.querySelector('#add-word-error');
  const suggestionsBox = modalEl.querySelector('#add-trans-suggestions');
  const pillsBox = modalEl.querySelector('#add-trans-pills');
  const submitBtn = modalEl.querySelector('#add-word-submit-btn');
  const closeBtn = modalEl.querySelector('#add-word-close-btn');
  const cancelBtn = modalEl.querySelector('#add-word-cancel-btn');

  const wordLen = modalEl.querySelector('#add-word-len');
  const transLen = modalEl.querySelector('#add-trans-len');
  const notesLen = modalEl.querySelector('#add-notes-len');

  function updateCounters() {
    if (wordLen) wordLen.textContent = `${wordInput.value.length}/50`;
    if (transLen) transLen.textContent = `${transInput.value.length}/75`;
    if (notesLen) notesLen.textContent = `${notesInput.value.length}/100`;
  }

  let suggestTimeout = null;

  async function fetchAiSuggestions(cleanWord) {
    if (!cleanWord || cleanWord.length < 2 || !/[aeiouy]/i.test(cleanWord) || /[bcdfghjklmnpqrstvwxz]{5,}/i.test(cleanWord)) {
      if (suggestionsBox) suggestionsBox.style.display = 'none';
      return;
    }

    if (suggestionsBox) {
      suggestionsBox.style.display = 'flex';
      if (pillsBox) {
        pillsBox.innerHTML = `<span style="font-size: 11.5px; color: var(--text-muted); padding: 3px 6px;">${t('dict_searching_trans')}</span>`;
      }
    }

    const data = await suggestTranslations(cleanWord);

    // Make sure user hasn't changed the input while fetching
    if (wordInput.value.trim().toLowerCase() !== cleanWord) {
      return;
    }

    if (data && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
      if (data.suggestions[0]) {
        const egPrefix = (t('dict_word_placeholder').split(':')[0] || 'e.g.').trim();
        transInput.placeholder = `${egPrefix}: ${data.suggestions[0]}`;
      }

      if (pillsBox) {
        pillsBox.innerHTML = data.suggestions
          .map(
            (s) => `
          <button type="button" class="trans-pill-btn" data-val="${escapeHtml(s)}" style="background: rgba(34, 197, 94, 0.12); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.35); border-radius: 20px; padding: 4px 10px; font-size: 12.5px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; transition: all 0.15s ease;">
            <span>+</span> ${escapeHtml(s)}
          </button>
        `
          )
          .join('');

        function syncPillsHighlight() {
          const currentWords = transInput.value
            .toLowerCase()
            .split(/[,;\/]/)
            .map((x) => x.trim())
            .filter(Boolean);

          pillsBox.querySelectorAll('.trans-pill-btn').forEach((btn) => {
            const val = (btn.getAttribute('data-val') || '').toLowerCase();
            const isSelected = currentWords.includes(val);
            if (isSelected) {
              btn.style.background = '#22c55e';
              btn.style.color = '#ffffff';
              btn.style.borderColor = '#16a34a';
              btn.innerHTML = `✓ ${escapeHtml(val)}`;
            } else {
              btn.style.background = 'rgba(34, 197, 94, 0.12)';
              btn.style.color = '#22c55e';
              btn.style.borderColor = 'rgba(34, 197, 94, 0.35)';
              btn.innerHTML = `+ ${escapeHtml(val)}`;
            }
          });
        }

        pillsBox.querySelectorAll('.trans-pill-btn').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const val = (btn.getAttribute('data-val') || '').toLowerCase();
            let currentWords = transInput.value
              .toLowerCase()
              .split(/[,;\/]/)
              .map((x) => x.trim())
              .filter(Boolean);

            if (currentWords.includes(val)) {
              currentWords = currentWords.filter((w) => w !== val);
            } else {
              currentWords.push(val);
            }

            transInput.value = currentWords.join(', ');
            updateCounters();
            syncPillsHighlight();
          });
        });

        syncPillsHighlight();
      }

      if (data.category && existingCats.includes(data.category)) {
        catSelect.value = data.category;
      }

      if (suggestionsBox) suggestionsBox.style.display = 'flex';
    } else {
      if (suggestionsBox) suggestionsBox.style.display = 'none';
    }
  }

  const CLIENT_PROFANITY = [
    'fuck', 'fucking', 'fucker', 'fucked', 'fucks',
    'shit', 'bitch', 'cunt', 'dick', 'pussy', 'asshole',
    'bastard', 'slut', 'whore', 'nigger', 'nigga', 'fag', 'cock', 'porn',
    'хуй', 'пизд', 'ебат', 'ебан', 'бляд', 'сука', 'мудак'
  ];

  function isClientProfane(text) {
    const t = String(text || '').toLowerCase();
    return CLIENT_PROFANITY.some((bad) => {
      const reg = new RegExp('\\b' + bad + '\\b', 'i');
      return reg.test(t) || t.includes(bad);
    });
  }

  function syncCategoryForInput() {
    const typed = wordInput.value.trim().toLowerCase();
    const tokenCount = typed.split(/\s+/).filter(Boolean).length;
    if (tokenCount > 1) {
      if (!Array.from(catSelect.options).some((o) => o.value === 'Pattern')) {
        const opt = document.createElement('option');
        opt.value = 'Pattern';
        opt.textContent = 'Pattern';
        catSelect.appendChild(opt);
      }
      catSelect.value = 'Pattern';
      catSelect.disabled = true;
      catSelect.style.opacity = '0.75';
      catSelect.style.cursor = 'not-allowed';
    } else {
      const existing = words.find((w) => w.word && w.word.trim().toLowerCase() === typed);
      if (!existing) {
        catSelect.disabled = false;
        catSelect.style.opacity = '1';
        catSelect.style.cursor = 'default';
      }
    }
  }

  function checkDuplicate() {
    const typed = wordInput.value.trim().toLowerCase();
    const existing = words.find((w) => w.word && w.word.trim().toLowerCase() === typed);
    if (existing) {
      const existingTrans = getWordTranslation(existing) || existing.translation || '';
      const existingNotes = getWordNotes(existing) || '';
      noticeBox.style.display = 'block';
      noticeBox.innerHTML = t('dict_word_already_exists_notice', { trans: escapeHtml(existingTrans), cat: escapeHtml(existing.category) });
      transInput.value = existingTrans;
      transInput.disabled = true;
      transInput.setAttribute('readonly', 'true');
      notesInput.value = existingNotes;
      catSelect.value = existing.category || (existingCats[0] || 'Elementary');
      catSelect.disabled = true;
      if (suggestionsBox) suggestionsBox.style.display = 'none';
      submitBtn.textContent = updateNoteText;
      updateCounters();
    } else {
      noticeBox.style.display = 'none';
      transInput.disabled = false;
      transInput.removeAttribute('readonly');
      catSelect.disabled = false;
      syncCategoryForInput();
      submitBtn.textContent = saveBtnText;

      clearTimeout(suggestTimeout);
      suggestTimeout = setTimeout(() => {
        fetchAiSuggestions(typed);
      }, 200);
    }
  }

  wordInput.addEventListener('input', () => {
    let val = wordInput.value.toLowerCase();
    const hasInvalidChars = /[^a-z\s\-\']/.test(val);
    if (hasInvalidChars) {
      val = val.replace(/[^a-z\s\-\']/g, '');
      wordInput.value = val;
      errorBox.style.display = 'block';
      errorBox.textContent = t('dict_err_english_chars_only');
    } else if (isClientProfane(val)) {
      errorBox.style.display = 'block';
      errorBox.textContent = t('dict_err_profanity');
    } else {
      if (errorBox.textContent === t('dict_err_english_chars_only') || errorBox.textContent === t('dict_err_profanity')) {
        errorBox.style.display = 'none';
      }
      wordInput.value = val;
    }
    updateCounters();
    checkDuplicate();
  });

  transInput.addEventListener('input', () => {
    transInput.value = transInput.value.toLowerCase();
    updateCounters();
    const currentWords = transInput.value.toLowerCase().split(/[,;\/]/).map(x => x.trim()).filter(Boolean);
    if (pillsBox) {
      pillsBox.querySelectorAll('.trans-pill-btn').forEach(btn => {
        const val = (btn.getAttribute('data-val') || '').toLowerCase();
        const isSelected = currentWords.includes(val);
        if (isSelected) {
          btn.style.background = '#22c55e';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#16a34a';
          btn.innerHTML = `✓ ${escapeHtml(val)}`;
        } else {
          btn.style.background = 'rgba(34, 197, 94, 0.12)';
          btn.style.color = '#22c55e';
          btn.style.borderColor = 'rgba(34, 197, 94, 0.35)';
          btn.innerHTML = `+ ${escapeHtml(val)}`;
        }
      });
    }
  });
  notesInput.addEventListener('input', updateCounters);

  updateCounters();
  if (initialWord) {
    checkDuplicate();
  }

  function cleanup() {
    modalEl.remove();
  }

  closeBtn.addEventListener('click', cleanup);
  cancelBtn.addEventListener('click', cleanup);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) cleanup();
  });

  const form = modalEl.querySelector('#add-word-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const word = wordInput.value.trim().toLowerCase();
    const existing = words.find((w) => w.word && w.word.trim().toLowerCase() === word);
    const translation = existing 
      ? (existing.translation || transInput.value.trim().toLowerCase()) 
      : transInput.value.trim().toLowerCase();
    const category = existing
      ? (existing.category || 'Elementary')
      : (word.split(/\s+/).filter(Boolean).length > 1 ? 'Pattern' : catSelect.value.trim());
    const notes = notesInput.value.trim();

    if (word.length < 2 || word.length > 50) {
      errorBox.style.display = 'block';
      errorBox.textContent = t('dict_err_word_length');
      return;
    }

    if (translation.length < 1 || translation.length > 75) {
      errorBox.style.display = 'block';
      errorBox.textContent = t('dict_err_trans_length');
      return;
    }

    if (notes.length > 100) {
      errorBox.style.display = 'block';
      errorBox.textContent = t('dict_err_notes_length');
      return;
    }

    const wordTokens = word.split(/\s+/).filter(Boolean);
    if (wordTokens.length > 6) {
      errorBox.style.display = 'block';
      errorBox.textContent = t('dict_err_phrase_max_words');
      return;
    }

    if (!/^[a-z\s\-\']+$/i.test(word) || /[0-9\u0400-\u04FF]/.test(word)) {
      errorBox.style.display = 'block';
      errorBox.textContent = t('dict_err_english_only');
      return;
    }

    if (!/[aeiouy]/i.test(word)) {
      errorBox.style.display = 'block';
      errorBox.textContent = t('dict_err_need_vowel');
      return;
    }

    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(word)) {
      errorBox.style.display = 'block';
      errorBox.textContent = t('dict_err_gibberish');
      return;
    }

    if (isClientProfane(word) || isClientProfane(translation)) {
      errorBox.style.display = 'block';
      errorBox.textContent = t('dict_err_profanity');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="hourglass-flip">⏳</span> ${checkingBtnText}`;

    try {
      const res = await addCustomWord({ word, translation, category, notes });
      if (window.trackEvent) {
        window.trackEvent('custom_word_create', { word: word, category: category });
      }
      cleanup();

      // Automatically add newly created word to creator's Favorites ❤️
      if (res && res.word && res.word.id) {
        try {
          await toggleFavoriteApi(res.word.id, true);
        } catch (e) {
          console.warn('Auto-favorite on create failed:', e);
        }
      }

      onWordSaved(res.word);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = saveBtnText;
      errorBox.style.display = 'block';
      errorBox.textContent = err.message || t('dict_err_save_word');
    }
  });

  setTimeout(() => {
    if (initialWord) transInput.focus();
    else wordInput.focus();
  }, 100);
}

function renderDictionaryView(words = [], containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const { favoriteIds = [], onFavoriteToggle = () => {} } = options;
  const favSet = new Set(favoriteIds.map(String));
  const userProgress = getUserProgress();

  const getCategoryOrderIndex = (catName) => {
    const clean = String(catName || '').toLowerCase().trim();
    if (clean.includes('elementary')) return 0;
    if (clean.includes('irregular')) return 1;
    if (clean.includes('pattern')) return 2;
    if (clean.includes('intermediate')) return 3;
    if (clean.includes('advanced')) return 4;
    return 999;
  };
  let uniqueCats = Array.from(new Set(words.map((w) => sanitizeCategory(w.category)).filter(Boolean)))
    .sort((a, b) => {
      const diff = getCategoryOrderIndex(a) - getCategoryOrderIndex(b);
      if (diff !== 0) return diff;
      return a.localeCompare(b);
    });
  let allCategories = ['All', ...uniqueCats];

  const savedDictCat = localStorage.getItem('myduo_dict_category') || 'Elementary';
  let currentCategory = savedDictCat;
  if (currentCategory !== 'All' && !uniqueCats.includes(currentCategory)) {
    currentCategory = uniqueCats.includes('Elementary') ? 'Elementary' : 'All';
  }

  function getCatDisplayName(cat) {
    return cat === 'All' ? t('dict_filter_all') : cat;
  }

  function refreshCategories() {
    uniqueCats = Array.from(new Set(words.map((w) => sanitizeCategory(w.category)).filter(Boolean)))
      .sort((a, b) => {
        const diff = getCategoryOrderIndex(a) - getCategoryOrderIndex(b);
        if (diff !== 0) return diff;
        return a.localeCompare(b);
      });
    allCategories = ['All', ...uniqueCats];
    renderCategoryOptions();
  }

  const lang = getInterfaceLanguage();
  const addWordBtnText = t('dict_add_word_btn') || (lang === 'ru' ? '➕ Добавить слово' : lang === 'uk' ? '➕ Додати слово' : '➕ Add word');
  const scanBtnText = t('dict_scan_btn') || (lang === 'ru' ? '📷 Сканировать' : lang === 'uk' ? '📷 Сканувати' : '📷 Scan');

  const getMasteredCount = (list, progObj = userProgress) => {
    const prog = progObj || userProgress || {};
    let count = 0;
    for (let i = 0; i < list.length; i++) {
      const w = list[i];
      if (w && isWordMastered(prog[w.id] || prog[String(w.id)])) count++;
    }
    return count;
  };

  container.innerHTML = `
    <div class="dictionary-page" style="width: 100%; max-width: 100%; box-sizing: border-box;">
      <div class="page-header" style="margin-bottom: 14px;">
        <h2 id="dict-header-title" style="margin: 0 0 10px; font-size: 18px; font-weight: 700; letter-spacing: -0.2px;">${t('dict_title')}: <span id="dict-word-count">${getMasteredCount(words)} / ${words.length}</span></h2>
        <div class="dict-header-actions" style="display: flex; gap: 8px; width: 100%; box-sizing: border-box;">
          <button type="button" class="primary-button btn-green" id="dict-open-add-btn" style="flex: 1; min-height: 42px; font-size: 13.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box; padding: 0 8px;">
            ${addWordBtnText}
          </button>
          <button type="button" class="primary-button btn-blue" id="dict-open-scan-btn" style="flex: 1; min-height: 42px; font-size: 13.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box; padding: 0 8px;">
            ${scanBtnText}
          </button>
        </div>
      </div>

      <!-- Controls: Sticky Search & Category Filter -->
      <div class="dictionary-controls" style="width: 100%; box-sizing: border-box;">
        <input type="text" id="dict-search" class="search-input" placeholder="🔍 ${t('dict_search')}" autocomplete="off" />
        
        <div class="custom-dropdown dict-dropdown" id="dict-cat-dropdown">
          <button type="button" class="custom-dropdown-trigger" id="dict-cat-trigger" aria-haspopup="listbox" aria-expanded="false">
            <span id="dict-cat-label">${getCatDisplayName(currentCategory)}</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          <div class="custom-dropdown-menu dict-dropdown-menu" id="dict-cat-menu" role="listbox"></div>
        </div>
      </div>

      <div class="dictionary-grid" id="dict-grid">
        <!-- Rendered in ultra-fast batches -->
      </div>
      <div id="dict-scroll-sentinel" style="height: 40px; text-align: center; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 13px;"></div>
    </div>
  `;

  const headerEl = document.querySelector('.mobile-header');
  const dictControls = container.querySelector('.dictionary-controls');
  const updateDictStickyTop = () => {
    if (dictControls) {
      const safeTop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-top')) || 0;
      const headerHeight = headerEl ? headerEl.offsetHeight : 60;
      dictControls.style.setProperty('--dict-sticky-top', `${Math.round(headerHeight + safeTop)}px`);
    }
  };
  updateDictStickyTop();
  if (window._myduoDictResizeHandler) {
    window.removeEventListener('resize', window._myduoDictResizeHandler);
  }
  window._myduoDictResizeHandler = updateDictStickyTop;
  window.addEventListener('resize', updateDictStickyTop, { passive: true });

  const dictDropdown = container.querySelector('#dict-cat-dropdown');
  const dictTrigger = container.querySelector('#dict-cat-trigger');
  const dictLabel = container.querySelector('#dict-cat-label');
  const dictMenu = container.querySelector('#dict-cat-menu');
  const openAddBtn = container.querySelector('#dict-open-add-btn');
  const openScanBtn = container.querySelector('#dict-open-scan-btn');

  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      openAddWordModal(words, '', (savedWord) => {
        if (!words.some((w) => String(w.id) === String(savedWord.id))) {
          words.unshift(savedWord);
        }
        refreshCategories();
        filterAndResetList();
      });
    });
  }

  if (openScanBtn) {
    openScanBtn.addEventListener('click', () => {
      openDocScannerModal(words, (addedWords) => {
        if (Array.isArray(addedWords) && addedWords.length > 0) {
          addedWords.forEach((aw) => {
            if (!words.some((w) => String(w.id) === String(aw.id) || (w.word && w.word.toLowerCase() === aw.word.toLowerCase()))) {
              words.unshift(aw);
            }
            if (aw.id) {
              favSet.add(String(aw.id));
            }
          });
          const firstCat = addedWords[0]?.category;
          if (firstCat && currentCategory !== 'All' && currentCategory !== firstCat) {
            currentCategory = firstCat;
            try {
              localStorage.setItem('myduo_dict_category', currentCategory);
            } catch (e) {}
            if (dictLabel) dictLabel.textContent = getCatDisplayName(currentCategory);
          }
          refreshCategories();
          filterAndResetList();
        }
      });
    });
  }

  function renderCategoryOptions() {
    if (!dictMenu) return;
    dictMenu.innerHTML = allCategories
      .map(
        (cat) => `
        <div class="custom-dropdown-item ${cat === currentCategory ? 'selected' : ''}" data-value="${cat}" role="option" aria-selected="${cat === currentCategory}">
          <span class="dict-cat-text">${getCatDisplayName(cat)}</span>
          ${cat === currentCategory ? '<span class="dict-cat-check">✓</span>' : ''}
        </div>
      `
      )
      .join('');
  }

  renderCategoryOptions();

  function toggleDropdown(show) {
    if (!dictDropdown || !dictTrigger || !dictMenu) return;
    const isExpanded = show !== undefined ? show : !dictDropdown.classList.contains('open');
    dictDropdown.classList.toggle('open', isExpanded);
    dictTrigger.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  }

  if (dictTrigger) {
    dictTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
    });
  }

  if (dictMenu) {
    dictMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = e.target.closest('.custom-dropdown-item');
      if (!item) return;
      currentCategory = item.getAttribute('data-value') || 'All';
      try {
        localStorage.setItem('myduo_dict_category', currentCategory);
      } catch (err) {}

      if (dictLabel) dictLabel.textContent = getCatDisplayName(currentCategory);
      renderCategoryOptions();
      toggleDropdown(false);
      filterAndResetList();

      if (currentCategory !== 'All' && currentCategory !== 'Все категории') {
        try {
          if (typeof getUserSettings === 'function') {
            getUserSettings().then((s) => {
              if (s) {
                s.category = currentCategory;
                if (typeof saveUserSettings === 'function') {
                  saveUserSettings(s).catch(() => {});
                }
              }
            }).catch(() => {});
          }
        } catch (err) {}
      }
    });
  }

  const closeDropdownOutside = (e) => {
    if (dictDropdown && !dictDropdown.contains(e.target)) {
      toggleDropdown(false);
    }
  };
  if (document._myduoDictOutsideClickHandler) {
    document.removeEventListener('click', document._myduoDictOutsideClickHandler);
  }
  document._myduoDictOutsideClickHandler = closeDropdownOutside;
  document.addEventListener('click', closeDropdownOutside);

  const searchInput = container.querySelector('#dict-search');
  const grid = container.querySelector('#dict-grid');
  const wordCountEl = container.querySelector('#dict-word-count');
  const sentinel = container.querySelector('#dict-scroll-sentinel');

  let filteredWords = [];
  let renderedCount = 0;
  let observer = null;

  function renderBatch() {
    const nextBatch = filteredWords.slice(renderedCount, renderedCount + BATCH_SIZE);
    if (nextBatch.length === 0) return;

    const currentLang = getInterfaceLanguage();
    const fragmentHtml = nextBatch
      .map((w) => {
        const isFav = favSet.has(String(w.id));
        const prog = userProgress[w.id] || userProgress[String(w.id)];
        return renderWordCardHtml(w, isFav, prog, currentLang);
      })
      .join('');

    grid.insertAdjacentHTML('beforeend', fragmentHtml);
    renderedCount += nextBatch.length;

    if (renderedCount < filteredWords.length) {
      if (sentinel) {
        sentinel.style.display = 'block';
        sentinel.textContent = t('auth_loading') || 'Loading...';
      }
    } else {
      if (sentinel) sentinel.style.display = 'none';
    }
  }

  function setupInfiniteScroll() {
    if (observer) observer.disconnect();
    if (!sentinel) return;

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && renderedCount < filteredWords.length) {
              renderBatch();
            }
          });
        },
        { root: null, rootMargin: '300px', threshold: 0.05 }
      );
      observer.observe(sentinel);
    }
  }

  const filterAndResetList = () => {
    const query = searchInput.value.trim().toLowerCase();
    const selectedCat = currentCategory;
    const currentLang = getInterfaceLanguage();

    filteredWords = words.filter((w) => {
      const catClean = sanitizeCategory(w.category);
      if (selectedCat !== 'All' && catClean !== selectedCat) return false;
      if (!query) return true;
      if (w.word && w.word.toLowerCase().includes(query)) return true;
      const trans = getWordTranslation(w, currentLang);
      return Boolean(trans && trans.toLowerCase().includes(query));
    });

    if (wordCountEl) {
      wordCountEl.textContent = `${getMasteredCount(filteredWords, userProgress)} / ${filteredWords.length}`;
    }

    grid.innerHTML = '';
    renderedCount = 0;

    if (filteredWords.length === 0) {
      const emptyText = t('dict_no_words_found');
      const quickAddText = t('dict_quick_add', { query: escapeHtml(query) });

      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px 16px;">
          <p style="margin-bottom: 16px; font-size: 15px; color: var(--text-muted);">${emptyText}</p>
          ${query ? `
            <button type="button" class="primary-button btn-green" id="dict-quick-add-btn" style="max-width: 300px; margin: 0 auto;">
              ${quickAddText}
            </button>
          ` : ''}
        </div>
      `;

      const quickAddBtn = grid.querySelector('#dict-quick-add-btn');
      if (quickAddBtn) {
        quickAddBtn.addEventListener('click', () => {
          openAddWordModal(words, query, (savedWord) => {
            if (!words.some((w) => String(w.id) === String(savedWord.id))) {
              words.unshift(savedWord);
            }
            searchInput.value = '';
            filterAndResetList();
          });
        });
      }

      if (sentinel) sentinel.style.display = 'none';
      return;
    }

    renderBatch();
    setupInfiniteScroll();
  };

  grid.addEventListener('click', async (e) => {
    const soundBtn = e.target.closest('.dict-audio-btn');
    if (soundBtn) {
      e.stopPropagation();
      const word = soundBtn.getAttribute('data-word');
      const id = soundBtn.getAttribute('data-id');
      speakWord(word, id);
      return;
    }

    const favBtn = e.target.closest('.fav-icon-btn');
    if (favBtn) {
      e.stopPropagation();
      const id = favBtn.getAttribute('data-id');
      const isCurrentlyFav = favSet.has(String(id));
      const nextFav = !isCurrentlyFav;

      if (nextFav) favSet.add(String(id));
      else favSet.delete(String(id));

      favBtn.textContent = nextFav ? '❤️' : '🤍';
      favBtn.classList.toggle('active', nextFav);

      await toggleFavoriteApi(id, nextFav);
      onFavoriteToggle(id, nextFav);
    }
  });

  let searchTimeout = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterAndResetList, 120);
  });

  filterAndResetList();
}

export { renderDictionaryView, openAddWordModal, openDocScannerModal };
