package provider

import (
	"context"
	"fmt"
	"sync"
	"time"
	"workops/control-plane/models"
)

type AzureContainerAppsProvider struct {
	mu    sync.Mutex
	state map[uint]DeploymentState
}

func (p *AzureContainerAppsProvider) ensureState() {
	if p.state == nil {
		p.state = make(map[uint]DeploymentState)
	}
}

func (p *AzureContainerAppsProvider) Deploy(ctx context.Context, release models.Release, env models.Environment) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.ensureState()

	p.state[env.ID] = DeploymentState{
		Status:    "deploying",
		Version:   release.Version,
		UpdatedAt: time.Now(),
	}

	fmt.Printf("Azure Provider: Deploying version %s to Container Apps in %s\n", release.Version, env.Name)

	go func(envID uint, ver string) {
		time.Sleep(6 * time.Second)
		p.mu.Lock()
		defer p.mu.Unlock()
		p.state[envID] = DeploymentState{
			Status:    "ready",
			Version:   ver,
			UpdatedAt: time.Now(),
		}
	}(env.ID, release.Version)

	return nil
}

func (p *AzureContainerAppsProvider) GetLogs(ctx context.Context, env models.Environment, service string, releaseID string, lines int) ([]string, error) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.ensureState()

	state, ok := p.state[env.ID]
	if !ok {
		return []string{"[Azure] Container App not found"}, nil
	}

	logs := []string{
		fmt.Sprintf("[Azure:%s] Authenticating with Managed Identity...", env.Name),
		fmt.Sprintf("[Azure:%s] Pulling image from ACR...", env.Name),
	}

	if state.Status == "deploying" {
		logs = append(logs,
			fmt.Sprintf("[Azure:%s] Creating new revision...", env.Name),
			fmt.Sprintf("[Azure:%s] Probing startup health...", env.Name),
		)
	} else if state.Status == "ready" {
		logs = append(logs,
			fmt.Sprintf("[Azure:%s] Revision active", env.Name),
			fmt.Sprintf("[Azure:%s] Container started", env.Name),
			fmt.Sprintf("[Azure:%s] Listening on port 80", env.Name),
		)
	}

	return logs, nil
}

func (p *AzureContainerAppsProvider) SetSecrets(ctx context.Context, env models.Environment, secrets map[string]string) error {
	fmt.Printf("Azure Provider: Setting %d secrets in Key Vault\n", len(secrets))
	return nil
}

func (p *AzureContainerAppsProvider) GetStatus(ctx context.Context, env models.Environment) (map[string]interface{}, error) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.ensureState()

	state, ok := p.state[env.ID]
	status := "unknown"
	if ok {
		status = state.Status
	} else {
		status = "not_deployed"
	}

	return map[string]interface{}{
		"status":   status,
		"provider": "Azure Container Apps",
		"version":  state.Version,
		"updated":  state.UpdatedAt,
	}, nil
}
