import re

path = 'src/hooks/useData.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'import { toast }' not in content:
    content = re.sub(
        r"import \{([^}]+)\} from 'react';", 
        r"import {\1} from 'react';\nimport { toast } from 'sonner';", 
        content, 
        count=1
    )

# Match: .catch(err => console.error('Failed to X:', err))
# Replace with: .catch(err => { console.error('Failed to X:', err); toast.error('Failed to X'); })
pattern = re.compile(r"\.catch\((.*?)\s*=>\s*console\.error\(['\"]([^'\"]+)['\"],\s*([^)]*)\)\)")

def replacer(match):
    err_param = match.group(1).strip()
    msg = match.group(2)
    err_var = match.group(3)
    return f".catch({err_param} => {{ console.error('{msg}', {err_var}); toast.error('{msg.replace(':', '')}'); }})"

new_content = pattern.sub(replacer, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Successfully injected toasts into useData.ts')
