FROM oven/bun

WORKDIR /usr/src/app

COPY package.json ./
# Install Python and build tools needed for native dependencies
RUN apt-get update && apt-get install -y python3 make g++ && apt-get clean
RUN bun install
COPY . .

ENV NODE_ENV production

RUN bun build ./src/http/gravity-api/server.ts --outdir ./dist --target bun
RUN mv ./dist/server.js ./dist/gravity-api-server.js
CMD ["bun", "run", "dist/gravity-api-server.js"]