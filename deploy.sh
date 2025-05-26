#!/usr/bin/env sh
# Deploy the container images to ECR.
# usage: ./deploy.sh <region>
set -ex

# aws cloudformation deploy --stack-name scramble-stack --template-file stack.yaml

# Variables
DOCKER_BUILD="sudo docker build --platform=linux/amd64"
AWS_REGION="$1"
if [ -z ${AWS_REGION} ]; then
  AWS_REGION="us-west-2"
fi
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
FRONTEND_REPO_NAME="scramble-frontend"
BACKEND_REPO_NAME="scramble-backend"
FRONTEND_IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${FRONTEND_REPO_NAME}:latest"
BACKEND_IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${BACKEND_REPO_NAME}:latest"

# Authenticate Docker to ECR
sudo aws ecr get-login-password --region ${AWS_REGION} | sudo docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
#aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 049625203700.dkr.ecr.us-west-2.amazonaws.com
#sudo aws ecr get-login-password --region us-west-2 | sudo docker login --username AWS --password-stdin 049625203700.dkr.ecr.us-west-2.amazonaws.com

# Build Docker images
$DOCKER_BUILD -t ${FRONTEND_IMAGE} ./frontend
$DOCKER_BUILD -t ${BACKEND_IMAGE} ./backend

# Push Docker images to ECR
sudo docker push ${FRONTEND_IMAGE}
sudo docker push ${BACKEND_IMAGE}
 
sudo aws ecs update-service --cluster scramble --service scramble-service --task-definition frontend-backend-task --force-new-deployment --region ${AWS_REGION}
