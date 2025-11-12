#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Deploy the 8192 game to Kubernetes cluster.

.DESCRIPTION
    Comprehensive deployment script for the 8192 microservices game application.
    Handles building images, deploying to Kubernetes, and validating deployment.

    Deploys:
    - MongoDB (StatefulSet with persistent storage)
    - Redis (StatefulSet with persistent storage)
    - 12 Backend microservices (game-logic, ai, data-integration, economy, etc.)
    - API Gateway (main entry point)
    - Frontend (React SPA)
    - Ingress with TLS (cert-manager)

.PARAMETER Build
    Build Docker images before deploying

.PARAMETER Push
    Push Docker images to Docker Hub (requires -Build)

.PARAMETER Uninstall
    Remove all 8192 resources from cluster

.PARAMETER SkipWait
    Don't wait for rollout status

.EXAMPLE
    .\deploy.ps1
    Deploy using existing images

.EXAMPLE
    .\deploy.ps1 -Build -Push
    Build, push, and deploy

.EXAMPLE
    .\deploy.ps1 -Uninstall
    Remove deployment from cluster
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$Build,

    [Parameter(Mandatory=$false)]
    [switch]$Push,

    [Parameter(Mandatory=$false)]
    [switch]$Uninstall,

    [Parameter(Mandatory=$false)]
    [switch]$SkipWait
)

#region Configuration
$ErrorActionPreference = "Stop"

$NAMESPACE = "srt-8192"
$APP_NAME = "8192 Game"
$INGRESS_URL = "https://8192.lab.hq.solidrust.net"

# Deployment order matters for dependencies
$MANIFESTS = @(
    "k8s/01-namespace.yaml",
    "k8s/02-mongodb.yaml",
    "k8s/03-redis.yaml",
    "k8s/04-backend-services.yaml",
    "k8s/05-api-gateway.yaml",
    "k8s/06-frontend.yaml",
    "k8s/07-ingress.yaml"
)

# Color output functions
function Write-ColorOutput {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [Parameter(Mandatory=$false)]
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success { param([string]$Message) Write-ColorOutput "✅ $Message" "Green" }
function Write-Info { param([string]$Message) Write-ColorOutput "ℹ️  $Message" "Cyan" }
function Write-Warning { param([string]$Message) Write-ColorOutput "⚠️  $Message" "Yellow" }
function Write-Error { param([string]$Message) Write-ColorOutput "❌ $Message" "Red" }
function Write-Header { param([string]$Message) Write-ColorOutput "`n=== $Message ===" "Magenta" }

#endregion

#region Functions

function Test-KubectlAvailable {
    try {
        kubectl version --client | Out-Null
        return $true
    } catch {
        Write-Error "kubectl is not available. Please install kubectl."
        return $false
    }
}

function Invoke-BuildAndPush {
    Write-Header "Building and Pushing Images"

    $buildArgs = @()
    if ($Push) {
        $buildArgs += "-Push"
    }

    try {
        & ./build-and-push.ps1 @buildArgs
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Build failed"
            exit 1
        }
        Write-Success "Images built successfully"
    } catch {
        Write-Error "Build script failed: $_"
        exit 1
    }
}

function Invoke-Deploy {
    Write-Header "Deploying $APP_NAME"

    foreach ($manifest in $MANIFESTS) {
        if (-not (Test-Path $manifest)) {
            Write-Error "Manifest not found: $manifest"
            exit 1
        }

        Write-Info "Applying: $manifest"
        try {
            kubectl apply -f $manifest
            Write-Success "Applied: $manifest"
        } catch {
            Write-Error "Failed to apply $manifest: $_"
            exit 1
        }
    }

    Write-Success "All manifests applied"
}

function Wait-ForRollout {
    Write-Header "Waiting for Rollout Completion"

    # Wait for StatefulSets
    $statefulsets = @("mongodb", "redis")
    foreach ($sts in $statefulsets) {
        Write-Info "Waiting for StatefulSet: $sts"
        try {
            kubectl rollout status statefulset/$sts -n $NAMESPACE --timeout=5m
            Write-Success "StatefulSet ready: $sts"
        } catch {
            Write-Warning "StatefulSet rollout timeout: $sts (may still be starting)"
        }
    }

    # Wait for Deployments
    $deployments = @(
        "game-logic", "ai-service", "data-integration", "economy",
        "leaderboard", "matchmaking", "notifications", "persistence",
        "rewards", "social", "tutorial", "user", "api-gateway", "frontend"
    )
    foreach ($deploy in $deployments) {
        Write-Info "Waiting for Deployment: $deploy"
        try {
            kubectl rollout status deployment/$deploy -n $NAMESPACE --timeout=5m
            Write-Success "Deployment ready: $deploy"
        } catch {
            Write-Warning "Deployment rollout timeout: $deploy (may still be starting)"
        }
    }
}

function Show-Status {
    Write-Header "Deployment Status"

    Write-Info "Namespace: $NAMESPACE"
    kubectl get namespace $NAMESPACE 2>$null

    Write-Info "`nPods:"
    kubectl get pods -n $NAMESPACE -o wide

    Write-Info "`nServices:"
    kubectl get services -n $NAMESPACE

    Write-Info "`nStatefulSets:"
    kubectl get statefulsets -n $NAMESPACE

    Write-Info "`nPersistentVolumeClaims:"
    kubectl get pvc -n $NAMESPACE

    Write-Info "`nIngress:"
    kubectl get ingress -n $NAMESPACE

    Write-Info "`nCertificate:"
    kubectl get certificate -n $NAMESPACE

    Write-Header "Access Information"
    Write-Success "Frontend: $INGRESS_URL"
    Write-Success "API: $INGRESS_URL/api"
    Write-Success "WebSocket: wss://8192.lab.hq.solidrust.net/ws"
}

function Show-UsefulCommands {
    Write-Header "Useful Commands"

    Write-Info "View all pods:"
    Write-Host "  kubectl get pods -n $NAMESPACE" -ForegroundColor Yellow

    Write-Info "View logs for a specific service:"
    Write-Host "  kubectl logs -n $NAMESPACE -l app=frontend" -ForegroundColor Yellow
    Write-Host "  kubectl logs -n $NAMESPACE -l app=api-gateway" -ForegroundColor Yellow
    Write-Host "  kubectl logs -n $NAMESPACE -l app=game-logic" -ForegroundColor Yellow

    Write-Info "View MongoDB logs:"
    Write-Host "  kubectl logs -n $NAMESPACE -l app=mongodb" -ForegroundColor Yellow

    Write-Info "View Redis logs:"
    Write-Host "  kubectl logs -n $NAMESPACE -l app=redis" -ForegroundColor Yellow

    Write-Info "Check certificate status:"
    Write-Host "  kubectl describe certificate srt-8192-tls -n $NAMESPACE" -ForegroundColor Yellow

    Write-Info "Watch pod status:"
    Write-Host "  kubectl get pods -n $NAMESPACE -w" -ForegroundColor Yellow

    Write-Info "Access MongoDB shell:"
    Write-Host "  kubectl exec -it mongodb-0 -n $NAMESPACE -- mongosh" -ForegroundColor Yellow

    Write-Info "Access Redis CLI:"
    Write-Host "  kubectl exec -it redis-0 -n $NAMESPACE -- redis-cli" -ForegroundColor Yellow

    Write-Info "Restart a deployment:"
    Write-Host "  kubectl rollout restart deployment/frontend -n $NAMESPACE" -ForegroundColor Yellow

    Write-Info "Scale a deployment:"
    Write-Host "  kubectl scale deployment/frontend --replicas=5 -n $NAMESPACE" -ForegroundColor Yellow
}

function Invoke-Uninstall {
    Write-Header "Uninstalling $APP_NAME"

    Write-Warning "This will delete all $APP_NAME resources including persistent data!"
    $confirm = Read-Host "Are you sure? (yes/no)"

    if ($confirm -ne "yes") {
        Write-Info "Uninstall cancelled"
        return
    }

    # Delete in reverse order
    $reversedManifests = $MANIFESTS | Sort-Object -Descending
    foreach ($manifest in $reversedManifests) {
        if (Test-Path $manifest) {
            Write-Info "Deleting: $manifest"
            kubectl delete -f $manifest --ignore-not-found=true
        }
    }

    # Force delete PVCs (they don't auto-delete with StatefulSets)
    Write-Info "Deleting PersistentVolumeClaims..."
    kubectl delete pvc -n $NAMESPACE --all --ignore-not-found=true

    # Delete namespace (cleanup any remaining resources)
    Write-Info "Deleting namespace..."
    kubectl delete namespace $NAMESPACE --ignore-not-found=true

    Write-Success "Uninstall complete"
}

#endregion

#region Main Script

Write-Header "$APP_NAME Deployment Script"

# Check kubectl
if (-not (Test-KubectlAvailable)) {
    exit 1
}

# Handle uninstall
if ($Uninstall) {
    Invoke-Uninstall
    exit 0
}

# Build and push if requested
if ($Build) {
    Invoke-BuildAndPush
}

# Deploy
Invoke-Deploy

# Wait for rollout
if (-not $SkipWait) {
    Wait-ForRollout
}

# Show status
Start-Sleep -Seconds 5  # Give resources time to update
Show-Status

# Show useful commands
Show-UsefulCommands

Write-Header "Deployment Complete"
Write-Success "✅ $APP_NAME deployed successfully!"
Write-Info "Access the application at: $INGRESS_URL"
Write-Warning "Note: Certificate issuance may take 1-2 minutes on first deployment"

#endregion
