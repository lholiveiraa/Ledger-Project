package provider

import (
	"context"
	"fmt"
	"sync"
	"time"
	"workops/control-plane/models"
)

type AWSAppRunnerProvider struct {
	mu    sync.Mutex
	state map[uint]DeploymentState
}

func (p *AWSAppRunnerProvider) ensureState() {
	if p.state == nil {
		p.state = make(map[uint]DeploymentState)
	}
}

func (p *AWSAppRunnerProvider) Deploy(ctx context.Context, release models.Release, env models.Environment) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.ensureState()

	// 1. Set status to deploying
	p.state[env.ID] = DeploymentState{
		Status:    "deploying",
		Version:   release.Version,
		UpdatedAt: time.Now(),
	}

	fmt.Printf("AWS Provider: Deploying version %s to App Runner in %s\n", release.Version, env.Name)

	// 2. Simulate async deployment (in a real app, this would be a separate goroutine or polling)
	// For this simulation, we'll just update it immediately effectively, but let's pretend it takes a moment if we were polling.
	// However, since the user UI might poll immediately, let's leave it as "deploying" for 10 seconds if we could,
	// but we don't have a background loop.
	// So we'll spin up a goroutine to finish it.
	go func(envID uint, ver string) {
		time.Sleep(5 * time.Second)
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

func (p *AWSAppRunnerProvider) GetLogs(ctx context.Context, env models.Environment, service string, releaseID string, lines int) ([]string, error) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.ensureState()

	state, ok := p.state[env.ID]
	if !ok {
		return []string{"[AWS] Service not initialized"}, nil
	}

	logs := []string{
		fmt.Sprintf("[AWS:%s] Service initialization started...", env.Name),
		fmt.Sprintf("[AWS:%s] VPC connector configured", env.Name),
		fmt.Sprintf("[AWS:%s] Pulling image from ECR...", env.Name),
	}

	if state.Status == "deploying" {
		logs = append(logs,
			fmt.Sprintf("[AWS:%s] Deployment in progress...", env.Name),
			fmt.Sprintf("[AWS:%s] Health check pending...", env.Name),
		)
	} else if state.Status == "ready" {
		logs = append(logs,
			fmt.Sprintf("[AWS:%s] Deployment successful", env.Name),
			fmt.Sprintf("[AWS:%s] Service running version %s", env.Name, state.Version),
			fmt.Sprintf("[AWS:%s] GET /health 200 OK", env.Name),
		)
	}

	return logs, nil
}

func (p *AWSAppRunnerProvider) SetSecrets(ctx context.Context, env models.Environment, secrets map[string]string) error {
	fmt.Printf("AWS Provider: Setting %d secrets in Secrets Manager\n", len(secrets))
	// In a real implementation, we would store these or call AWS API
	return nil
}

func (p *AWSAppRunnerProvider) GetStatus(ctx context.Context, env models.Environment) (map[string]interface{}, error) {
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
		"provider": "AWS App Runner",
		"version":  state.Version,
		"updated":  state.UpdatedAt,
	}, nil
}
