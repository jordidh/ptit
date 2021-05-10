# Partim de la imatge codebiting/ubuntu-base que conté: 
# ubuntu 20.04 + nodejs 14.2 + npm 6.14.4 + express 4.16.1 + git 2.25.1
# Si la imatge no està baixada es baixa automàticament
FROM codebiting/ubuntu-base:v1
# Indiquem el creador
LABEL maintainer="Codebiting - JDH"
# Instal·lem depencencies
RUN apt-get update && apt-get install -y \
    curl
# Si el nostre servei pot funcionar sense privilegis de root, creem un nou usuari
#RUN groupadd -r onion && useradd --no-log-init -r -g onion onion.
RUN useradd -ms /bin/bash onion
# Creem les carpetes amb l'usuari onion
RUN mkdir -p /home/onion/app && chown -R onion:onion /home/onion/app
# Establim el directori de treball
WORKDIR /home/onion/app
# Copiem el projecte a dins del contenidor
COPY --chown=onion:onion ./ptit .
# Change current user to node
USER onion
# Instal·lem les depencencies del projecte. 
# Si les instal·lem en entorn de producció fem: npmci --only=production
RUN npm install
# Exposem el port de l'aplicacio
EXPOSE 3000
# Definim el check per verificar que l'aplicació no estàpenjada
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
            CMD curl --fail http://localhost:3000 || exit 1
# Definim la comanda per executar l'aplicacio. Fallarà fins que no s'hi afegeixi el volum amb la configuracio
CMD ["node", "bin/www"]
