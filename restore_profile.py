import re

def extract_content(text, name):
    # Find the start line
    start_pattern = r'function\s+' + name
    matches = list(re.finditer(start_pattern, text))
    if not matches:
        print(f"No matches for {name}")
        return None
    
    start_index = matches[0].start()
    
    # Find the first '{' that represents the start of the function body (after ')')
    # We need to skip the parameter braces.
    
    # Find the first '('
    first_paren = text.find('(', start_index)
    if first_paren == -1: return None
    
    # Match the closing paren of parameters
    count = 1
    i = first_paren + 1
    while count > 0 and i < len(text):
        if text[i] == '(': count += 1
        elif text[i] == ')': count -= 1
        i += 1
        
    # Now find the first '{' after the parameters
    body_start = text.find('{', i)
    if body_start == -1: return None
    
    # Now correctly count braces for the body
    count = 1
    content = text[start_index : body_start + 1]
    for j in range(body_start + 1, len(text)):
        char = text[j]
        content += char
        if char == '{': count += 1
        elif char == '}': count -= 1
        
        if count == 0:
            break
            
    return content

bak_path = r'e:\SP26\SWP391\frontend-fdm-v2\src\components\remixed-7e0c6b99.bak'
target_path = r'e:\SP26\SWP391\frontend-fdm-v2\src\components\pages\ProfilePage.tsx'

with open(bak_path, 'r', encoding='utf-8') as f:
    bak_text = f.read()

avatar_modal = extract_content(bak_text, 'AvatarCropModal')
profile_page = extract_content(bak_text, 'ProfilePage')

if avatar_modal and profile_page:
    with open(target_path, 'w', encoding='utf-8') as f:
        f.write("import { StoryCard } from './StoryCard';\n")
        f.write("import React, { useState, useEffect, useRef, useCallback } from 'react';\n")
        f.write("import { Ico } from '../Icons';\n")
        f.write("import { StarRating, AvatarComp, Toast } from '../ui';\n\n")
        
        # Export them
        avatar_modal_final = avatar_modal.replace('function AvatarCropModal', 'export function AvatarCropModal')
        profile_page_final = profile_page.replace('function ProfilePage', 'export function ProfilePage')
        
        # Scale fix
        avatar_modal_final = avatar_modal_final.replace(
            'style={{ "--val": `${((scale - 0.5) / 2.5) * 100}%` }}',
            'style={{ "--val": `${((scale - 0.5) / 2.5) * 100}%` } as React.CSSProperties}'
        )
        
        f.write(avatar_modal_final + "\n\n")
        f.write(profile_page_final)
    print("Successfully restored ProfilePage.tsx")
else:
    print(f"Failed to extract: AvatarModal: {bool(avatar_modal)}, ProfilePage: {bool(profile_page)}")
