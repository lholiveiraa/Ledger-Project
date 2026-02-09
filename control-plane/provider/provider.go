package provider

import (
	"context"
	"time"
	"workops/control-plane/models"
)

type DeploymentState struct {
	Status    string
	Version   string
	UpdatedAt time.Time
}

type Provider interface {
	Deploy(ctx context.Context, release models.Release, env models.Environment) error
	// GetLogs now supports service and release filtering
	GetLogs(ctx context.Context, env models.Environment, service string, releaseID string, lines int) ([]string, error)
	SetSecrets(ctx context.Context, env models.Environment, secrets map[string]string) error
	GetStatus(ctx context.Context, env models.Environment) (map[string]interface{}, error)
}

var (
	localProvider = &LocalProvider{}
	gcpProvider   = &GCPCloudRunProvider{}
	azureProvider = &AzureContainerAppsProvider{}
	awsProvider   = &AWSAppRunnerProvider{}
)

func GetProvider(name string) Provider {
	switch name {
	case "local":
		return localProvider
	case "gcp-cloudrun":
		return gcpProvider
	case "azure-containerapps":
		return azureProvider
	case "aws-apprunner":
		return awsProvider
	default:
		return gcpProvider // Default to GCP
	}
}
