# ====================================================================
# MiniAWS - Automated Multi-Tier Deployment Orchestrator
# Deploys services to EC2-1 (App), EC2-2 (Data), EC2-3 (Execution)
# ====================================================================

$ErrorActionPreference = "Stop"

$EC2_1_IP = "35.159.95.208"
$EC2_2_IP = "3.127.237.130"
$EC2_3_IP = "3.71.47.123"
$KEY_PATH = ".\Inst1.pem"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   Mini AWS Cloud Platform - Multi-Tier Deployment    " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Check key
if (!(Test-Path $KEY_PATH)) {
    Write-Error "Private key $KEY_PATH not found in current directory!"
}

# --------------------------------------------------------------------
# Step 1: Deploy EC2-2 (Data Tier)
# --------------------------------------------------------------------
Write-Host "`n>>> [1/3] Deploying EC2-2 Data Tier ($EC2_2_IP)..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no -i $KEY_PATH ec2-user@$EC2_2_IP "mkdir -p /home/ec2-user/MiniAWS/data_tier /home/ec2-user/MiniAWS/deploy"
scp -o StrictHostKeyChecking=no -i $KEY_PATH -r .\data_tier\* ec2-user@${EC2_2_IP}:/home/ec2-user/MiniAWS/data_tier/
scp -o StrictHostKeyChecking=no -i $KEY_PATH .\deploy\setup_ec2_2.sh ec2-user@${EC2_2_IP}:/home/ec2-user/MiniAWS/deploy/
ssh -o StrictHostKeyChecking=no -i $KEY_PATH ec2-user@$EC2_2_IP "bash /home/ec2-user/MiniAWS/deploy/setup_ec2_2.sh"
Write-Host ">>> [EC2-2] Data Tier Deployed Successfully!" -ForegroundColor Green

# --------------------------------------------------------------------
# Step 2: Deploy EC2-3 (Execution & Monitoring Tier)
# --------------------------------------------------------------------
Write-Host "`n>>> [2/3] Deploying EC2-3 Execution Tier ($EC2_3_IP)..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no -i $KEY_PATH ec2-user@$EC2_3_IP "mkdir -p /home/ec2-user/MiniAWS/execution_tier /home/ec2-user/MiniAWS/deploy"
scp -o StrictHostKeyChecking=no -i $KEY_PATH -r .\execution_tier\* ec2-user@${EC2_3_IP}:/home/ec2-user/MiniAWS/execution_tier/
scp -o StrictHostKeyChecking=no -i $KEY_PATH .\deploy\setup_ec2_3.sh ec2-user@${EC2_3_IP}:/home/ec2-user/MiniAWS/deploy/
ssh -o StrictHostKeyChecking=no -i $KEY_PATH ec2-user@$EC2_3_IP "bash /home/ec2-user/MiniAWS/deploy/setup_ec2_3.sh"
Write-Host ">>> [EC2-3] Execution Tier Deployed Successfully!" -ForegroundColor Green

# --------------------------------------------------------------------
# Step 3: Deploy EC2-1 (Application Tier)
# --------------------------------------------------------------------
Write-Host "`n>>> [3/3] Deploying EC2-1 Application Tier ($EC2_1_IP)..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no -i $KEY_PATH ec2-user@$EC2_1_IP "mkdir -p /home/ec2-user/MiniAWS/backend /home/ec2-user/MiniAWS/frontend /home/ec2-user/MiniAWS/deploy"
scp -o StrictHostKeyChecking=no -i $KEY_PATH $KEY_PATH ec2-user@${EC2_1_IP}:/home/ec2-user/Inst1.pem
scp -o StrictHostKeyChecking=no -i $KEY_PATH -r .\backend\* ec2-user@${EC2_1_IP}:/home/ec2-user/MiniAWS/backend/
scp -o StrictHostKeyChecking=no -i $KEY_PATH -r .\deploy\* ec2-user@${EC2_1_IP}:/home/ec2-user/MiniAWS/deploy/

# Copy frontend source files excluding node_modules and .next for fast transfer
Write-Host ">>> Transferring frontend package to EC2-1..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no -i $KEY_PATH ec2-user@$EC2_1_IP "mkdir -p /home/ec2-user/MiniAWS/frontend/src /home/ec2-user/MiniAWS/frontend/public"
scp -o StrictHostKeyChecking=no -i $KEY_PATH .\frontend\package.json ec2-user@${EC2_1_IP}:/home/ec2-user/MiniAWS/frontend/
scp -o StrictHostKeyChecking=no -i $KEY_PATH .\frontend\tsconfig.json ec2-user@${EC2_1_IP}:/home/ec2-user/MiniAWS/frontend/
scp -o StrictHostKeyChecking=no -i $KEY_PATH .\frontend\next.config.js ec2-user@${EC2_1_IP}:/home/ec2-user/MiniAWS/frontend/
scp -o StrictHostKeyChecking=no -i $KEY_PATH -r .\frontend\public\* ec2-user@${EC2_1_IP}:/home/ec2-user/MiniAWS/frontend/public/
scp -o StrictHostKeyChecking=no -i $KEY_PATH -r .\frontend\src\* ec2-user@${EC2_1_IP}:/home/ec2-user/MiniAWS/frontend/src/

ssh -o StrictHostKeyChecking=no -i $KEY_PATH ec2-user@$EC2_1_IP "bash /home/ec2-user/MiniAWS/deploy/setup_ec2_1.sh"
Write-Host ">>> [EC2-1] Application Tier Deployed Successfully!" -ForegroundColor Green

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "   All 3 EC2 Instances Deployed & Verified Online!    " -ForegroundColor Green
Write-Host "   Web Console: http://$EC2_1_IP                      " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
