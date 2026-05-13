FROM node:20-slim

# Install build tools needed for sodium-native and @discordjs/opus + ffmpeg for music
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies (with native compilation support)
RUN npm install --omit=dev

# Copy rest of the project
COPY . .

# Start the bot
CMD ["node", "index.js"]
