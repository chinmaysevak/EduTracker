const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'hooks', 'useData.ts');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { toast }')) {
    content = content.replace(/import \{.*?\} from 'react';/, "import { useState, useEffect, useRef, useCallback } from 'react';\nimport { toast } from 'sonner';");
}

// Regex to match .catch(err => console.error('Failed to do X:', err))
const regex = /\.catch\(([^=]+)=>\s*console\.error\((['"`])(Failed[^'"`]+)\2,\s*[^)]+\)\)/g;

content = content.replace(regex, (match, errParam, quote, message) => {
    return `.catch(${errParam.trim()} => { console.error('${message}:', ${errParam.trim().replace(/\s*:\s*any/, '')}); toast.error('${message}'); })`;
});

// There is one in useData.ts Line 801: catch(err => console.error('Failed to toggle unit:', err))
fs.writeFileSync(file, content);
console.log('useData.ts updated with toasts.');
