import { speakWord } from '../../services/audioService.js?v=200.0';
import { toggleFavoriteApi, getUserProgress, isWordMastered, addCustomWord, suggestTranslations, batchAddCustomWords, scanDocumentImage, getUserSettings, saveUserSettings } from '../../services/api.js?v=200.0';
import { t, getInterfaceLanguage, getWordTranslation, getWordNotes } from '../../services/i18n.js?v=200.0';

function compressImageFile(file, maxDimension = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          dataUrl,
          base64: dataUrl.split(',')[1],
          mimeType: 'image/jpeg',
        });
      };
      img.onerror = () => reject(new Error('Не удалось прочитать файл изображения.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Ошибка при чтении файла.'));
    reader.readAsDataURL(file);
  });
}

function openDocScannerModal(words = [], onWordsSaved = () => {}) {
  const modalEl = document.createElement('div');
  modalEl.id = 'doc-scanner-modal-overlay';
  modalEl.className = 'scanner-modal-overlay';

  modalEl.innerHTML = `
    <div class="scanner-modal-card">
      <div class="scanner-modal-header">
        <h3 class="scanner-modal-title">${t('scan_modal_title')}</h3>
        <button type="button" id="scanner-close-btn" class="scanner-close-btn" title="Закрыть">✕</button>
      </div>

      <div class="scanner-modal-body" id="scanner-modal-body">
        <input type="file" id="scanner-camera-input" accept="image/*" capture="environment" style="display: none;" />
        <input type="file" id="scanner-gallery-input" accept="image/*" style="display: none;" />

        <div id="scanner-error" class="scanner-error" style="display: none; margin-bottom: 12px;"></div>

        <!-- 1. Upload View -->
        <div id="scanner-upload-view" class="scanner-upload-view">
          <div class="scanner-dropzone" id="scanner-dropzone">
            <div class="scanner-dropzone-icon">📷</div>
            <p class="scanner-dropzone-text">${t('scan_dropzone_text')}</p>
            <div class="scanner-action-buttons">
              <button type="button" id="scanner-take-photo-btn" class="primary-button scanner-btn-camera">
                ${t('scan_take_photo')}
              </button>
              <button type="button" id="scanner-gallery-btn" class="primary-button scanner-btn-gallery">
                ${t('scan_choose_gallery')}
              </button>
            </div>
            <button type="button" id="scanner-open-paste-btn" class="scanner-btn-paste">
              ${t('scan_paste_btn')}
            </button>
          </div>
        </div>

        <!-- 1b. Paste Text View -->
        <div id="scanner-paste-view" class="scanner-paste-view" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 13.5px; font-weight: 700; color: var(--text-main);">${t('scan_paste_btn')}</span>
            <button type="button" id="scanner-clipboard-auto-btn" class="scanner-link-btn" style="font-size: 12.5px;">
              ${t('scan_paste_clipboard_btn')}
            </button>
          </div>
          <textarea id="scanner-text-input" class="search-input" rows="6" placeholder="${t('scan_paste_placeholder')}" style="width: 100%; height: auto; min-height: 130px; max-height: 220px; padding: 12px; font-size: 14px; font-family: inherit; resize: vertical; box-sizing: border-box; line-height: 1.45; border-radius: var(--radius-md);"></textarea>
          <div style="display: flex; gap: 10px; margin-top: 12px;">
            <button type="button" id="scanner-paste-back-btn" class="primary-button scanner-btn-rescan">
              ${t('scan_back_to_upload')}
            </button>
            <button type="button" id="scanner-paste-submit-btn" class="primary-button btn-green" style="flex: 1.5; min-height: 42px; font-size: 14px; font-weight: 700; border-radius: 10px;">
              ${t('scan_paste_submit')}
            </button>
          </div>
        </div>

        <!-- 2. Processing View -->
        <div id="scanner-processing-view" class="scanner-processing-view" style="display: none;">
          <div class="scanner-preview-container" id="scanner-preview-container">
            <img id="scanner-preview-img" class="scanner-preview-img" alt="Scanned Document" style="display: none;" />
            <div id="scanner-text-icon-preview" style="display: none; padding: 24px; font-size: 42px; text-align: center;">📄</div>
            <div class="scanner-laser-line"></div>
          </div>
          <div class="scanner-processing-status">
            <div class="scanner-spinner"></div>
            <p class="scanner-processing-text">${t('scan_processing')}</p>
          </div>
        </div>

        <!-- 3. Results View -->
        <div id="scanner-results-view" class="scanner-results-view" style="display: none;">
          <div id="scanner-snippet-box" class="scanner-snippet-box" style="display: none;">
            <div class="scanner-snippet-header">${t('scan_snippet_title')}</div>
            <p id="scanner-snippet-text" class="scanner-snippet-text"></p>
          </div>

          <div class="scanner-lemmas-header">
            <h4 id="scanner-lemmas-count" class="scanner-lemmas-title">${t('scan_new_lemmas')}</h4>
            <div class="scanner-select-actions">
              <button type="button" id="scanner-select-all-btn" class="scanner-link-btn">${t('scan_select_all')}</button>
              <span style="color: var(--text-muted); font-size: 11px;">•</span>
              <button type="button" id="scanner-deselect-all-btn" class="scanner-link-btn">${t('scan_deselect_all')}</button>
            </div>
          </div>

          <div id="scanner-lemmas-list" class="scanner-lemmas-list"></div>

          <!-- Existing Words Collapsible -->
          <div id="scanner-existing-box" class="scanner-existing-box" style="display: none;">
            <div class="scanner-existing-header" id="scanner-existing-toggle">
              <span id="scanner-existing-title">${t('scan_already_exists')} (0)</span>
              <span class="scanner-existing-arrow" id="scanner-existing-arrow">▼</span>
            </div>
            <div id="scanner-existing-list" class="scanner-existing-list" style="display: none;"></div>
          </div>

          <div class="scanner-results-footer">
            <button type="button" id="scanner-rescan-btn" class="primary-button scanner-btn-rescan">
              ${t('scan_rescan_btn')}
            </button>
            <button type="button" id="scanner-submit-btn" class="primary-button btn-green scanner-btn-save">
              ${t('scan_add_btn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  const closeBtn = modalEl.querySelector('#scanner-close-btn');
  const uploadView = modalEl.querySelector('#scanner-upload-view');
  const pasteView = modalEl.querySelector('#scanner-paste-view');
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
  const pasteSubmitBtn = modalEl.querySelector('#scanner-paste-submit-btn');

  const snippetBox = modalEl.querySelector('#scanner-snippet-box');
  const snippetText = modalEl.querySelector('#scanner-snippet-text');
  const lemmasCount = modalEl.querySelector('#scanner-lemmas-count');
  const lemmasList = modalEl.querySelector('#scanner-lemmas-list');
  const selectAllBtn = modalEl.querySelector('#scanner-select-all-btn');
  const deselectAllBtn = modalEl.querySelector('#scanner-deselect-all-btn');

  const existingBox = modalEl.querySelector('#scanner-existing-box');
  const existingToggle = modalEl.querySelector('#scanner-existing-toggle');
  const existingTitle = modalEl.querySelector('#scanner-existing-title');
  const existingArrow = modalEl.querySelector('#scanner-existing-arrow');
  const existingList = modalEl.querySelector('#scanner-existing-list');

  const rescanBtn = modalEl.querySelector('#scanner-rescan-btn');
  const submitBtn = modalEl.querySelector('#scanner-submit-btn');

  let currentNewLemmas = [];
  let selectedIndices = new Set();

  const closeModal = () => {
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

  takePhotoBtn.addEventListener('click', () => {
    hideError();
    cameraInput.value = '';
    cameraInput.click();
  });

  galleryBtn.addEventListener('click', () => {
    hideError();
    galleryInput.value = '';
    galleryInput.click();
  });

  openPasteBtn.addEventListener('click', async () => {
    hideError();
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
        showError('Буфер обмена недоступен через браузер. Вставьте текст вручную.');
      }
    } catch (e) {
      showError('Не удалось прочитать буфер обмена. Вставьте текст вручную (Ctrl+V / долгое нажатие).');
    }
  });

  pasteBackBtn.addEventListener('click', () => {
    hideError();
    pasteView.style.display = 'none';
    uploadView.style.display = 'block';
  });

  pasteSubmitBtn.addEventListener('click', async () => {
    const rawText = textInput.value.trim();
    if (!rawText || rawText.length < 2) {
      showError('Пожалуйста, введите или вставьте английский текст.');
      return;
    }

    try {
      hideError();
      pasteView.style.display = 'none';
      processingView.style.display = 'flex';
      resultsView.style.display = 'none';
      previewImg.style.display = 'none';
      textIconPreview.style.display = 'block';

      const res = await scanDocumentImage({ text: rawText });
      displayResults(res);
    } catch (err) {
      console.error('Text scan error:', err);
      pasteView.style.display = 'block';
      processingView.style.display = 'none';
      resultsView.style.display = 'none';
      showError(err.message || 'Ошибка извлечения лемм. Попробуйте снова.');
    }
  });

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
    uploadView.style.display = 'block';
    pasteView.style.display = 'none';
    processingView.style.display = 'none';
    resultsView.style.display = 'none';
    hideError();
  });

  async function handleFileSelected(file) {
    if (!file || !file.type.startsWith('image/')) {
      showError('Пожалуйста, выберите файл изображения (JPEG, PNG, WEBP).');
      return;
    }

    try {
      hideError();
      uploadView.style.display = 'none';
      pasteView.style.display = 'none';
      processingView.style.display = 'flex';
      resultsView.style.display = 'none';
      previewImg.style.display = 'block';
      textIconPreview.style.display = 'none';

      const compressed = await compressImageFile(file, 1200, 0.82);
      previewImg.src = compressed.dataUrl;

      const res = await scanDocumentImage(compressed.base64, compressed.mimeType);
      displayResults(res);
    } catch (err) {
      console.error('Scan error:', err);
      uploadView.style.display = 'block';
      pasteView.style.display = 'none';
      processingView.style.display = 'none';
      resultsView.style.display = 'none';
      showError(err.message || 'Ошибка распознавания. Проверьте фото и попробуйте снова.');
    }
  }

  function displayResults(data) {
    processingView.style.display = 'none';
    resultsView.style.display = 'block';

    const snippet = String(data.detected_text_snippet || '').trim();
    if (snippet) {
      snippetBox.style.display = 'block';
      snippetText.textContent = `«${snippet}»`;
    } else {
      snippetBox.style.display = 'none';
    }

    const allLemmas = Array.isArray(data.lemmas) ? data.lemmas : [];
    const existingWordsSet = new Set(
      words.map((w) => String(w.word || '').trim().toLowerCase())
    );

    currentNewLemmas = [];
    const existingLemmas = [];

    allLemmas.forEach((raw) => {
      const wClean = String(raw.word || '').trim().toLowerCase();
      if (!wClean) return;
      if (existingWordsSet.has(wClean)) {
        existingLemmas.push(raw);
      } else {
        if (!currentNewLemmas.some((x) => x.word.toLowerCase() === wClean)) {
          const tokens = wClean.split(/\s+/).filter(Boolean);
          let cat = String(raw.category || '').trim();

          // Auto-detect Irregular verbs (3 forms) even if flagged as Pattern
          if (tokens.length === 3 && (wClean.includes('/') || tokens.every((t) => t.length >= 2))) {
            cat = 'Irregular verbs';
          } else if (!cat) {
            cat = tokens.length >= 2 ? 'Pattern' : 'Elementary';
          }

          const rawTrans = String(raw.translation || '').trim();
          const splitParts = rawTrans
            .split(/[,;\/]+/)
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
          const uniqueVariants = [];
          splitParts.forEach((p) => {
            if (!uniqueVariants.includes(p)) uniqueVariants.push(p);
          });
          if (uniqueVariants.length === 0 && rawTrans) {
            uniqueVariants.push(rawTrans.toLowerCase());
          }

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

    selectedIndices = new Set(currentNewLemmas.map((_, i) => i));

    renderLemmasList();
    renderExistingSection(existingLemmas);
    updateSubmitButton();
  }

  function renderLemmasList() {
    lemmasCount.textContent = `${t('scan_new_lemmas')} (${currentNewLemmas.length})`;

    if (currentNewLemmas.length === 0) {
      lemmasList.innerHTML = `
        <div style="text-align: center; padding: 24px 12px; color: var(--text-muted); font-size: 14px;">
          ${t('scan_no_new_words')}
        </div>
      `;
      submitBtn.style.display = 'none';
      return;
    }

    submitBtn.style.display = 'block';
    lemmasList.innerHTML = currentNewLemmas
      .map((item, idx) => {
        const isChecked = selectedIndices.has(idx);
        const isSpecialCategory = item.category === 'Pattern' || item.category === 'Irregular verbs';
        const catClass = `cat-${item.category.toLowerCase().replace(/\s+/g, '-')}`;
        const catBadge = `<button type="button" class="scanner-lemma-cat ${catClass}" data-lemma-idx="${idx}" title="Нажмите, чтобы переключить категорию (${escapeHtml(item.category)})">${escapeHtml(item.category)} ⇄</button>`;
        const ipaText = (!isSpecialCategory && item.transcription) ? `<span class="scanner-lemma-ipa">${escapeHtml(item.transcription)}</span>` : '';
        const origSnippet = item.original && item.original.toLowerCase() !== item.word.toLowerCase()
          ? `<span style="font-size: 11px; color: var(--text-muted);"> (в тексте: «${escapeHtml(item.original)}»)</span>`
          : '';

        let transHtml = '';
        if (item.isEditingTrans) {
          transHtml = `
            <div class="scanner-trans-edit-row">
              <input type="text" class="scanner-trans-input" data-lemma-idx="${idx}" value="${escapeHtml(item.customTranslation)}" placeholder="Введите перевод через запятую..." />
              <button type="button" class="scanner-trans-done-btn" data-lemma-idx="${idx}" title="Сохранить перевод">✓</button>
            </div>
          `;
        } else {
          transHtml = `
            <div class="scanner-lemma-trans-chips">
              ${item.translationVariants.map((v, vIdx) => {
                const isVariantSelected = item.selectedVariants.has(v);
                return `
                  <button type="button" class="scanner-trans-chip ${isVariantSelected ? 'selected' : 'unselected'}" data-lemma-idx="${idx}" data-variant-idx="${vIdx}" title="Нажмите, чтобы включить/исключить вариант перевода">
                    <span class="scanner-chip-check">${isVariantSelected ? '✓' : '✕'}</span>
                    <span>${escapeHtml(v)}</span>
                  </button>
                `;
              }).join('')}
              <button type="button" class="scanner-trans-edit-btn" data-lemma-idx="${idx}" title="Редактировать перевод вручную">✏️</button>
            </div>
          `;
        }

        return `
          <div class="scanner-lemma-item ${isChecked ? 'selected' : ''}" data-idx="${idx}">
            <input type="checkbox" class="scanner-lemma-checkbox" data-idx="${idx}" ${isChecked ? 'checked' : ''} />
            <div class="scanner-lemma-content">
              <div class="scanner-lemma-head">
                <span class="scanner-lemma-word">${escapeHtml(item.word)}</span>
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
    existingTitle.textContent = `${t('scan_already_exists')} (${existingLemmas.length})`;
    existingList.innerHTML = existingLemmas
      .map((item) => `<span class="scanner-existing-chip">✔️ ${escapeHtml(item.word)}</span>`)
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

  selectAllBtn.addEventListener('click', () => {
    selectedIndices = new Set(currentNewLemmas.map((_, i) => i));
    lemmasList.querySelectorAll('.scanner-lemma-item').forEach((el) => el.classList.add('selected'));
    lemmasList.querySelectorAll('.scanner-lemma-checkbox').forEach((cb) => (cb.checked = true));
    updateSubmitButton();
  });

  deselectAllBtn.addEventListener('click', () => {
    selectedIndices.clear();
    lemmasList.querySelectorAll('.scanner-lemma-item').forEach((el) => el.classList.remove('selected'));
    lemmasList.querySelectorAll('.scanner-lemma-checkbox').forEach((cb) => (cb.checked = false));
    updateSubmitButton();
  });

  function updateSubmitButton() {
    const count = selectedIndices.size;
    submitBtn.textContent = `${t('scan_add_btn')} (${count})`;
    submitBtn.disabled = count === 0;
    submitBtn.style.opacity = count === 0 ? '0.5' : '1';
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
      submitBtn.innerHTML = '<span class="hourglass-flip">⏳</span> Добавляю в словарь...';

      const res = await batchAddCustomWords(selectedWords);
      const added = res.words || selectedWords;

      for (let i = 0; i < added.length; i++) {
        const w = added[i];
        if (w.id) {
          toggleFavoriteApi(w.id, true).catch(() => {});
        }
      }

      onWordsSaved(added);

      submitBtn.textContent = `🎉 ${t('scan_added_success')}${added.length}!`;
      setTimeout(() => {
        closeModal();
      }, 1100);
    } catch (err) {
      submitBtn.disabled = false;
      updateSubmitButton();
      showError(err.message || 'Ошибка сохранения слов');
    }
  });
}

function sanitizeCategory(cat) {
  if (!cat) return 'Elementary';
  const s = String(cat).trim();
  if (['Elementary', 'Intermediate', 'Advanced', 'Irregular verbs', 'Pattern'].includes(s)) {
    return s;
  }
  return (
    s.replace(/\s*[•\-–—]?\s*[A-C][1-2].*$/i, '').trim() || 'Elementary'
  );
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

function renderWordCardHtml(w, isFav, prog) {
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
    stageBadge = `<span class="in-progress-badge" style="background:#e0e7ff; color:#3730a3; border: 1px solid #818cf8;">✍️ Тест: ${testCount}/2</span>`;
  } else if (quizCount >= 5) {
    stageBadge = `<span class="in-progress-badge" style="background:#f3e8ff; color:#6b21a8; border: 1px solid #c084fc;">🧩 Пары: ${pairsCount}/2</span>`;
  } else if (seen) {
    stageBadge = `<span class="in-progress-badge" style="background:#fef3c7; color:#92400e; border: 1px solid #f59e0b;">🎯 Квиз: ${quizCount}/5</span>`;
  }

  return `
    <div class="dict-card ${isMastered ? 'mastered' : ''}" data-id="${w.id}">
      <div class="dict-card-header">
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span class="category-badge">${cleanCat}</span>
          ${stageBadge}
        </div>
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
        <p class="dict-translation">${escapeHtml(getWordTranslation(w))}</p>
        ${getWordNotes(w) ? `<p class="dict-notes">${escapeHtml(getWordNotes(w))}</p>` : ''}
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

  const lang = getInterfaceLanguage();
  const titleText = lang === 'ru' ? '✨ Добавить слово' : lang === 'uk' ? '✨ Додати слово' : '✨ Add word';
  const wordLabel = lang === 'ru' ? 'Английское слово (строчными)' : lang === 'uk' ? 'Англійське слово (малими літерами)' : 'English word (lowercase)';
  const transLabel = lang === 'ru' ? 'Перевод' : lang === 'uk' ? 'Переклад' : 'Translation';
  const catLabel = lang === 'ru' ? 'Категория' : lang === 'uk' ? 'Категорія' : 'Category';
  const notesLabel = lang === 'ru' ? 'Заметка / Пример (необязательно)' : lang === 'uk' ? 'Примітка / Приклад (необовʼязково)' : 'Notes / Example (optional)';
  const saveBtnText = lang === 'ru' ? 'Сохранить' : lang === 'uk' ? 'Зберегти' : 'Save';
  const cancelBtnText = lang === 'ru' ? 'Отмена' : lang === 'uk' ? 'Скасувати' : 'Cancel';
  const updateNoteText = lang === 'ru' ? 'Обновить заметку' : lang === 'uk' ? 'Оновити примітку' : 'Update note';
  const checkingBtnText = lang === 'ru' ? 'Проверяю...' : lang === 'uk' ? 'Перевіряю...' : 'Checking...';

  modalEl.innerHTML = `
    <div style="background: var(--card-bg, #1a2234); border: 1px solid var(--border-color, #2e3a52); border-radius: 16px; padding: 22px; max-width: 440px; width: 100%; box-shadow: 0 12px 36px rgba(0,0,0,0.5); box-sizing: border-box; position: relative; max-height: 90vh; overflow-y: auto; text-align: left;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: var(--text-main);">${titleText}</h3>
        <button type="button" id="add-word-close-btn" style="background: none; border: none; font-size: 22px; cursor: pointer; color: var(--text-muted); padding: 2px 6px; line-height: 1;">✕</button>
      </div>

      <form id="add-word-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div id="add-word-notice" style="display: none; padding: 10px 12px; background: rgba(217, 119, 6, 0.12); border: 1px solid #d97706; border-radius: 8px; font-size: 13px; color: var(--text-main); line-height: 1.4;"></div>
        <div id="add-word-error" style="display: none; padding: 10px 12px; background: rgba(239, 68, 68, 0.12); border: 1px solid #ef4444; border-radius: 8px; font-size: 13px; color: #ef4444; font-weight: 500;"></div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">
            <label for="add-word-input">${wordLabel} *</label>
            <span id="add-word-len" style="color: var(--text-muted); font-size: 11px;">0/35</span>
          </div>
          <input type="text" id="add-word-input" class="search-input" maxlength="35" required value="${escapeHtml(initialWord.toLowerCase())}" placeholder="например: blossom" style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 9px 12px; font-size: 15px; box-sizing: border-box;" />
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">
            <label for="add-trans-input">${transLabel} *</label>
            <span id="add-trans-len" style="color: var(--text-muted); font-size: 11px;">0/50</span>
          </div>
          <input type="text" id="add-trans-input" class="search-input" maxlength="50" required placeholder="например: цветение" style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 9px 12px; font-size: 15px; box-sizing: border-box;" />
          <div id="add-trans-suggestions" style="display: none; flex-wrap: wrap; gap: 6px; margin-top: 6px; align-items: center;">
            <span style="font-size: 11px; color: var(--text-muted);">💡 Варианты:</span>
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
            <span id="add-notes-len" style="color: var(--text-muted); font-size: 11px;">0/60</span>
          </div>
          <textarea id="add-notes-input" maxlength="60" rows="2" placeholder="Пример: cherry blossoms bloom in spring" style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; font-size: 14px; background: var(--card-bg, #1a2234); color: var(--text-main); font-family: inherit; resize: none; box-sizing: border-box;"></textarea>
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
    if (wordLen) wordLen.textContent = `${wordInput.value.length}/35`;
    if (transLen) transLen.textContent = `${transInput.value.length}/50`;
    if (notesLen) notesLen.textContent = `${notesInput.value.length}/60`;
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
        pillsBox.innerHTML = '<span style="font-size: 11.5px; color: var(--text-muted); padding: 3px 6px;">⏳ Ищу перевод...</span>';
      }
    }

    const data = await suggestTranslations(cleanWord);

    // Make sure user hasn't changed the input while fetching
    if (wordInput.value.trim().toLowerCase() !== cleanWord) {
      return;
    }

    if (data && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
      if (data.suggestions[0]) {
        transInput.placeholder = `например: ${data.suggestions[0]}`;
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

  function checkDuplicate() {
    const typed = wordInput.value.trim().toLowerCase();
    const existing = words.find((w) => w.word && w.word.trim().toLowerCase() === typed);
    if (existing) {
      noticeBox.style.display = 'block';
      noticeBox.innerHTML = `💡 Слово уже есть в словаре (перевод: <strong>«${escapeHtml(existing.translation)}»</strong>, категория: <strong>«${escapeHtml(existing.category)}»</strong>).<br>Вы можете дополнить или обновить примечание к нему.`;
      transInput.value = existing.translation || '';
      transInput.disabled = true;
      catSelect.value = existing.category || (existingCats[0] || 'Elementary');
      catSelect.disabled = true;
      if (suggestionsBox) suggestionsBox.style.display = 'none';
      submitBtn.textContent = updateNoteText;
    } else {
      noticeBox.style.display = 'none';
      transInput.disabled = false;
      catSelect.disabled = false;
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
      errorBox.textContent = '⚠️ Разрешены только строчные английские буквы (без цифр и кириллицы).';
    } else if (isClientProfane(val)) {
      errorBox.style.display = 'block';
      errorBox.textContent = '⚠️ Ненормативная лексика строго запрещена.';
    } else {
      if (errorBox.textContent.includes('буквы') || errorBox.textContent.includes('Ненормативная')) {
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
    const translation = transInput.value.trim().toLowerCase();
    const category = catSelect.value.trim();
    const notes = notesInput.value.trim();

    if (word.length < 2 || word.length > 35) {
      errorBox.style.display = 'block';
      errorBox.textContent = 'Длина английского слова должна быть от 2 до 35 символов.';
      return;
    }

    if (translation.length < 1 || translation.length > 50) {
      errorBox.style.display = 'block';
      errorBox.textContent = 'Длина перевода должна быть от 1 до 50 символов.';
      return;
    }

    if (!/^[a-z\s\-\']+$/i.test(word) || /[0-9\u0400-\u04FF]/.test(word)) {
      errorBox.style.display = 'block';
      errorBox.textContent = 'Поле английского слова должно содержать только английские буквы.';
      return;
    }

    if (!/[aeiouy]/i.test(word)) {
      errorBox.style.display = 'block';
      errorBox.textContent = '⚠️ Английское слово должно содержать хотя бы одну гласную букву (a, e, i, o, u, y).';
      return;
    }

    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(word)) {
      errorBox.style.display = 'block';
      errorBox.textContent = '⚠️ Слово похоже на случайный набор букв. Проверьте правильность написания.';
      return;
    }

    if (isClientProfane(word) || isClientProfane(translation)) {
      errorBox.style.display = 'block';
      errorBox.textContent = 'Ненормативная лексика строго запрещена.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="hourglass-flip">⏳</span> ${checkingBtnText}`;

    try {
      const res = await addCustomWord({ word, translation, category, notes });
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
      errorBox.textContent = err.message || 'Ошибка сохранения слова.';
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
  const scanBtnText = t('dict_scan_btn') || (lang === 'ru' ? '📷 Сканировать фото' : lang === 'uk' ? '📷 Сканувати фото' : '📷 Scan photo');

  container.innerHTML = `
    <div class="dictionary-page" style="width: 100%; max-width: 100%; box-sizing: border-box;">
      <div class="page-header" style="margin-bottom: 14px;">
        <h2 id="dict-header-title" style="margin: 0 0 10px; font-size: 21px;">${t('dict_title')} (<span id="dict-word-count">${formatWordCount(words.length)}</span>)</h2>
        <div class="dict-header-actions" style="display: flex; gap: 8px; width: 100%; box-sizing: border-box;">
          <button type="button" class="primary-button btn-green" id="dict-open-add-btn" style="flex: 1; min-height: 42px; font-size: 13.5px; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box; padding: 0 8px;">
            ${addWordBtnText}
          </button>
          <button type="button" class="primary-button" id="dict-open-scan-btn" style="flex: 1; min-height: 42px; font-size: 13.5px; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; border: none; box-shadow: 0 3px 10px rgba(2,132,199,0.3); padding: 0 8px;">
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
      const headerHeight = headerEl ? headerEl.offsetHeight : 56;
      dictControls.style.setProperty('--dict-sticky-top', `${Math.round(headerHeight)}px`);
    }
  };
  updateDictStickyTop();
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

    const fragmentHtml = nextBatch
      .map((w) => {
        const isFav = favSet.has(String(w.id));
        const prog = userProgress[w.id] || userProgress[String(w.id)];
        return renderWordCardHtml(w, isFav, prog);
      })
      .join('');

    grid.insertAdjacentHTML('beforeend', fragmentHtml);
    renderedCount += nextBatch.length;

    if (renderedCount < filteredWords.length) {
      if (sentinel) {
        sentinel.style.display = 'block';
        sentinel.textContent = 'Загрузка слов...';
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

    filteredWords = words.filter((w) => {
      const catClean = sanitizeCategory(w.category);
      const matchQuery =
        !query ||
        (w.word && w.word.toLowerCase().includes(query)) ||
        (w.translation && w.translation.toLowerCase().includes(query));
      const matchCat = selectedCat === 'All' || catClean === selectedCat;
      return matchQuery && matchCat;
    });

    if (wordCountEl) {
      wordCountEl.textContent = formatWordCount(filteredWords.length);
    }

    grid.innerHTML = '';
    renderedCount = 0;

    if (filteredWords.length === 0) {
      const emptyText = getInterfaceLanguage() === 'ru' ? 'Слова не найдены.' : getInterfaceLanguage() === 'uk' ? 'Слова не знайдені.' : 'No words found.';
      const quickAddText = getInterfaceLanguage() === 'ru' ? `➕ Добавить «${escapeHtml(query)}» в словарь` : getInterfaceLanguage() === 'uk' ? `➕ Додати «${escapeHtml(query)}» у словник` : `➕ Add "${escapeHtml(query)}" to dictionary`;

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
