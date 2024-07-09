FROM node:lts-alpine
LABEL org.opencontainers.image.source="https://github.com/H1D/telegram-to-github-bot"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source files
COPY src ./src
COPY tsconfig.json ./

CMD ["npm", "start"]
