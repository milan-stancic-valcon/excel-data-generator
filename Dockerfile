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

# Create directories for output files
RUN mkdir -p results/excel results/csv

# Make the script files executable
RUN chmod +x generate-xlsx.js generate-csv.js

# Set the entrypoint to node
ENTRYPOINT ["node"]

# Default command (can be overridden)
CMD ["--help"]
