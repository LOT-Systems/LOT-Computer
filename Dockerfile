# Use the official Node.js image as the base image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock files to the container
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy the entire application source code to the container
COPY . .

# Build the application
RUN echo "🔨 Building application..." && \
    yarn build && \
    echo "✅ Build completed" && \
    ls -la dist/server/server/index.js && \
    echo "📦 Server entry point verified ($(wc -c < dist/server/server/index.js) bytes)"

# Expose the port your application will run on
EXPOSE 8080

# Start the application with migrations
CMD echo "🗄️ Running migrations..." && \
    yarn migrations:up && \
    echo "✅ Migrations completed" && \
    echo "🚀 Starting server..." && \
    node dist/server/server/index.js
