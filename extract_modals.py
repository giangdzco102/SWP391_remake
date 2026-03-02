import re

with open(r'e:\SP26\SWP391\frontend-fdm-v2\src\components\remixed-7e0c6b99.bak', 'rt', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'(function SettingsModal.*?)\n// ═+', text, flags=re.DOTALL)
if m:
    with open(r'e:\SP26\SWP391\frontend-fdm-v2\src\components\modals\SettingsModal.tsx', 'wt', encoding='utf-8') as out:
        out.write('''import React, { useState } from "react";
import { Ico } from "../Icons";
import { GENRES } from "../../utils/mockData";

''')
        content = m.group(1)
        content = content.replace('function SettingsModal', 'export function SettingsModal')
        content = content.replace('function BecomeAuthorModal', 'export function BecomeAuthorModal')
        content = content.replace('function BecomeReviewerModal', 'export function BecomeReviewerModal')
        content = content.replace('function BecomeEditorModal', 'export function BecomeEditorModal')
        out.write(content)
    print('Restored successfully')
else:
    print('Not found')
