# Deployment

Deployment configuration files for production environments.

## Files

- **Dockerfile** - Docker container configuration
- **docker-compose.yml** - Docker Compose setup for running services
- **rag-google-drive.service** - Systemd service file for Linux servers

## Docker Deployment

```bash
# Build the image
docker build -t rag-google-drive .

# Run with docker-compose
docker-compose up -d
```

## Systemd Service (Linux)

```bash
# Copy service file
sudo cp deployment/rag-google-drive.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable rag-google-drive

# Start service
sudo systemctl start rag-google-drive

# Check status
sudo systemctl status rag-google-drive

# View logs
sudo journalctl -u rag-google-drive -f
```

## Environment Variables

Make sure to set all required environment variables in production:
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `GOOGLE_SERVICE_ACCOUNT_FILE`
- `DRIVE_FOLDER_ID`

See `env.sample` in the root directory for all available options.
