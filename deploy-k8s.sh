#!/bin/bash

# Rocket.Chat Kubernetes Deployment Script
set -e

echo "🚀 Rocket.Chat Kubernetes Deployment"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed. Please install kubectl first.${NC}"
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ kubectl is installed and cluster is accessible${NC}"

# Ask for deployment type
echo ""
echo "Select deployment type:"
echo "1) Local (Minikube/Kind/Docker Desktop)"
echo "2) Cloud (GKE/EKS/AKS)"
read -p "Enter choice [1-2]: " deployment_type

# Build Docker image for local
if [ "$deployment_type" == "1" ]; then
    echo ""
    echo -e "${YELLOW}Building Docker image locally...${NC}"
    
    # Check if using Minikube
    if command -v minikube &> /dev/null && minikube status &> /dev/null; then
        echo "Using Minikube's Docker daemon..."
        eval $(minikube docker-env)
    fi
    
    docker build -t rocket.chat:latest . || {
        echo -e "${RED}❌ Docker build failed${NC}"
        exit 1
    }
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
fi

# Create namespace
echo ""
echo -e "${YELLOW}Creating namespace...${NC}"
kubectl apply -f k8s/namespace.yaml
echo -e "${GREEN}✓ Namespace created${NC}"

# Deploy MongoDB
echo ""
echo -e "${YELLOW}Deploying MongoDB...${NC}"
kubectl apply -f k8s/mongodb-deployment.yaml
echo "Waiting for MongoDB to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb -n rocketchat --timeout=300s || {
    echo -e "${RED}❌ MongoDB deployment failed${NC}"
    echo "Check logs with: kubectl logs -l app=mongodb -n rocketchat"
    exit 1
}
echo -e "${GREEN}✓ MongoDB is ready${NC}"

# Deploy Rocket.Chat
echo ""
echo -e "${YELLOW}Deploying Rocket.Chat...${NC}"
kubectl apply -f k8s/rocketchat-deployment.yaml
echo "Waiting for Rocket.Chat to be ready..."
kubectl wait --for=condition=ready pod -l app=rocketchat -n rocketchat --timeout=300s || {
    echo -e "${RED}❌ Rocket.Chat deployment failed${NC}"
    echo "Check logs with: kubectl logs -l app=rocketchat -n rocketchat"
    exit 1
}
echo -e "${GREEN}✓ Rocket.Chat is ready${NC}"

# Get access information
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check service type
SERVICE_TYPE=$(kubectl get svc rocketchat -n rocketchat -o jsonpath='{.spec.type}')

if [ "$SERVICE_TYPE" == "LoadBalancer" ]; then
    echo "Getting external IP (this may take a few minutes)..."
    EXTERNAL_IP=""
    while [ -z $EXTERNAL_IP ]; do
        EXTERNAL_IP=$(kubectl get svc rocketchat -n rocketchat -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
        [ -z "$EXTERNAL_IP" ] && sleep 5
    done
    echo -e "${GREEN}Access Rocket.Chat at: http://$EXTERNAL_IP${NC}"
else
    echo -e "${YELLOW}Service type is not LoadBalancer.${NC}"
    echo ""
    echo "To access Rocket.Chat, run:"
    echo -e "${GREEN}kubectl port-forward svc/rocketchat 3000:80 -n rocketchat${NC}"
    echo ""
    echo "Then open: http://localhost:3000"
fi

echo ""
echo "Useful commands:"
echo "  View pods:        kubectl get pods -n rocketchat"
echo "  View logs:        kubectl logs -f deployment/rocketchat -n rocketchat"
echo "  Scale up:         kubectl scale deployment rocketchat --replicas=3 -n rocketchat"
echo "  Delete all:       kubectl delete namespace rocketchat"
echo ""
echo -e "${GREEN}Happy chatting! 🚀${NC}"
