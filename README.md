# NextMove Application

## Voraussetzungen

Bevor Sie beginnen, stellen Sie sicher, dass folgende Software installiert ist:

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Installation und Start

Folgen Sie diesen Schritten, um die Anwendung lokal zum Laufen zu bringen:

1. Repository klonen:
   ```bash
   git clone [REPOSITORY_URL]
   cd nextmove-docker
   ```

2. Docker Desktop starten:
   - Öffnen Sie Docker Desktop
   - Warten Sie, bis Docker Desktop vollständig gestartet ist

3. Anwendung starten:
   ```bash
   docker-compose up --build
   ```

4. Zugriff auf die Anwendung:
   - Öffnen Sie Ihren Browser
   - Navigieren Sie zu: http://localhost

## Wichtige Befehle

- Anwendung starten: `docker-compose up`
- Anwendung im Hintergrund starten: `docker-compose up -d`
- Anwendung stoppen: `docker-compose down`
- Logs anzeigen: `docker-compose logs -f`
- Container neustarten: `docker-compose restart`

## Fehlerbehebung

Falls Probleme auftreten:

1. Stellen Sie sicher, dass Docker Desktop läuft
2. Stoppen Sie die Container: `docker-compose down`
3. Löschen Sie die Docker-Images: `docker-compose down --rmi all`
4. Starten Sie die Anwendung neu: `docker-compose up --build`

## Umgebungsvariablen

Die notwendigen Umgebungsvariablen sind bereits in der `docker-compose.yml` konfiguriert. Sie müssen keine zusätzlichen Einstellungen vornehmen.
