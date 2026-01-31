# Builder: устанавливаем все зависимости и собираем TypeScript
FROM node:18.20.0-alpine AS builder
WORKDIR /app

# Копируем манифесты зависимостей
COPY package*.json ./

# Устанавливаем все зависимости (включая dev) для сборки
RUN npm ci

# Копируем исходники и конфиг TypeScript
COPY tsconfig.json ./
COPY src ./src

# Собираем проект
RUN npm run build

# Runner: минимальный образ с только production-зависимостями
FROM node:18.20.0-alpine AS runner
WORKDIR /app

# Копируем только package-файлы и устанавливаем production-зависимости
COPY package*.json ./
RUN npm ci --only=production

# Копируем собранный код из builder-stage
COPY --from=builder /app/dist ./dist

# Старт приложения
CMD ["npm", "run", "start"]