const fs = require('fs');
const path = require('path');

const files = [
  'app/adminDashboard/page.tsx',
  'app/reviewerDashboard/page.tsx',
  'app/editorDashboard/page.tsx',
  'app/myStoriesPage/page.tsx'
].map(f => path.join(__dirname, f));

// Wattpad Primary Colors
const PRIMARY = '#ff500a';
const LIGHT = '#fff0ea';
const BORDER = '#ffdacc';
const DARK = '#e64a19';
const GRADIENT = 'linear-gradient(135deg, #ff7043 0%, #ff500a 60%, #e64a19 100%)';

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace gradients in headers
  content = content.replace(/linear-gradient\([^)]+\)/g, GRADIENT);

  // Replace old main colors (reds, blues, greens, purples) with Wattpad orange
  // Admin: purples & indigos
  content = content.replace(/#7c3aed/gi, PRIMARY);
  content = content.replace(/#312e81/gi, DARK);
  content = content.replace(/#4c1d95/gi, DARK);
  content = content.replace(/#ede9fe/gi, LIGHT);

  // Reviewer: indigos & blues
  content = content.replace(/#3730a3/gi, PRIMARY);
  content = content.replace(/#4f46e5/gi, PRIMARY);

  // Editor: greens
  content = content.replace(/#1d6b3a/gi, PRIMARY);
  content = content.replace(/#166534/gi, DARK);
  content = content.replace(/#047857/gi, PRIMARY);
  content = content.replace(/#059669/gi, PRIMARY);
  content = content.replace(/#064e3b/gi, DARK);
  content = content.replace(/#f0fdf4/gi, LIGHT);
  content = content.replace(/#86efac/gi, BORDER);

  // Author: reds
  content = content.replace(/#c23d3f/gi, PRIMARY);
  content = content.replace(/#e85555/gi, PRIMARY);
  content = content.replace(/#7c1d1d/gi, DARK);
  content = content.replace(/#fde8e8/gi, LIGHT);
  content = content.replace(/#e8a0a1/gi, BORDER);

  fs.writeFileSync(file, content);
  console.log('Refactored UI for:', file);
});
