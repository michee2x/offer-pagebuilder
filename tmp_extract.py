import re

with open(r'c:\Users\user\Downloads\heymessage.framer.ai\heymessage.framer.ai\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all url(...)
urls = re.findall(r'url\([^)]+\)', content)
print("URLs found:")
for u in set(urls):
    if 'noise' in u.lower() or 'png' in u.lower() or 'jpg' in u.lower():
        print(u)

# Find CSS variables or common colors
colors = re.findall(r'(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|hsl\([^)]+\))', content)
from collections import Counter
print("\nMost common colors:")
for color, count in Counter(colors).most_common(20):
    print(f"{color}: {count}")

# Look for font-size patterns
font_sizes = re.findall(r'font-size:\s*([^;]+);', content)
print("\nMost common font sizes:")
for fs, count in Counter(font_sizes).most_common(10):
    print(f"{fs}: {count}")

# Look for letter-spacing
letter_spacings = re.findall(r'letter-spacing:\s*([^;]+);', content)
print("\nMost common letter spacings:")
for ls, count in Counter(letter_spacings).most_common(10):
    print(f"{ls}: {count}")

# Look for line-height
line_heights = re.findall(r'line-height:\s*([^;]+);', content)
print("\nMost common line heights:")
for lh, count in Counter(line_heights).most_common(10):
    print(f"{lh}: {count}")
    
# Extract any font-family
font_families = re.findall(r'font-family:\s*([^;]+);', content)
print("\nMost common font families:")
for ff, count in Counter(font_families).most_common(5):
    print(f"{ff}: {count}")
