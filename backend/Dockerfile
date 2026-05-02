FROM node:22-alpine AS deps
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile


FROM node:22-alpine AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN yarn build


FROM node:22-alpine AS production
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/yarn.lock ./

RUN yarn install --production --frozen-lockfile
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 5001

CMD ["node", "dist/server.js"]