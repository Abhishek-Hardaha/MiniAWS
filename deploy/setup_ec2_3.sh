#!/bin/bash
# ====================================================================
# MiniAWS - EC2 Instance 3 Setup Script (Execution & Monitoring Tier)
# IP: 3.71.47.123 (Public) | 172.31.3.155 (Private)
# Services: Python Function Runner, Scheduler, Prometheus Metrics
# ====================================================================

set -e
echo ">>> [EC2-3 EXECUTION TIER] Starting installation and configuration..."

# 1. Update and install packages
sudo dnf update -y
sudo dnf install -y python3 python3-pip git

# 2. Install Python dependencies
echo ">>> Installing Python runner and scheduler dependencies..."
python3 -m pip install --upgrade pip
python3 -m pip install fastapi uvicorn pydantic requests psutil apscheduler

# 3. Create systemd service for Function Runner (Port 5001)
echo ">>> Setting up Function Runner systemd service..."
sudo tee /etc/systemd/system/miniaws-runner.service > /dev/null <<EOF
[Unit]
Description=MiniAWS Execution Tier Function Runner
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/MiniAWS/execution_tier/runner_service
ExecStart=/usr/bin/python3 -m uvicorn runner:app --host 0.0.0.0 --port 5001
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 4. Create systemd service for Scheduler & Metrics (Port 5002)
echo ">>> Setting up Scheduler & Metrics systemd service..."
sudo tee /etc/systemd/system/miniaws-scheduler.service > /dev/null <<EOF
[Unit]
Description=MiniAWS Execution Tier Scheduler & Metrics
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/MiniAWS/execution_tier/scheduler_service
ExecStart=/usr/bin/python3 -m uvicorn scheduler:app --host 0.0.0.0 --port 5002
Restart=always
RestartSec=3
Environment=RUNNER_URL=http://127.0.0.1:5001/run
Environment=BACKEND_API_URL=http://172.31.9.80:8000

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable miniaws-runner
sudo systemctl enable miniaws-scheduler
sudo systemctl restart miniaws-runner
sudo systemctl restart miniaws-scheduler

echo ">>> [EC2-3 EXECUTION TIER] Setup completed successfully!"
sudo systemctl status miniaws-runner --no-pager
sudo systemctl status miniaws-scheduler --no-pager
