const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('dist') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
};

const files = walk('frontend');
files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('http://localhost:5000')) {
    console.log(`Updating ${file}`);
    const newContent = content.replace(/http:\/\/localhost:5000/g, 'https://quickeatsbackend.onrender.com');
    fs.writeFileSync(file, newContent, 'utf8');
  }
});
console.log('Done!');
