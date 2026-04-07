const fs = require('fs');

let content = fs.readFileSync('apps/web/app/page.tsx', 'utf-8');

// 1. Remove borders
content = content.replace(/\bborder-(?:t|b|l|r|x|y)(?:\s+border-[a-z]+-[0-9]+(?:\/[0-9]+)?)?\b/g, '');
content = content.replace(/\bborder\s+border-[a-z]+-[0-9]+(?:\/[0-9]+)?\b/g, '');
content = content.replace(/\bring-1\s+ring-[a-z]+-[0-9]+(?:\/[0-9]+)?\b/g, '');

// Clean up any double spaces left behind
content = content.replace(/\s{2,}/g, ' ');
content = content.replace(/\s+"/g, '"');
content = content.replace(/"\s+/g, '"');

// 2. Map surface colors
content = content.replace(/\bbg-slate-50\b/g, 'bg-surface');
content = content.replace(/\bbg-white\b/g, 'bg-surface-low');
content = content.replace(/\bbg-slate-100\b/g, 'bg-surface-highest');

// 3. Add font-heading to h1, h2, h3 and other large text
content = content.replace(/className="([^"]*text-5xl[^"]*)"/g, 'className="$1 font-heading"');
content = content.replace(/className="([^"]*text-4xl[^"]*)"/g, 'className="$1 font-heading"');
content = content.replace(/className="([^"]*text-3xl[^"]*)"/g, 'className="$1 font-heading"');
content = content.replace(/className="([^"]*text-2xl[^"]*)"/g, 'className="$1 font-heading"');

// Fix any potential errors with adding font-heading twice
content = content.replace(/font-heading font-heading/g, 'font-heading');

fs.writeFileSync('apps/web/app/page.tsx', content);
console.log('Done replacing page.tsx');
