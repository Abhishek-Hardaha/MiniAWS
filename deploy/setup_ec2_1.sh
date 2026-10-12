#!/bin/bash
# ====================================================================
# MiniAWS - EC2 Instance 1 Setup Script (Application Tier)
# IP: 35.159.95.208 (Public) | 172.31.9.80 (Private)
# Services: Next.js Frontend (Port 3000), FastAPI Gateway (Port 8000), Nginx Proxy (Port 80)
# ====================================================================

set -e
echo ">>> [EC2-1 APPLICATION TIER] Starting installation and configuration..."

# 1. Update and install packages
sudo dnf update -y
sudo dnf install -y nginx nodejs python3 python3-pip git gcc python3-devel postgresql-devel

# 2. Fix PEM key permissions if copied
if [ -f /home/ec2-user/Inst1.pem ]; then
    chmod 400 /home/ec2-user/Inst1.pem
fi

# 3. Setup Internal Bridge Tunnel Service
# This guarantees that even if AWS Security Group blocks non-22 traffic between private IPs,
# all private tier communication is 100% bridged and rock-solid via SSH over port 22!
echo ">>> Setting up Internal Private Network Bridge..."
sudo tee /etc/systemd/system/miniaws-tunnel.service > /dev/null <<EOF
[Unit]
Description=MiniAWS Private VPC Tunnel Bridge
After=network.target

[Service]
Type=simple
User=ec2-user
ExecStart=/bin/bash -c 'while true; do ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -i /home/ec2-user/Inst1.pem -N -L 5432:127.0.0.1:5432 -L 9000:127.0.0.1:9000 -L 8080:127.0.0.1:8080 ec2-user@172.31.12.181; sleep 3; done'
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/miniaws-tunnel-exec.service > /dev/null <<EOF
[Unit]
Description=MiniAWS Private VPC Tunnel Bridge to EC2-3 Execution
After=network.target

[Service]
Type=simple
User=ec2-user
ExecStart=/bin/bash -c 'while true; do ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -i /home/ec2-user/Inst1.pem -N -L 5001:127.0.0.1:5001 -L 5002:127.0.0.1:5002 ec2-user@172.31.3.155; sleep 3; done'
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
if [ -f /home/ec2-user/Inst1.pem ]; then
    sudo systemctl enable miniaws-tunnel || true
    sudo systemctl restart miniaws-tunnel || true
    sudo systemctl enable miniaws-tunnel-exec || true
    sudo systemctl restart miniaws-tunnel-exec || true
fi

# 4. Setup Python Backend
echo ">>> Setting up FastAPI Backend & API Gateway..."
python3 -m pip install --upgrade pip
python3 -m pip install fastapi uvicorn pydantic pydantic-settings sqlalchemy psycopg2-binary python-jose passlib python-multipart requests psutil

sudo tee /etc/systemd/system/miniaws-backend.service > /dev/null <<EOF
[Unit]
Description=MiniAWS Application Tier Backend & Gateway
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/MiniAWS/backend
ExecStart=/usr/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3
Environment=DATABASE_URL=postgresql://miniaws:miniaws123@127.0.0.1:5432/miniaws_db
Environment=STORAGE_SERVICE_URL=http://127.0.0.1:9000
Environment=STATIC_SITES_URL=http://127.0.0.1:8080
Environment=RUNNER_SERVICE_URL=http://127.0.0.1:5001
Environment=SCHEDULER_SERVICE_URL=http://127.0.0.1:5002

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable miniaws-backend
sudo systemctl restart miniaws-backend

# 5. Setup Next.js Frontend
echo ">>> Building and starting Next.js Frontend..."
cd /home/ec2-user/MiniAWS/frontend
npm install
npm run build

sudo tee /etc/systemd/system/miniaws-frontend.service > /dev/null <<EOF
[Unit]
Description=MiniAWS Next.js Frontend Console
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/MiniAWS/frontend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=3
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable miniaws-frontend
sudo systemctl restart miniaws-frontend

# 6. Configure Nginx Reverse Proxy on Port 80
echo ">>> Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/conf.d/miniaws.conf > /dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 500M;

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # API Gateway Routes
    location /gateway/ {
        proxy_pass http://127.0.0.1:8000/gateway/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Static Sites Proxy from Data Tier
    location /sites/ {
        proxy_pass http://127.0.0.1:8080/sites/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Next.js Frontend Console
    location / {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo systemctl enable nginx
sudo systemctl restart nginx

echo ">>> [EC2-1 APPLICATION TIER] Setup completed successfully!"
sudo systemctl status miniaws-backend --no-pager
sudo systemctl status miniaws-frontend --no-pager
sudo systemctl status nginx --no-pager
