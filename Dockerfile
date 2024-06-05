# Dockerfile for React App

# Use the official Node.js image.
FROM node:14

# Set the working directory.
WORKDIR /app

# Copy package.json and package-lock.json.
COPY package*.json ./

# Install dependencies.
RUN npm install --force

# Copy the rest of the application code.
COPY . .

# Build the app for production.
RUN npm run build

# Serve the app using a lightweight server.
RUN npm install -g serve

# Expose port 3000 to the host.
EXPOSE 3000

# Command to run the app.
CMD ["serve", "-s", "build"]
