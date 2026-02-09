package main

import (
	"bytes"
	"fmt"
	"os/exec"
	"strings"
)

// RuntimeWrapper encapsula chamadas ao binário de container (docker/podman)
type RuntimeWrapper struct {
	Command string // "docker", "podman" ou "nerdctl"
}

func NewRuntime(cmd string) *RuntimeWrapper {
	if cmd == "" {
		cmd = "docker"
	}
	return &RuntimeWrapper{Command: cmd}
}

func (r *RuntimeWrapper) RunContainer(name, image string, ports []string, env map[string]string, network string) error {
	// Primeiro tenta remover se já existir
	r.StopContainer(name)
	exec.Command(r.Command, "rm", name).Run()

	args := []string{"run", "-d", "--name", name}
	
	if network != "" {
		args = append(args, "--network", network)
	}

	for _, p := range ports {
		args = append(args, "-p", p)
	}

	for k, v := range env {
		args = append(args, "-e", fmt.Sprintf("%s=%s", k, v))
	}

	args = append(args, image)

	cmd := exec.Command(r.Command, args...)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to run container %s: %v | stderr: %s", name, err, stderr.String())
	}
	return nil
}

func (r *RuntimeWrapper) StopContainer(name string) error {
	return exec.Command(r.Command, "stop", name).Run()
}

func (r *RuntimeWrapper) ListContainers() ([]string, error) {
	// Retorna lista de nomes
	cmd := exec.Command(r.Command, "ps", "--format", "{{.Names}}")
	out, err := cmd.Output()
	if err != nil {
		return nil, err
	}
	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	return lines, nil
}

func (r *RuntimeWrapper) GetLogs(name string, lines int) (string, error) {
	cmd := exec.Command(r.Command, "logs", "--tail", fmt.Sprintf("%d", lines), name)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", err
	}
	return string(out), nil
}

func (r *RuntimeWrapper) CreateNetwork(name string) error {
	// Ignora erro se já existir
	exec.Command(r.Command, "network", "create", name).Run()
	return nil
}

func (r *RuntimeWrapper) BuildImage(tag, contextPath string) error {
	cmd := exec.Command(r.Command, "build", "-t", tag, contextPath)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("build failed: %v | stderr: %s", err, stderr.String())
	}
	return nil
}
