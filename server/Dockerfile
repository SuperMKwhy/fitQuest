# Debian-based (not -alpine): Prisma's query engine binary needs a real
# OpenSSL + glibc, which musl-based Alpine images don't provide out of the
# box — that mismatch is what "Could not parse schema engine response" /
# "Prisma failed to detect the libssl/openssl version" actually means.
FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Using `db push` (not `migrate deploy`) because this schema has no migration
# history yet — see todo.md for switching to `prisma migrate` once it stabilizes.
# Syncs the schema to Postgres before starting so a fresh `docker compose up`
# always ends with an up-to-date schema.
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
