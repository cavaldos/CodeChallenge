FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 g++ make

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY .env ./
COPY . .

RUN yarn build


FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./

RUN yarn install --production && yarn add vite

EXPOSE 5173
EXPOSE 8081
EXPOSE 80
EXPOSE 81

# CMD ["yarn", "preview", "--host", "0.0.0.0", "--port", "5173", "--strictPort", "true"]

CMD ["yarn", "preview", "--host", "0.0.0.0", "--port", "5173"]