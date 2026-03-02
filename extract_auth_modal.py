import re

with open(r'e:\SP26\SWP391\frontend-fdm-v2\src\components\remixed-7e0c6b99.bak', 'rt', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'(function AuthModal.*?)\n// ═+', text, flags=re.DOTALL)
if m:
    with open(r'e:\SP26\SWP391\frontend-fdm-v2\src\components\modals\AuthModal.tsx', 'wt', encoding='utf-8') as out:
        out.write('''import React, { useState } from "react";
import { Ico } from "../Icons";

''')
        content = m.group(1)
        content = content.replace('function AuthModal', 'export function AuthModal')
        out.write(content)
    print('Restored successfully')
else:
    print('Not found')
