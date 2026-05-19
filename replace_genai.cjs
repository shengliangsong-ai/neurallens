const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  if (dir.includes('node_modules') || dir.includes('dist')) return files;
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = dir + '/' + file;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (name.endsWith('.ts') || name.endsWith('.tsx')) {
        files.push(name);
      }
    }
  }
  return files;
}

const files = getFiles('.');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('process.env.API_KEY')) {
    content = content.replace(/process\.env\.API_KEY/g, 'getAIKey()');
    changed = true;
  }

  // Also replace import
  if (changed) {
    const depth = file.split('/').length - 1 - 1; // '.' is the first part 
    const relative = depth === 0 ? './' : '../'.repeat(depth);
    if (!content.includes('getAIKey')) {
      content = `import { getAIKey } from '${relative}utils/aiConfig';\n` + content;
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
