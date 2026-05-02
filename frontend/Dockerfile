FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 g++ make

ARG VITE_API_URL=http://localhost:5001
ENV VITE_API_URL=$VITE_API_URL

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

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