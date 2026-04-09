const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
            callback(path.join(dir, f));
        }
    });
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // 1. Remove borders like the previous prompt thing (match tmp_refactor.js patterns + custom Hex patterns)
    content = content.replace(/\bborder-(?:t|b|l|r|x|y)(?:\s+border-[a-z0-9#-]+(?:\/[0-9]+)?)?\b/g, '');
    content = content.replace(/\bborder\s+border-[a-z0-9#-]+(?:\/[0-9]+)?\b/g, '');
    content = content.replace(/\bring-1\s+ring-[a-z0-9#-]+(?:\/[0-9]+)?\b/g, '');

    // 2. Map surface colors
    content = content.replace(/\bbg-slate-50\b/g, 'bg-surface');
    content = content.replace(/\bbg-white\b/g, 'bg-surface-low');
    content = content.replace(/\bbg-slate-100\b/g, 'bg-surface-highest');
    
    // 3. Translate the Custom hex colors to standard Tailwind "slate"/"blue"/"surface" variants
    content = content.replace(/#191b23/gi, 'slate-900');
    content = content.replace(/#424754/gi, 'slate-500');
    content = content.replace(/#0058be/gi, 'blue-600');
    content = content.replace(/#f2f3fd/gi, 'surface-highest');
    content = content.replace(/#f9f9ff/gi, 'surface');
    content = content.replace(/#2170e4/gi, 'blue-500');
    
    // 4. Update the layout aesthetics (Sidebar and TopNav specifically) to match calendar glassmorphism look
    content = content.replace(/bg-surface-low backdrop-blur-3xl/g, 'bg-surface-low/60 backdrop-blur-xl');
    content = content.replace(/bg-surface-low\/60 backdrop-blur-3xl/g, 'bg-surface-low/60 backdrop-blur-xl');
    content = content.replace(/shadow-\[40px_0_80px_rgba\(25,27,35,0\.02\)\]/g, 'shadow-[4px_0_24px_rgba(0,0,0,0.02)]');

    // 5. Add font-heading to h1, h2, h3 and other large text
    content = content.replace(/className="([^"]*text-5xl[^"]*)"/g, 'className="$1 font-heading"');
    content = content.replace(/className="([^"]*text-4xl[^"]*)"/g, 'className="$1 font-heading"');
    content = content.replace(/className="([^"]*text-3xl[^"]*)"/g, 'className="$1 font-heading"');
    content = content.replace(/className="([^"]*text-2xl[^"]*)"/g, 'className="$1 font-heading"');
    content = content.replace(/className="([^"]*text-xl[^"]*)"/g, 'className="$1 font-heading"');
    content = content.replace(/className="([^"]*text-lg[^"]*)"/g, 'className="$1 font-heading"');

    // Remove duplicates
    content = content.replace(/font-heading font-heading/g, 'font-heading');
    
    // Clean up empty spaces in className
    content = content.replace(/\s{2,}/g, ' ');
    content = content.replace(/\s+"/g, '"');
    content = content.replace(/"\s+/g, '"');
    
    // Some manual fixes specific to Sidebar.tsx
    content = content.replace(/bg-linear-to-br from-\[slate-900\] to-\[blue-500\]/g, 'bg-blue-600'); 
    content = content.replace(/bg-linear-to-br from-\[blue-600\] to-\[blue-500\]/g, 'bg-blue-600'); 
    
    // Specific fix: text-[slate-900] to text-slate-900
    content = content.replace(/text-\[slate-900\]/g, 'text-slate-900');
    content = content.replace(/text-\[slate-500\]/g, 'text-slate-500');
    content = content.replace(/text-\[blue-600\]/g, 'text-blue-600');
    content = content.replace(/bg-\[surface-highest\]/g, 'bg-surface-highest');
    content = content.replace(/bg-\[blue-600\]/g, 'bg-blue-600');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Processed', filePath);
    }
}

// Process dashboard and components
walkDir(path.join(__dirname, '../app/dashboard'), processFile);
walkDir(path.join(__dirname, '../components'), processFile);
