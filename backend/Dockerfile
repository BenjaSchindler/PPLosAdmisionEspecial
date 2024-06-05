# Dockerfile for Express Backend

# Use the official Node.js image.
FROM node:16

# Set the working directory.
WORKDIR /app

# Copy package.json and package-lock.json.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Expose port 5000 to the host.
EXPOSE 5000

# Command to run the app.
CMD ["npm", "start"]
