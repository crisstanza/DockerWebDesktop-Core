#!/bin/bash
clear

cd "$(dirname "$0")"

curl https://raw.githubusercontent.com/crisstanza/autos/master/js/lib/io.github.crisstanza.Autos.js -o ../html/js/lib/io.github.crisstanza.Autos.js
curl https://raw.githubusercontent.com/crisstanza/Sync-A-Mov/main/js/io.github.crisstanza.Creator.js -o ../html/js/lib/io.github.crisstanza.Creator.js
