# Kubernetes Manifests

This directory contains Kubernetes manifest files for deploying Rocket.Chat.

## Files

### namespace.yaml
Creates a dedicated namespace `rocketchat` for all resources.

### mongodb-deployment.yaml
Deploys MongoDB as a StatefulSet with:
- Persistent storage (10GB PVC)
- Authentication enabled
- Resource limits configured

### rocketchat-deployment.yaml
Deploys Rocket.Chat application with:
- ConfigMap for environment variables
- LoadBalancer service for external access
- 2 replicas for high availability
- Health checks (liveness and readiness probes)
- Resource requests and limits

### ingress.yaml
Optional Ingress configuration for domain-based routing:
- Requires NGINX Ingress Controller
- Configured for `rocketchat.local`
- Can be customized for your domain

## Quick Deploy

```bash
# Deploy all resources
kubectl apply -f namespace.yaml
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f rocketchat-deployment.yaml

# Optional: Deploy ingress
kubectl apply -f ingress.yaml
```

## Configuration

### Update MongoDB Credentials
Edit `mongodb-deployment.yaml`:
```yaml
env:
  - name: MONGO_INITDB_ROOT_USERNAME
    value: "your-username"
  - name: MONGO_INITDB_ROOT_PASSWORD
    value: "your-password"
```

Also update `rocketchat-deployment.yaml` ConfigMap:
```yaml
MONGO_URL: "mongodb://your-username:your-password@mongodb:27017/rocketchat?authSource=admin"
```

### Update ROOT_URL
Edit `rocketchat-deployment.yaml` ConfigMap:
```yaml
ROOT_URL: "https://your-domain.com"
```

### Change Service Type
Edit `rocketchat-deployment.yaml`:
```yaml
spec:
  type: ClusterIP  # or NodePort, LoadBalancer
```

## Access

### Via LoadBalancer
```bash
kubectl get svc rocketchat -n rocketchat
# Use EXTERNAL-IP
```

### Via Port Forward
```bash
kubectl port-forward svc/rocketchat 3000:80 -n rocketchat
# Access at http://localhost:3000
```

### Via Ingress
```bash
# Add to /etc/hosts
echo "127.0.0.1 rocketchat.local" | sudo tee -a /etc/hosts

# Access at http://rocketchat.local
```

## Monitoring

```bash
# Check all resources
kubectl get all -n rocketchat

# View logs
kubectl logs -f deployment/rocketchat -n rocketchat

# Check events
kubectl get events -n rocketchat
```

## Cleanup

```bash
kubectl delete -f ingress.yaml
kubectl delete -f rocketchat-deployment.yaml
kubectl delete -f mongodb-deployment.yaml
kubectl delete -f namespace.yaml
```

Or simply:
```bash
kubectl delete namespace rocketchat
```
