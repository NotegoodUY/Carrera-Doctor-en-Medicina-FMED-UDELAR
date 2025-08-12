#!/bin/bash

# Basado en:
# https://unix.stackexchange.com/questions/249701/how-to-minify-javascript-and-css-with-command-line-using-minify-tool
# Minificación de archivos JS

./scripts/minify_dev.sh
npx terser js/init.js -c -m -o js/init.js
find js/ -regex '.*[^(?:min[0-9+)|(init)]\.js' \
  -delete

# Minificación de archivos CSS
find css/ -type f \
    -name "*.css" ! -name "*.min.*" \
    -exec echo {} \; \
    -exec npx csso --input {} --output {}.min \; \
    -exec rm {} \; \
    -exec mv -f {}.min {} \;

# Crear archivo con la fecha de última actualización
date +"%s000" | tee date.txt

# Mover los assets a la carpeta raíz
cp ./assets/* ./
