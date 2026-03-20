import fs from 'fs';
import path from 'path';

const walk = (dir) => {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        if (!fullPath.includes('node_modules') && !fullPath.includes('dist') && !fullPath.includes('.git')) {
          results = results.concat(walk(fullPath));
        }
      } else {
        if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js') || fullPath.endsWith('.json')) {
          results.push(fullPath);
        }
      }
    });
  } catch (e) {
    console.error(`Error walking ${dir}: ${e.message}`);
  }
  return results;
};

const files = walk('frontend');
files.forEach((file) => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('http://localhost:5000')) {
      console.log(`Updating ${file}`);
      const newContent = content.split('http://localhost:5000').join('https://quickeatsbackend.onrender.com');
      fs.writeFileSync(file, newContent, 'utf8');
    }
  } catch (e) {
    console.error(`Error processing ${file}: ${e.message}`);
  }
});
console.log('Done!');
