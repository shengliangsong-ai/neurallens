const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.git' || file === 'dist') return;
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('.');

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let changed = false;
    
    if (content.includes('@firebase/firestore') || content.includes('firebase/firestore') || content.includes('@firebase/storage') || content.includes('@firebase/auth') || content.includes('@firebase/app')) {
        content = content.replace(/['"]@firebase\/firestore['"]/g, "'/services/localFirestoreAdapter'");
        content = content.replace(/['"]firebase\/firestore['"]/g, "'/services/localFirestoreAdapter'");
        // storage fallback
        content = content.replace(/['"]@firebase\/storage['"]/g, "'/services/mockStorage'");
        content = content.replace(/['"]@firebase\/auth['"]/g, "'/services/mockAuth'");
        content = content.replace(/['"]@firebase\/app['"]/g, "'/services/mockApp'");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(f, content);
    }
});

