#!/bin/bash
# ====================================================================
# MiniAWS - EC2 Instance 2 Setup Script (Data Tier)
# IP: 3.127.237.130 (Public) | 172.31.12.181 (Private)
# Services: PostgreSQL 16, MinIO / Storage Service, Nginx Static Sites
# ====================================================================

set -e
echo ">>> [EC2-2 DATA TIER] Starting installation and configuration..."

# 1. Update and install packages
sudo dnf update -y
sudo dnf install -y postgresql16-server postgresql16 nginx python3 python3-pip git

# 2. Configure PostgreSQL
echo ">>> Initializing PostgreSQL 16..."
if [ ! -f /var/lib/pgsql/data/PG_VERSION ]; then
    sudo postgresql-setup --initdb
fi

# Configure listen_addresses and pg_hba.conf
PG_CONF="/var/lib/pgsql/data/postgresql.conf"
PG_HBA="/var/lib/pgsql/data/pg_hba.conf"

sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" $PG_CONF
sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/g" $PG_CONF

# Allow connections from VPC subnet 172.31.0.0/16 and localhost
if ! grep -q "172.31.0.0/16" $PG_HBA; then
    echo "host    all             all             172.31.0.0/16           md5" | sudo tee -a $PG_HBA
    echo "host    all             all             127.0.0.1/32            md5" | sudo tee -a $PG_HBA
    echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a $PG_HBA
fi

sudo systemctl enable postgresql
sudo systemctl restart postgresql

# Create database and user
echo ">>> Setting up Database and Users..."
sudo -u postgres psql -c "CREATE USER miniaws WITH PASSWORD 'miniaws123';" || true
sudo -u postgres psql -c "ALTER USER miniaws WITH PASSWORD 'miniaws123';" || true
sudo -u postgres psql -c "CREATE DATABASE miniaws_db OWNER miniaws;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE miniaws_db TO miniaws;" || true

# Run init_db.sql
if [ -f /home/ec2-user/MiniAWS/data_tier/init_db.sql ]; then
    echo ">>> Seeding initial database schema and tables..."
    PGPASSWORD=miniaws123 psql -h 127.0.0.1 -U miniaws -d miniaws_db -f /home/ec2-user/MiniAWS/data_tier/init_db.sql || true
fi

# 3. Setup Storage Directories
echo ">>> Setting up storage directories..."
sudo mkdir -p /data/storage
sudo mkdir -p /var/www/sites
sudo chown -R ec2-user:ec2-user /data/storage
sudo chown -R ec2-user:nginx /var/www/sites
sudo chmod -R 775 /var/www/sites

# 4. Setup Python Environment for Storage Service
echo ">>> Setting up Storage Service..."
python3 -m pip install --upgrade pip
python3 -m pip install fastapi uvicorn python-multipart pydantic requests

# Create systemd service for Storage Service
sudo tee /etc/systemd/system/miniaws-storage.service > /dev/null <<EOF
[Unit]
Description=MiniAWS Data Tier Storage Service
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/MiniAWS/data_tier/storage_service
ExecStart=/usr/bin/python3 -m uvicorn app:app --host 0.0.0.0 --port 9000
Restart=always
RestartSec=3
Environment=STORAGE_ROOT=/data/storage
Environment=SITES_ROOT=/var/www/sites

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable miniaws-storage
sudo systemctl restart miniaws-storage

# 5. Configure Nginx for Static Sites
echo ">>> Configuring Nginx for static site hosting..."
sudo tee /etc/nginx/conf.d/sites.conf > /dev/null <<EOF
server {
    listen 8080 default_server;
    listen [::]:8080 default_server;
    server_name _;

    root /var/www/sites;
    index index.html;

    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' '*' always;

    location /health {
        return 200 '{"status": "ok", "service": "data_tier_nginx"}';
        add_header Content-Type application/json;
    }

    location ~ ^/sites/([^/]+)/([^/]+)/(.*)$ {
        alias /var/www/sites/\$1/\$2/\$3;
        try_files "" /index.html =404;
    }

    location ~ ^/sites/([^/]+)/([^/]+)/?$ {
        alias /var/www/sites/\$1/\$2/;
        index index.html;
    }

    location / {
        try_files \$uri \$uri/ /index.html =404;
    }
}
EOF

sudo systemctl enable nginx
sudo systemctl restart nginx

echo ">>> [EC2-2 DATA TIER] Setup completed successfully!"
sudo systemctl status postgresql --no-pager
sudo systemctl status miniaws-storage --no-pager
sudo systemctl status nginx --no-pager
