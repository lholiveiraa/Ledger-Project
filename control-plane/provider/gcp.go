package provider

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"
	"workops/control-plane/models"
)

type ServiceConfig struct {
	Name  string `json:"name"`
	Image string `json:"image"`
}

type GCPCloudRunProvider struct {
	mu    sync.Mutex
	state map[uint]DeploymentState
}

func (p *GCPCloudRunProvider) ensureState() {
	if p.state == nil {
		p.state = make(map[uint]DeploymentState)
	}
}

func (p *GCPCloudRunProvider) Deploy(ctx context.Context, release models.Release, env models.Environment) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.ensureState()

	var services []ServiceConfig
	if err := json.Unmarshal([]byte(release.Services), &services); err != nil {
		return fmt.Errorf("failed to parse services: %w", err)
	}

	p.state[env.ID] = DeploymentState{
		Status:    "deploying",
		Version:   release.Version,
		UpdatedAt: time.Now(),
	}

	// Recuperar config do environment (region, project)
	var envConfig map[string]string
	json.Unmarshal([]byte(env.Config), &envConfig)
	region := envConfig["region"]
	project := envConfig["project"]
	if region == "" {
		region = "us-central1"
	}

	fmt.Printf("GCP Provider: Deploying to %s (Project: %s, Region: %s)\n", env.Name, project, region)

	go func(envID uint, ver string) {
		time.Sleep(4 * time.Second)
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

func (p *GCPCloudRunProvider) GetLogs(ctx context.Context, env models.Environment, service string, releaseID string, lines int) ([]string, error) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.ensureState()

	state, ok := p.state[env.ID]
	if !ok {
		return []string{"[GCP] Service not initialized"}, nil
	}

	logs := []string{
		fmt.Sprintf("[GCP:%s] Initializing service %s...", env.Name, service),
		fmt.Sprintf("[GCP:%s] Loading secrets from Secret Manager...", env.Name),
	}

	if state.Status == "deploying" {
		logs = append(logs,
			fmt.Sprintf("[GCP:%s] Deploying revision...", env.Name),
			fmt.Sprintf("[GCP:%s] Routing traffic...", env.Name),
		)
	} else if state.Status == "ready" {
		logs = append(logs,
			fmt.Sprintf("[GCP:%s] Revision active", env.Name),
			fmt.Sprintf("[GCP:%s] Health check passed", env.Name),
			fmt.Sprintf("[GCP:%s] Listening on port 8080", env.Name),
			fmt.Sprintf("[GCP:%s] Request GET /api/v1/status 200 OK", env.Name),
		)
	}

	return logs, nil
}

func (p *GCPCloudRunProvider) SetSecrets(ctx context.Context, env models.Environment, secrets map[string]string) error {
	fmt.Printf("GCP Provider: Syncing %d secrets to Secret Manager for env %s\n", len(secrets), env.Name)
	return nil
}

func (p *GCPCloudRunProvider) GetStatus(ctx context.Context, env models.Environment) (map[string]interface{}, error) {
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
		"status":          status,
		"provider":        "GCP Cloud Run",
		"version":         state.Version,
		"latest_revision": fmt.Sprintf("%s-%s", env.Name, state.Version),
		"traffic_split":   "100%",
	}, nil
}
