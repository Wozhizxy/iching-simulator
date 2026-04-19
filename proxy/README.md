# I Ching AI Proxy Server

This is a proxy server for integrating AI interpretation capabilities into the I Ching Simulator. It uses the Zhipu AI API to provide detailed explanations of hexagram results.

## Features

- ✅ Connects to Zhipu AI API (glm-4-flash model)
- ✅ Processes hexagram results and user questions
- ✅ Returns AI-generated interpretations
- ✅ CORS enabled for frontend integration
- ✅ Environment variable configuration

## Getting Started

### Python Version (Recommended)

#### Prerequisites

- Python 3.7+
- pip
- Zhipu AI API key (free tier available)

#### Installation

1. **Navigate to the proxy directory**
   ```bash
   cd proxy
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   - Copy the example env file
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` file and add your Zhipu API key
     ```
     ZHIPU_API_KEY=your_zhipu_api_key_here
     PORT=3001
     ```

#### Running the Server

**Development mode**:
```bash
python app.py
```

The server will run on `http://localhost:3001`

### Node.js Version (Legacy)

#### Prerequisites

- Node.js (v14+)
- npm
- Zhipu AI API key (free tier available)

#### Installation

1. **Navigate to the proxy directory**
   ```bash
   cd proxy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy the example env file
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` file and add your Zhipu API key
     ```
     ZHIPU_API_KEY=your_zhipu_api_key_here
     PORT=3001
     ```

#### Running the Server

**Development mode** (with nodemon):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Health Check
- **Endpoint**: `GET /health`
- **Response**: `{ "status": "ok" }`

### AI Interpretation
- **Endpoint**: `POST /api/ai-interpret`
- **Request Body**:
  ```json
  {
    "question": "Your question here",
    "hexagramResult": {
      "lines": [...],
      "hexagramIndex": 1,
      "changedHexagramIndex": 2,
      "timestamp": 1234567890,
      "originalInfo": {
        "index": 1,
        "name": "乾为天",
        "lowerTrigram": "乾",
        "upperTrigram": "乾"
      },
      "changedInfo": {
        "index": 2,
        "name": "坤为地",
        "lowerTrigram": "坤",
        "upperTrigram": "坤"
      }
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "interpretation": "Detailed AI interpretation here..."
  }
  ```

## Deployment

### Python Version Deployment

#### On Aliyun Lightweight Server

1. **SSH into your server**
   ```bash
   ssh root@your-server-ip
   ```

2. **Install Python and pip**
   ```bash
   apt update
   apt install python3 python3-pip
   ```

3. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/iching-simulator.git
   cd iching-simulator/proxy
   ```

4. **Install dependencies**
   ```bash
   pip3 install -r requirements.txt
   ```

5. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your Zhipu API key
   nano .env
   ```

6. **Start the server**
   ```bash
   python3 app.py
   ```

7. **Set up a process manager** (recommended)
   ```bash
   pip3 install gunicorn
   gunicorn -w 4 -b 0.0.0.0:3001 app:app
   
   # To run as a service, create a systemd service file
   # Example service file:
   # /etc/systemd/system/iching-proxy.service
   # [Unit]
   # Description=I Ching AI Proxy Server
   # After=network.target
   #
   # [Service]
   # User=root
   # WorkingDirectory=/path/to/iching-simulator/proxy
   # ExecStart=/usr/local/bin/gunicorn -w 4 -b 0.0.0.0:3001 app:app
   # Restart=always
   #
   # [Install]
   # WantedBy=multi-user.target
   ```

### Node.js Version Deployment

#### On Aliyun Lightweight Server

1. **SSH into your server**
   ```bash
   ssh root@your-server-ip
   ```

2. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/iching-simulator.git
   cd iching-simulator/proxy
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your Zhipu API key
   nano .env
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Set up a process manager** (recommended)
   ```bash
   npm install -g pm2
   pm2 start index.js --name iching-proxy
   pm2 save
   pm2 startup
   ```

### Frontend Configuration

The Python version uses the same API endpoint as the Node.js version, so no changes are needed in the frontend code. Simply update the API endpoint in `CoinDivination.tsx` to point to your server:

```typescript
// Change this line
const response = await fetch('http://localhost:3001/api/ai-interpret', {

// To your server URL
const response = await fetch('http://your-server-ip:3001/api/ai-interpret', {
```

## Zhipu AI API

This project uses the Zhipu AI API with the `glm-4-flash` model, which is available for free. You can get your API key from the [Zhipu AI Developer Platform](https://open.bigmodel.cn/).

## License

MIT License