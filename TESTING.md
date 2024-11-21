# Testing the stack

## Launch Compose environment

```bash
docker compose -p srt-8192-dev -f docker-compose.yml up -d
```

## Backend

```bash
npm install
npm run build
```

## Frontend

```bash
npm install
npm run build
npm install -g serve
serve -s build
```
