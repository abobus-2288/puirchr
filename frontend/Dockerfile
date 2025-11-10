# syntax=docker/dockerfile:1

FROM node:20

WORKDIR /app

# Install dependencies early for better caching
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the rest of the source (for build steps if needed)
COPY . .

EXPOSE 3000

# Default command can be overridden by compose
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
