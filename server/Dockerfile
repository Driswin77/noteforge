FROM node:20-slim

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install Node dependencies
COPY server/package*.json ./
RUN npm install

# Copy server code
COPY server/ ./

# Copy extractor and install its Python dependencies
COPY extractor/ ../extractor/
RUN pip3 install --break-system-packages -r ../extractor/requirements.txt

ENV PYTHON_PATH=python3
EXPOSE 5000

CMD ["node", "src/index.js"]