# Rocket.Chat Kubernetes Deployment Guide

This guide will help you deploy Rocket.Chat on Kubernetes with MongoDB.

## Prerequisites

1. **Kubernetes Cluster** - You need a running Kubernetes cluster. Options:
   - Local: Minikube, Kind, Docker Desktop
   - Cloud: GKE (Google), EKS (Amazon), AKS (Azure)
   
2. **kubectl** - Kubernetes command-line tool installed and configured

3. **Docker** - For building the container image

4. **Ingress Controller** (Optional) - For external access via domain name

## Architecture

- **MongoDB**: StatefulSet with persistent storage
- **Rocket.Chat**: Deployment with 2 replicas for high availability
- **Service**: LoadBalancer for external access
- **Ingress**: Optional domain-based routing

## Step 1: Build Docker Image

First, build the Rocket.Chat Docker image:

```bash
cd Rocket.Chat-chatbot

# Build the image
docker build -t rocketchat-custom:latest .

# Tag for your registry (if using cloud)
docker tag rocketchat-custom:latest your-registry/rocketchat-custom:latest

# Push to registry (if using cloud)
docker push your-registry/rocketchat-custom:latest
```

**For local testing (Minikube):**
```bash
# Use Minikube's Docker daemon
eval $(minikube docker-env)
docker build -t rocket.chat:latest .
```

## Step 2: Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

## Step 3: Deploy MongoDB

MongoDB will be deployed as a StatefulSet with persistent storage:

```bash
kubectl apply -f k8s/mongodb-deployment.yaml
```

Wait for MongoDB to be ready:
```bash
kubectl wait --for=condition=ready pod -l app=mongodb -n rocketchat --timeout=300s
```

## Step 4: Deploy Rocket.Chat

```bash
kubectl apply -f k8s/rocketchat-deployment.yaml
```

Wait for Rocket.Chat pods to be ready:
```bash
kubectl wait --for=condition=ready pod -l app=rocketchat -n rocketchat --timeout=300s
```

## Step 5: Access Rocket.Chat

### Option A: Using LoadBalancer (Cloud)

Get the external IP:
```bash
kubectl get svc rocketchat -n rocketchat
```

Access Rocket.Chat at: `http://<EXTERNAL-IP>`

### Option B: Using Port Forward (Local)

```bash
kubectl port-forward svc/rocketchat 3000:80 -n rocketchat
```

Access Rocket.Chat at: `http://localhost:3000`

### Option C: Using Ingress (Domain-based)

1. Install NGINX Ingress Controller:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

2. Apply Ingress configuration:
```bash
kubectl apply -f k8s/ingress.yaml
```

3. Add to `/etc/hosts`:
```bash
echo "127.0.0.1 rocketchat.local" | sudo tee -a /etc/hosts
```

4. Access at: `http://rocketchat.local`

## Step 6: Initial Setup

1. Open Rocket.Chat in your browser
2. Create admin account
3. Complete the setup wizard
4. Your custom theme will be automatically applied!

## Monitoring and Management

### Check Pod Status
```bash
kubectl get pods -n rocketchat
```

### View Logs
```bash
# Rocket.Chat logs
kubectl logs -f deployment/rocketchat -n rocketchat

# MongoDB logs
kubectl logs -f statefulset/mongodb -n rocketchat
```

### Scale Rocket.Chat
```bash
kubectl scale deployment rocketchat --replicas=3 -n rocketchat
```

### Update Configuration
Edit the ConfigMap and restart pods:
```bash
kubectl edit configmap rocketchat-config -n rocketchat
kubectl rollout restart deployment/rocketchat -n rocketchat
```

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name> -n rocketchat
kubectl logs <pod-name> -n rocketchat
```

### MongoDB connection issues
```bash
# Test MongoDB connection
kubectl exec -it mongodb-0 -n rocketchat -- mongosh -u rocketchat -p rocketchat123 --authenticationDatabase admin
```

### Check events
```bash
kubectl get events -n rocketchat --sort-by='.lastTimestamp'
```

## Production Considerations

### 1. Use Secrets for Sensitive Data
```bash
kubectl create secret generic mongodb-secret \
  --from-literal=username=rocketchat \
  --from-literal=password=your-secure-password \
  -n rocketchat
```

### 2. Enable TLS/SSL
Update ingress.yaml with TLS configuration:
```yaml
spec:
  tls:
    - hosts:
        - rocketchat.yourdomain.com
      secretName: rocketchat-tls
```

### 3. Configure Resource Limits
Already configured in deployment files. Adjust based on your needs.

### 4. Set up Backups
```bash
# Backup MongoDB
kubectl exec mongodb-0 -n rocketchat -- mongodump --uri="mongodb://rocketchat:rocketchat123@localhost:27017/rocketchat?authSource=admin" --out=/tmp/backup

# Copy backup
kubectl cp rocketchat/mongodb-0:/tmp/backup ./mongodb-backup
```

### 5. Use Horizontal Pod Autoscaler
```bash
kubectl autoscale deployment rocketchat -n rocketchat --cpu-percent=70 --min=2 --max=10
```

## Cleanup

To remove the entire deployment:
```bash
kubectl delete namespace rocketchat
```

## Cloud-Specific Instructions

### Google Kubernetes Engine (GKE)
```bash
# Create cluster
gcloud container clusters create rocketchat-cluster --num-nodes=3

# Get credentials
gcloud container clusters get-credentials rocketchat-cluster
```

### Amazon EKS
```bash
# Create cluster
eksctl create cluster --name rocketchat-cluster --nodes=3

# Update kubeconfig
aws eks update-kubeconfig --name rocketchat-cluster
```

### Azure AKS
```bash
# Create cluster
az aks create --resource-group myResourceGroup --name rocketchat-cluster --node-count 3

# Get credentials
az aks get-credentials --resource-group myResourceGroup --name rocketchat-cluster
```

## Environment Variables

Key environment variables in `rocketchat-config` ConfigMap:

- `ROOT_URL`: Your Rocket.Chat URL (update for production)
- `PORT`: Application port (default: 3000)
- `MONGO_URL`: MongoDB connection string
- `MONGO_OPLOG_URL`: MongoDB oplog URL for real-time updates

## Support

For issues or questions:
- Check logs: `kubectl logs -f deployment/rocketchat -n rocketchat`
- Rocket.Chat Documentation: https://docs.rocket.chat
- Kubernetes Documentation: https://kubernetes.io/docs/

## Custom Theme

Your custom warm neutral theme (#D6A99D, #FBF3D5, #D6DAC8) is already included in the deployment and will be automatically applied!
