const fs = require('fs');
const path = require('path');

// Files to update
const filesToUpdate = [
  '/workspaces/Pengadepan/inter-media-app/src/app/admin/products/page.tsx',
  '/workspaces/Pengadepan/inter-media-app/src/app/products/page.tsx',
  '/workspaces/Pengadepan/inter-media-app/src/app/products/[slug]/page.tsx',
  '/workspaces/Pengadepan/inter-media-app/src/app/checkout/page.tsx',
  '/workspaces/Pengadepan/inter-media-app/src/app/kasir/pos/page.tsx',
  '/workspaces/Pengadepan/inter-media-app/src/app/service/request/page.tsx',
  '/workspaces/Pengadepan/inter-media-app/src/app/admin/users/UsersClient.tsx',
  '/workspaces/Pengadepan/inter-media-app/src/app/admin/orders/OrdersClient.tsx',
  '/workspaces/Pengadepan/inter-media-app/src/app/admin/services/page.tsx'
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add toast import if not present
    if (!content.includes("import { toast } from 'sonner'")) {
      // Find the last import statement
      const importRegex = /import.*from.*['"];/g;
      const imports = content.match(importRegex);
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertIndex = lastImportIndex + lastImport.length;
        content = content.slice(0, insertIndex) + "\nimport { toast } from 'sonner';" + content.slice(insertIndex);
      }
    }
    
    // Replace alert patterns
    const replacements = [
      // Success messages
      { pattern: /alert\('([^']*berhasil[^']*)'\);/g, replacement: "toast.success('$1');" },
      { pattern: /alert\(`([^`]*berhasil[^`]*)`\);/g, replacement: "toast.success(`$1`);" },
      
      // Error messages
      { pattern: /alert\('([^']*[Gg]agal[^']*)'\);/g, replacement: "toast.error('$1');" },
      { pattern: /alert\(`([^`]*[Gg]agal[^`]*)`\);/g, replacement: "toast.error(`$1`);" },
      { pattern: /alert\('([^']*[Ee]rror[^']*)'\);/g, replacement: "toast.error('$1');" },
      { pattern: /alert\(`([^`]*[Ee]rror[^`]*)`\);/g, replacement: "toast.error(`$1`);" },
      { pattern: /alert\('([^']*kesalahan[^']*)'\);/g, replacement: "toast.error('$1');" },
      { pattern: /alert\(`([^`]*kesalahan[^`]*)`\);/g, replacement: "toast.error(`$1`);" },
      
      // Info messages
      { pattern: /alert\('([^']*login[^']*)'\);/g, replacement: "toast.info('$1');" },
      { pattern: /alert\('([^']*wajib[^']*)'\);/g, replacement: "toast.warning('$1');" },
      { pattern: /alert\('([^']*maksimal[^']*)'\);/g, replacement: "toast.warning('$1');" },
      
      // Generic alerts
      { pattern: /alert\('([^']*)'\);/g, replacement: "toast('$1');" },
      { pattern: /alert\(`([^`]*)`\);/g, replacement: "toast(`$1`);" }
    ];
    
    let updated = false;
    replacements.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        updated = true;
      }
    });
    
    // Replace confirm dialogs with toast confirmations
    const confirmPattern = /if\s*\(\s*confirm\s*\(\s*['"`]([^'"`]*?)['"`]\s*\)\s*\)\s*\{([^}]*)\}/g;
    content = content.replace(confirmPattern, (match, message, action) => {
      return `toast('${message}', {
      action: {
        label: 'Ya',
        onClick: () => {${action}}
      },
      cancel: {
        label: 'Batal',
        onClick: () => {}
      }
    });`;
    });
    
    if (updated || confirmPattern.test(content)) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔄 Converting alerts to toast notifications...');

let updatedCount = 0;
filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    if (updateFile(filePath)) {
      updatedCount++;
    }
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log(`\n✅ Updated ${updatedCount} files`);
console.log('🎉 All alerts converted to modern toast notifications!');
