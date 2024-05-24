FROM node:20.12.2-alpine as builder

WORKDIR /app
ADD package.json yarn.lock  ./
ADD tsconfig.json ./
RUN yarn install --frozen-lockfile
ADD ./src ./src
RUN yarn build


FROM node:20.12.2-alpine as dependency
WORKDIR /app
ADD package.json yarn.lock  ./
RUN yarn install --frozen-lockfile --prod
RUN yarn add sharp --ignore-engines


FROM node:20.12.2-alpine as Runner
WORKDIR /app
ADD package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=dependency /app/node_modules ./node_modules
ENV PORT 3333

CMD yarn start 






