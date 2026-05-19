const fs = require('fs');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.git' || file === 'dist') return;
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./components');

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes('Lock')) {
        content = content.replace(/<Lock([^>]*)>/g, '<EyeOff$1>');
        content = content.replace(/Lock,/g, 'EyeOff,');
        content = content.replace(/Lock /g, 'EyeOff ');
        fs.writeFileSync(f, content);
    }
});
