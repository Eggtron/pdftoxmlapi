# Verwende Node.js als Basisimage
FROM node:18

# Setze das Arbeitsverzeichnis im Container auf /app
WORKDIR /app

# Kopiere package.json und package-lock.json, um die Abhängigkeiten zu installieren
COPY app/package*.json ./

# Installiere die Abhängigkeiten
RUN npm install

# Kopiere den Rest des Projekts in das Arbeitsverzeichnis /app
COPY app/ .

# Setze die Umgebungsvariable für den Port, den Node.js nutzen soll
ENV PORT=3000

# Stelle den Port 3000 bereit
EXPOSE 3000

# Startbefehl für die Anwendung
CMD ["node", "main.js"]
