import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.worker.min.mjs';

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.4;
const ZOOM_STEP = 0.2;

async function createViewer(viewer) {
  const pages = viewer.querySelector('.pdf-pages');
  const zoomLabel = viewer.querySelector('.zoom-level');
  let zoom = 1;

  const updateZoom = async (nextZoom) => {
    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    zoomLabel.textContent = `${Math.round(zoom * 100)} %`;
    pages.querySelectorAll('.pdf-page').forEach((page) => {
      page.style.setProperty('--page-zoom', zoom);
    });
  };

  viewer.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'zoom-in') updateZoom(zoom + ZOOM_STEP);
      if (action === 'zoom-out') updateZoom(zoom - ZOOM_STEP);
      if (action === 'zoom-reset') updateZoom(1);
    });
  });

  try {
    const pdf = await pdfjsLib.getDocument(viewer.dataset.pdf).promise;
    pages.replaceChildren();

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const pageElement = document.createElement('article');
      pageElement.className = 'pdf-page';
      pageElement.style.setProperty('--page-width', `${baseViewport.width}px`);
      pageElement.style.setProperty('--page-height', `${baseViewport.height}px`);
      pageElement.style.setProperty('--page-zoom', zoom);
      pageElement.setAttribute('aria-label', `Strana ${pageNumber} z ${pdf.numPages}`);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { alpha: false });
      const outputScale = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: 1.25 });
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      pageElement.append(canvas);
      pages.append(pageElement);

      await page.render({
        canvasContext: context,
        viewport,
        transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
      }).promise;
    }
  } catch (error) {
    pages.innerHTML = '<p class="viewer-status viewer-error">Menu sa nepodarilo načítať. Skúste stránku obnoviť.</p>';
    console.error('PDF viewer error:', error);
  }
}

document.querySelectorAll('.pdf-viewer').forEach(createViewer);
