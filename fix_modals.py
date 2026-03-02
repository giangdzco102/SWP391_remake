import os

filepath = r"e:\SP26\SWP391\frontend-fdm-v2\src\components\modals\SettingsModal.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

bad_modal_overlay = 'fixed inset-0 z-[1000] flex items-center justify-center bg-[#1c1512]/55 p-4 backdrop-blur-sm'
bad_modal = 'w-full max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[16px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] animate-[popIn_0.25s_ease]'

text = text.replace(bad_modal_overlay, 'modal-overlay')
text = text.replace(bad_modal, 'modal')

with open(filepath, "w", encoding="utf-8") as f:
    f.write(text)
print("done")
