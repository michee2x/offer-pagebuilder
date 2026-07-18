import re

with open('src/app/welcome.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace :root with .welcome-page to scope variables
css = css.replace(':root{', '.welcome-page {')
css = css.replace(':root {', '.welcome-page {')

# Scope global resets
css = css.replace('*{', '.welcome-page *{')
css = css.replace('a{', '.welcome-page a{')
css = css.replace('button{', '.welcome-page button{')
css = css.replace('img{', '.welcome-page img{')
css = css.replace('ul{', '.welcome-page ul{')
css = css.replace('::selection{', '.welcome-page ::selection{')
css = css.replace(':focus-visible{', '.welcome-page *:focus-visible{')
css = css.replace('::-webkit-scrollbar', '.welcome-page ::-webkit-scrollbar')

# Scope headings
css = css.replace('h1,h2,h3,h4{', '.welcome-page h1, .welcome-page h2, .welcome-page h3, .welcome-page h4 {')

with open('src/app/welcome.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('Scoped welcome.css successfully')
