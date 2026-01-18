# development
FROM node:20-alpine AS development

WORKDIR /app

RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "run", "start:dev"]

# production

FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY . .

RUN npx prisma generate

RUN pnpm run build

EXPOSE 4000

CMD ["npm", "run", "start:prod"]