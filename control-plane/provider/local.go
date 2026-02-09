package provider

import (
	"context"
	"fmt"
	"math/rand"
	"time"
	"workops/control-plane/models"
)

type LocalProvider struct{}

func (p *LocalProvider) Deploy(ctx context.Context, release models.Release, env models.Environment) error {
	// Simulate local docker run
	time.Sleep(2 * time.Second)
	// Random failure chance for testing auto-incident
	if rand.Intn(10) > 8 {
		return fmt.Errorf("local docker run failed: port conflict or image missing")
	}
	return nil
}

func (p *LocalProvider) GetLogs(ctx context.Context, env models.Environment, service string, releaseID string, lines int) ([]string, error) {
	// Simulate reading docker logs
	timestamp := time.Now().Format("2006-01-02T15:04:05Z")
	logs := []string{
		fmt.Sprintf("%s [INFO] Starting service %s in local docker...", timestamp, env.Name),
		fmt.Sprintf("%s [INFO] Reading .env from local file...", timestamp),
		fmt.Sprintf("%s [INFO] DB Connection: localhost:5432 (connected)", timestamp),
		fmt.Sprintf("%s [WARN] Hot reload enabled (dev mode)", timestamp),
	}
	
	for i := 0; i < 5; i++ {
		logs = append(logs, fmt.Sprintf("%s [DEBUG] Request processed in %dms", time.Now().Add(time.Duration(i)*time.Second).Format("15:04:05"), rand.Intn(100)))
	}

	if lines > 0 && len(logs) > lines {
		return logs[len(logs)-lines:], nil
	}
	return logs, nil
}

func (p *LocalProvider) SetSecrets(ctx context.Context, env models.Environment, secrets map[string]string) error {
	// Local: write to .env file (simulated)
	return nil
}

func (p *LocalProvider) GetStatus(ctx context.Context, env models.Environment) (map[string]interface{}, error) {
	return map[string]interface{}{
		"status":          "ok",
		"provider":        "local-docker",
		"container_state": "running",
		"ports":           "8080:8080",
		"uptime":          "2h 15m",
	}, nil
}
