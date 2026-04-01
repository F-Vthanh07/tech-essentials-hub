import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targets = [
  'src/components/staff',
  'src/pages/staff'
];

targets.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace Admin with Staff in component names, exports, imports
    content = content.replace(/Admin([A-Z][a-zA-Z0-9]*)/g, 'Staff$1');
    content = content.replace(/AdminPanel/g, 'StaffPanel');
    content = content.replace(/\/admin/g, '/staff');
    content = content.replace(/'admin'/g, "'staff'");
    content = content.replace(/"admin"/g, '"staff"');
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  });
});
