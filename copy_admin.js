import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targets = [
  'src/components',
  'src/pages'
];

targets.forEach(dir => {
  const staffDir = path.join(__dirname, dir, 'staff');
  const adminDir = path.join(__dirname, dir, 'admin');
  
  if (!fs.existsSync(adminDir)) {
    fs.mkdirSync(adminDir, { recursive: true });
  }

  const filesToCopy = dir === 'src/components' 
    ? ['StaffLayout.tsx', 'StaffSidebar.tsx']
    : ['StaffDashboard.tsx', 'StaffProducts.tsx', 'StaffOrders.tsx', 'StaffReports.tsx'];
  
  filesToCopy.forEach(file => {
    const srcPath = path.join(staffDir, file);
    if (!fs.existsSync(srcPath)) return;
    
    let content = fs.readFileSync(srcPath, 'utf-8');
    
    // Replace Staff with Admin
    content = content.replace(/Staff([A-Z][a-zA-Z0-9]*)/g, 'Admin$1');
    content = content.replace(/StaffPanel/g, 'AdminPanel');
    content = content.replace(/\/staff/g, '/admin');
    content = content.replace(/'staff'/g, "'admin'");
    content = content.replace(/"staff"/g, '"admin"');
    
    // For Sidebar, only keep specific items for Admin
    if (file === 'StaffSidebar.tsx') {
        const adminDestFile = file.replace('Staff', 'Admin');
        // Let's not auto-edit the complex sidebar here, we will edit it via multi_replace later
    }

    const destFile = file.replace('Staff', 'Admin');
    const destPath = path.join(adminDir, destFile);
    fs.writeFileSync(destPath, content, 'utf-8');
    console.log(`Created ${destPath}`);
  });
});
