/**
 * exportResumePDF
 * Finds the `.print-resume` element in the DOM, clones its HTML,
 * injects it into a new isolated window with all page stylesheets,
 * and calls window.print() so only the resume is exported correctly.
 */
export function exportResumePDF() {
  const resumeNode = document.querySelector('.print-resume');
  if (!resumeNode) {
    console.warn('exportResumePDF: .print-resume element not found');
    return;
  }

  // Clone the resume and reset zoom transform + layout overrides
  const cloned = resumeNode.cloneNode(true);
  cloned.style.transform = 'none';
  cloned.style.width = '100%';
  cloned.style.maxWidth = '210mm';
  cloned.style.margin = '0 auto';
  cloned.style.boxShadow = 'none';
  cloned.style.border = 'none';
  cloned.style.borderRadius = '0';
  cloned.style.minHeight = 'auto';

  // Pull all stylesheets from the host page
  const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map(l => `<link rel="stylesheet" href="${l.href}">`)
    .join('\n');

  // Pull all injected <style> blocks (Tailwind JIT, etc.)
  const inlineStyles = Array.from(document.querySelectorAll('style'))
    .map(s => `<style>${s.textContent}</style>`)
    .join('\n');

  const printWindow = window.open('', '_blank', 'width=900,height=1200');
  if (!printWindow) {
    alert('Please allow popups to export the PDF.');
    return;
  }

  // Build the isolated print document, inject resume HTML immediately
  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Resume Export</title>
  ${styleLinks}
  ${inlineStyles}
  <style>
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: white;
    }
    #resume-root {
      width: 210mm;
      margin: 0 auto;
    }
    /* Restore flex/grid inside resume columns */
    #resume-root .grid { display: grid !important; }
    #resume-root .flex { display: flex !important; }
    @page { size: A4 portrait; margin: 0; }
  </style>
</head>
<body>
  <div id="resume-root">${cloned.outerHTML}</div>
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.print(); }, 500);
    });
  <\/script>
</body>
</html>`);

  printWindow.document.close();
}
