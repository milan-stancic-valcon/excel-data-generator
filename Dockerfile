# Use Node.js LTS version
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create directory for output files
RUN mkdir -p results/excel

# Set the entrypoint to node
ENTRYPOINT ["node", "generate-xlsx.js"]

# Default command (can be overridden)
CMD ["--help"]
