.PHONY: help build deploy deploy-local deploy-cloud status logs clean scale backup

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker image
	@echo "Building Docker image..."
	docker build -t rocket.chat:latest .

build-minikube: ## Build Docker image for Minikube
	@echo "Building Docker image for Minikube..."
	eval $$(minikube docker-env) && docker build -t rocket.chat:latest .

deploy: ## Deploy to Kubernetes (automated)
	@echo "Deploying Rocket.Chat to Kubernetes..."
	./deploy-k8s.sh

deploy-local: ## Deploy to local Kubernetes (manual)
	@echo "Deploying to local Kubernetes..."
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/mongodb-deployment.yaml
	@echo "Waiting for MongoDB..."
	kubectl wait --for=condition=ready pod -l app=mongodb -n rocketchat --timeout=300s
	kubectl apply -f k8s/rocketchat-deployment.yaml
	@echo "Waiting for Rocket.Chat..."
	kubectl wait --for=condition=ready pod -l app=rocketchat -n rocketchat --timeout=300s
	@echo "Deployment complete!"

deploy-ingress: ## Deploy Ingress
	kubectl apply -f k8s/ingress.yaml

status: ## Check deployment status
	@echo "Checking deployment status..."
	kubectl get all -n rocketchat

pods: ## List all pods
	kubectl get pods -n rocketchat

logs: ## View Rocket.Chat logs
	kubectl logs -f deployment/rocketchat -n rocketchat

logs-mongodb: ## View MongoDB logs
	kubectl logs -f statefulset/mongodb -n rocketchat

port-forward: ## Port forward to access locally
	@echo "Port forwarding to localhost:3000..."
	kubectl port-forward svc/rocketchat 3000:80 -n rocketchat

scale: ## Scale Rocket.Chat (usage: make scale REPLICAS=3)
	@echo "Scaling to $(REPLICAS) replicas..."
	kubectl scale deployment rocketchat --replicas=$(REPLICAS) -n rocketchat

autoscale: ## Enable autoscaling
	kubectl autoscale deployment rocketchat -n rocketchat --cpu-percent=70 --min=2 --max=10

describe: ## Describe Rocket.Chat deployment
	kubectl describe deployment rocketchat -n rocketchat

events: ## Show recent events
	kubectl get events -n rocketchat --sort-by='.lastTimestamp'

shell: ## Open shell in Rocket.Chat pod
	kubectl exec -it $$(kubectl get pod -l app=rocketchat -n rocketchat -o jsonpath='{.items[0].metadata.name}') -n rocketchat -- /bin/sh

shell-mongodb: ## Open MongoDB shell
	kubectl exec -it mongodb-0 -n rocketchat -- mongosh -u rocketchat -p rocketchat123 --authenticationDatabase admin

backup: ## Backup MongoDB
	@echo "Backing up MongoDB..."
	kubectl exec mongodb-0 -n rocketchat -- mongodump --uri="mongodb://rocketchat:rocketchat123@localhost:27017/rocketchat?authSource=admin" --out=/tmp/backup
	kubectl cp rocketchat/mongodb-0:/tmp/backup ./mongodb-backup-$$(date +%Y%m%d-%H%M%S)
	@echo "Backup complete!"

restart: ## Restart Rocket.Chat deployment
	kubectl rollout restart deployment/rocketchat -n rocketchat

rollback: ## Rollback to previous version
	kubectl rollout undo deployment/rocketchat -n rocketchat

clean: ## Delete all resources
	@echo "Deleting all Rocket.Chat resources..."
	kubectl delete namespace rocketchat
	@echo "Cleanup complete!"

clean-local: ## Clean local Docker images
	docker rmi rocket.chat:latest || true

minikube-start: ## Start Minikube cluster
	minikube start --cpus=4 --memory=8192

minikube-stop: ## Stop Minikube cluster
	minikube stop

minikube-delete: ## Delete Minikube cluster
	minikube delete

install-ingress: ## Install NGINX Ingress Controller
	kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

test: ## Test deployment
	@echo "Testing Rocket.Chat API..."
	curl -f http://localhost:3000/api/info || echo "Make sure port-forward is running: make port-forward"

watch: ## Watch pods status
	kubectl get pods -n rocketchat -w

top: ## Show resource usage
	kubectl top pods -n rocketchat

config: ## Show current configuration
	kubectl get configmap rocketchat-config -n rocketchat -o yaml

update-config: ## Update configuration (restart required)
	kubectl edit configmap rocketchat-config -n rocketchat
	@echo "Run 'make restart' to apply changes"

all: build deploy-local port-forward ## Build, deploy, and port-forward
