FROM node:lts-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source files
COPY src ./src
COPY tsconfig.json ./

CMD ["npm", "start"]
