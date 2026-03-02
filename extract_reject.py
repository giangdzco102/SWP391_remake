import re

filepath = r"e:\SP26\SWP391\frontend-fdm-v2\src\components\remixed-7e0c6b99.bak"
with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

m = re.search(r"function RejectModal.*?\{.*?\n\}", text, re.DOTALL)
if m:
    # find the matching closing brace
    content = m.group(0)
    count = 0
    start_index = text.find(content)
    actual_content = ""
    for i in range(start_index, len(text)):
        actual_content += text[i]
        if text[i] == '{':
            count += 1
        elif text[i] == '}':
            count -= 1
            if count == 0:
                break
    print(actual_content)
else:
    print("Not found")
