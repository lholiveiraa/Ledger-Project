package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"workops/spec"

	"gopkg.in/yaml.v3"
)

const (
	agentURL = "http://localhost:8080/api"
	cpURL    = "http://localhost:8081/api"
)

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	cmd := os.Args[1]

	switch cmd {
	case "init":
		runInit()
	case "up":
		runUp() // Local dev
	case "down":
		runDown() // Local dev
	case "ps":
		runPs()
	case "logs":
		runLogs()
	case "ui":
		runUi()
	case "release":
		if len(os.Args) < 3 {
			fmt.Println("Usage: workops release create <version>")
			return
		}
		if os.Args[2] == "create" {
			version := "v1.0.0"
			if len(os.Args) > 3 {
				version = os.Args[3]
			}
			runReleaseCreate(version)
		}
	case "deploy":
		if len(os.Args) < 4 {
			fmt.Println("Usage: workops deploy <env> <release_id>")
			return
		}
		runDeploy(os.Args[2], os.Args[3])
	case "work":
		if len(os.Args) < 3 {
			printWorkUsage()
			return
		}
		handleWorkCommand(os.Args[2], os.Args[3:])
	case "secrets":
		if len(os.Args) < 3 {
			fmt.Println("Usage: workops secrets <set|get> <env_id> [key=value...]")
			return
		}
		if os.Args[2] == "set" {
			if len(os.Args) < 4 {
				fmt.Println("Usage: workops secrets set <env_id> <key>=<value> ...")
				return
			}
			runSecretsSet(os.Args[3], os.Args[4:])
		} else if os.Args[2] == "get" {
			runSecretsGet(os.Args[3])
		} else if os.Args[2] == "import" {
			if len(os.Args) < 5 {
				fmt.Println("Usage: workops secrets import <env_id> <file_path>")
				return
			}
			runSecretsImport(os.Args[3], os.Args[4])
		} else if os.Args[2] == "link" {
			if len(os.Args) < 5 {
				fmt.Println("Usage: workops secrets link <env_id> <key> <external_ref>")
				return
			}
			runSecretsSet(os.Args[3], []string{fmt.Sprintf("%s=ref:%s", os.Args[4], os.Args[5])})
		} else {
			fmt.Println("Unknown secrets command")
		}
	default:
		fmt.Printf("Unknown command: %s\n", cmd)
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println("Usage: workops <command> [args]")
	fmt.Println("Commands:")
	fmt.Println("  init          Initialize workops.yaml")
	fmt.Println("  up            Start local environment")
	fmt.Println("  down          Stop local environment")
	fmt.Println("  ps            Check status")
	fmt.Println("  logs          View logs")
	fmt.Println("  ui            Open dashboard")
	fmt.Println("  release create <ver>  Create and register a release")
	fmt.Println("  deploy <env> <id>     Deploy release to environment")
	fmt.Println("  work          Manage work items (create, list, link)")
	fmt.Println("  secrets       Manage secrets (set, get)")
}

func printWorkUsage() {
	fmt.Println("Usage: workops work <subcommand> [args]")
	fmt.Println("Subcommands:")
	fmt.Println("  create <title> --type <type>  Create a new work item")
	fmt.Println("  list                          List work items")
	fmt.Println("  link <work_id> <release_id>   Link work item to release")
}

func handleWorkCommand(subcmd string, args []string) {
	switch subcmd {
	case "create":
		if len(args) < 1 {
			fmt.Println("Usage: workops work create <title> [--type <feature|bug|chore|incident>]")
			return
		}
		title := args[0]
		itemType := "feature"
		if len(args) >= 3 && args[1] == "--type" {
			itemType = args[2]
		}
		runWorkCreate(title, itemType)
	case "list":
		runWorkList()
	case "link":
		if len(args) < 2 {
			fmt.Println("Usage: workops work link <work_id> <release_id>")
			return
		}
		runWorkLink(args[0], args[1])
	default:
		printWorkUsage()
	}
}

type WorkItemPayload struct {
	AppID       uint   `json:"app_id"`
	Title       string `json:"title"`
	Type        string `json:"type"`
	Description string `json:"description"`
	Status      string `json:"status"`
}

func runWorkCreate(title, itemType string) {
	// MVP: Hardcoded App ID 1
	payload := WorkItemPayload{
		AppID:       1,
		Title:       title,
		Type:        itemType,
		Description: "Created via CLI",
		Status:      "todo",
	}
	jsonData, _ := json.Marshal(payload)
	resp, err := http.Post(cpURL+"/workitems", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error connecting to Control Plane:", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		fmt.Println("Failed to create work item")
		return
	}
	io.Copy(os.Stdout, resp.Body)
	fmt.Println("")
}

func runWorkList() {
	resp, err := http.Get(cpURL + "/workitems?app_id=1")
	if err != nil {
		fmt.Println("Error connecting to Control Plane:", err)
		return
	}
	defer resp.Body.Close()
	io.Copy(os.Stdout, resp.Body)
	fmt.Println("")
}

type LinkPayload struct {
	WorkItemID uint `json:"work_item_id"`
	ReleaseID  uint `json:"release_id"`
}

func runWorkLink(workIDStr, releaseIDStr string) {
	var wID, rID uint
	fmt.Sscanf(workIDStr, "%d", &wID)
	fmt.Sscanf(releaseIDStr, "%d", &rID)

	payload := LinkPayload{
		WorkItemID: wID,
		ReleaseID:  rID,
	}
	jsonData, _ := json.Marshal(payload)
	resp, err := http.Post(cpURL+"/link", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error connecting to Control Plane:", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		fmt.Println("Failed to link work item")
		return
	}
	fmt.Println("Work item linked to release successfully")
}

func runInit() {
	content := `version: "1.0"
name: my-app
services:
  web:
    type: web
    image: nginx:latest
    ports:
      - "80:80"
resources:
  db:
    type: db
    engine: postgres
    mode: local-container
`
	if err := os.WriteFile("workops.yaml", []byte(content), 0644); err != nil {
		fmt.Printf("Error creating workops.yaml: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("Created workops.yaml")
}

func readSpec() *spec.AppSpec {
	data, err := os.ReadFile("workops.yaml")
	if err != nil {
		fmt.Printf("Error reading workops.yaml: %v\n", err)
		os.Exit(1)
	}
	var app spec.AppSpec
	if err := yaml.Unmarshal(data, &app); err != nil {
		fmt.Printf("Error parsing yaml: %v\n", err)
		os.Exit(1)
	}
	return &app
}

func runUp() {
	app := readSpec()
	jsonData, _ := json.Marshal(app)
	resp, err := http.Post(agentURL+"/up", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error connecting to agent. Is it running? Try 'workops agent'.")
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
}

func runDown() {
	app := readSpec()
	jsonData, _ := json.Marshal(app)
	resp, err := http.Post(agentURL+"/down", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error connecting to agent:", err)
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
}

func runPs() {
	resp, err := http.Get(agentURL + "/status")
	if err != nil {
		fmt.Println("Error connecting to agent:", err)
		return
	}
	defer resp.Body.Close()
	io.Copy(os.Stdout, resp.Body)
}

// Secrets Commands

func runSecretsSet(envIDStr string, args []string) {
	secrets := make(map[string]string)
	for _, arg := range args {
		// Split by first '='
		for i, char := range arg {
			if char == '=' {
				key := arg[:i]
				value := arg[i+1:]
				secrets[key] = value
				break
			}
		}
	}

	if len(secrets) == 0 {
		fmt.Println("No valid key=value pairs provided")
		return
	}

	payload := map[string]interface{}{
		"secrets": secrets,
	}
	jsonData, _ := json.Marshal(payload)

	resp, err := http.Post(cpURL+"/secrets?env_id="+envIDStr, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error connecting to Control Plane:", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("Failed to set secrets: %s\n", body)
		return
	}

	io.Copy(os.Stdout, resp.Body)
	fmt.Println("")
}

func runSecretsGet(envIDStr string) {
	resp, err := http.Get(cpURL + "/secrets?env_id=" + envIDStr)
	if err != nil {
		fmt.Println("Error connecting to Control Plane:", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("Failed to get secrets: %s\n", body)
		return
	}

	var secrets []interface{}
	if err := json.NewDecoder(resp.Body).Decode(&secrets); err != nil {
		fmt.Println("Error parsing response:", err)
		return
	}

	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	encoder.Encode(secrets)
}

func runSecretsImport(envIDStr, filePath string) {
	content, err := os.ReadFile(filePath)
	if err != nil {
		fmt.Printf("Error reading file: %v\n", err)
		return
	}

	lines := strings.Split(string(content), "\n")
	var args []string
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		// Ensure it has '='
		if strings.Contains(line, "=") {
			args = append(args, line)
		}
	}

	if len(args) == 0 {
		fmt.Println("No secrets found in file")
		return
	}

	fmt.Printf("Importing %d secrets from %s...\n", len(args), filePath)
	runSecretsSet(envIDStr, args)
}

func runLogs() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: workops logs <service_name>")
		return
	}
	resp, err := http.Get(agentURL + "/logs?service=" + os.Args[2])
	if err != nil {
		fmt.Println("Error connecting to agent:", err)
		return
	}
	defer resp.Body.Close()
	io.Copy(os.Stdout, resp.Body)
}

func runUi() {
	fmt.Println("Opening UI at http://localhost:5173...") // Vite default
	exec.Command("cmd", "/c", "start", "http://localhost:5173").Start()
}

// Novos comandos

type ReleasePayload struct {
	AppID     uint   `json:"app_id"`
	Version   string `json:"version"`
	CommitSHA string `json:"commit_sha"`
	Services  string `json:"services"` // JSON string
}

func runReleaseCreate(version string) {
	appSpec := readSpec()
	// 1. Build images (simulado, apenas pega nomes)
	// Em real, rodaria docker build + docker push
	fmt.Println("Building and pushing images...")

	services := []map[string]string{}
	for name, svc := range appSpec.Services {
		img := svc.Image
		if img == "" {
			img = fmt.Sprintf("gcr.io/my-project/%s-%s:%s", appSpec.Name, name, version)
		}
		services = append(services, map[string]string{
			"name":  name,
			"image": img,
		})
		fmt.Printf("Built %s -> %s\n", name, img)
	}

	servicesJson, _ := json.Marshal(services)

	// 2. Register release
	// MVP: Hardcoded App ID 1 (criado no seed)
	payload := ReleasePayload{
		AppID:     1,
		Version:   version,
		CommitSHA: "abc1234", // Mock
		Services:  string(servicesJson),
	}

	jsonData, _ := json.Marshal(payload)
	resp, err := http.Post(cpURL+"/releases", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error connecting to Control Plane:", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("Failed to create release: %s\n", body)
		return
	}
	fmt.Printf("Release %s created successfully!\n", version)
}

type DeployPayload struct {
	ReleaseID uint `json:"release_id"`
	EnvID     uint `json:"env_id"`
}

func runDeploy(envName, releaseID string) {
	// MVP: Precisamos buscar o ID do Env pelo nome
	// Simplificação: hardcoded mapping ou fetch
	// Vamos assumir que o usuário passa IDs por enquanto ou fetch
	// Fetch envs
	resp, err := http.Get(cpURL + "/envs?app_id=1")
	if err != nil {
		fmt.Println("Error fetching envs:", err)
		return
	}
	defer resp.Body.Close()

	var envs []map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&envs)

	var envID uint
	for _, e := range envs {
		if e["name"] == envName {
			envID = uint(e["id"].(float64))
			break
		}
	}

	if envID == 0 {
		fmt.Printf("Environment %s not found\n", envName)
		return
	}

	// Deploy
	var rID uint
	fmt.Sscanf(releaseID, "%d", &rID)

	payload := DeployPayload{
		ReleaseID: rID,
		EnvID:     envID,
	}
	jsonData, _ := json.Marshal(payload)

	resp, err = http.Post(cpURL+"/deploy", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error requesting deploy:", err)
		return
	}
	defer resp.Body.Close()

	io.Copy(os.Stdout, resp.Body)
}
