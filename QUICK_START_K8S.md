# Quick Start: Deploy Rocket.Chat on Kubernetes

## 🚀 Fastest Way to Deploy

### Option 1: Using the Deployment Script (Recommended)

```bash
cd Rocket.Chat-chatbot
./deploy-k8s.sh
```

Follow the prompts and you're done! 🎉

### Option 2: Manual Deployment

```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Deploy MongoDB
kubectl apply -f k8s/mongodb-deployment.yaml

# 3. Wait for MongoDB
kubectl wait --for=condition=ready pod -l app=mongodb -n rocketchat --timeout=300s

# 4. Deploy Rocket.Chat
kubectl apply -f k8s/rocketchat-deployment.yaml

# 5. Wait for Rocket.Chat
kubectl wait --for=condition=ready pod -l app=rocketchat -n rocketchat --timeout=300s

# 6. Access via port-forward
kubectl port-forward svc/rocketchat 3000:80 -n rocketchat
```

Open http://localhost:3000 in your browser!

## 📋 Prerequisites

- Kubernetes cluster (Minikube, Kind, Docker Desktop, or cloud)
- kubectl installed and configured
- Docker (for building images)

## 🔧 Local Setup with Minikube

```bash
# Start Minikube
minikube start --cpus=4 --memory=8192

# Build image in Minikube
eval $(minikube docker-env)
docker build -t rocket.chat:latest .

# Deploy
./deploy-k8s.sh

# Access
kubectl port-forward svc/rocketchat 3000:80 -n rocketchat
```

## ☁️ Cloud Deployment

### Google Cloud (GKE)
```bash
# Create cluster
gcloud container clusters create rocketchat --num-nodes=3

# Deploy
./deploy-k8s.sh

# Get external IP
kubectl get svc rocketchat -n rocketchat
```

### AWS (EKS)
```bash
# Create cluster
eksctl create cluster --name rocketchat --nodes=3

# Deploy
./deploy-k8s.sh

# Get external URL
kubectl get svc rocketchat -n rocketchat
```

### Azure (AKS)
```bash
# Create cluster
az aks create --resource-group myRG --name rocketchat --node-count 3

# Get credentials
az aks get-credentials --resource-group myRG --name rocketchat

# Deploy
./deploy-k8s.sh

# Get external IP
kubectl get svc rocketchat -n rocketchat
```

## 🎨 Your Custom Theme

Your custom warm neutral theme (#D6A99D, #FBF3D5, #D6DAC8) is automatically included!

## 📊 Monitoring

```bash
# Check status
kubectl get all -n rocketchat

# View logs
kubectl logs -f deployment/rocketchat -n rocketchat

# Check pods
kubectl get pods -n rocketchat -w
```

## 🔄 Scaling

```bash
# Scale to 5 replicas
kubectl scale deployment rocketchat --replicas=5 -n rocketchat

# Enable autoscaling
kubectl autoscale deployment rocketchat -n rocketchat --cpu-percent=70 --min=2 --max=10
```

## 🧹 Cleanup

```bash
# Delete everything
kubectl delete namespace rocketchat
```

## 🆘 Troubleshooting

### Pods not starting?
```bash
kubectl describe pod <pod-name> -n rocketchat
kubectl logs <pod-name> -n rocketchat
```

### Can't access?
```bash
# Use port-forward
kubectl port-forward svc/rocketchat 3000:80 -n rocketchat
```

### MongoDB issues?
```bash
# Check MongoDB logs
kubectl logs statefulset/mongodb -n rocketchat
```

## 📚 Full Documentation

See [KUBERNETES_DEPLOYMENT.md](./KUBERNETES_DEPLOYMENT.md) for detailed instructions.

## 🎉 That's It!

Your Rocket.Chat instance with custom theme is now running on Kubernetes!
