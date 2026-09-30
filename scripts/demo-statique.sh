#!/usr/bin/env bash
# Génère une démo statique du site (dossier `demo-statique/`) pour GitHub Pages.
# Le vrai site tourne sur Cloudflare (D1, formulaires, admin) : ici on lance le
# Worker en local avec la base de démonstration, on aspire les pages publiques,
# puis on désactive les formulaires, qui n'ont pas de serveur sur GitHub Pages.
set -euo pipefail

SORTIE="${1:-demo-statique}"
PORT=8787

cp .dev.vars.example .dev.vars
rm -rf .wrangler/state "$SORTIE"
npx wrangler d1 migrations apply ganzeville --local
npx astro build

npx wrangler dev --port "$PORT" --ip 127.0.0.1 > wrangler-demo.log 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
for _ in $(seq 1 60); do
  curl -sf -o /dev/null "http://127.0.0.1:$PORT/" && break
  sleep 1
done

mkdir -p "$SORTIE"
( cd "$SORTIE" && wget -q --mirror --convert-links --adjust-extension --page-requisites \
    --no-host-directories -e robots=off "http://127.0.0.1:$PORT/" ) || true
test -f "$SORTIE/index.html"

# Formulaires désactivés, script Turnstile retiré, avertissement au clic sur « Envoyer ».
AVERTISSEMENT='<script>document.addEventListener("submit",function(e){if(e.target.matches("form[data-demo]")){e.preventDefault();alert(document.documentElement.lang==="en"?"Static demo: forms are disabled here. They work on the real site.":"Démo statique : les formulaires sont désactivés ici. Ils fonctionnent sur le vrai site.");}});</script></body>'
find "$SORTIE" -name '*.html' -print0 | xargs -0 sed -i \
  -e 's#<form method="post" action="[^"]*api/demande">#<form method="post" action="\#" data-demo>#' \
  -e 's#<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>##' \
  -e "s#</body>#${AVERTISSEMENT}#"
touch "$SORTIE/.nojekyll"
echo "Démo statique générée dans $SORTIE/ ($(find "$SORTIE" -name '*.html' | wc -l) pages)."
