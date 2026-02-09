package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"time"
)

func main() {
	if len(os.Args) < 2 {
		printHelp()
		return
	}

	command := os.Args[1]

	switch command {
	case "init":
		runInit()
	case "up":
		runUp()
	case "down":
		runDown()
	case "ps":
		runPs()
	case "logs":
		runLogs()
	case "ui":
		runUi()
	default:
		fmt.Printf("Unknown command: %s\n", command)
		printHelp()
	}
}

func printHelp() {
	fmt.Println("Usage: human [command]")
	fmt.Println("\nCommands:")
	fmt.Println("  init   Create a new project configuration")
	fmt.Println("  up     Start the project services")
	fmt.Println("  down   Stop the project services")
	fmt.Println("  ps     List running services")
	fmt.Println("  logs   View service logs")
	fmt.Println("  ui     Open the dashboard")
}

func runInit() {
	fmt.Println("Initializing new human project...")
	yaml := `version: "1.0"
name: my-app
services:
  web:
    type: web
    ports:
      - "3000:80"
    env:
      NODE_ENV: development
`
	if _, err := os.Stat("human.yaml"); err == nil {
		fmt.Println("human.yaml already exists")
		return
	}
	os.WriteFile("human.yaml", []byte(yaml), 0644)
	fmt.Println("Created human.yaml")
}

func runUp() {
	fmt.Println("Starting project...")
	if !checkDaemon() {
		fmt.Println("Daemon not running. Starting...")
		startDaemon()

		// Wait for health check
		for i := 0; i < 10; i++ {
			if checkDaemon() {
				break
			}
			time.Sleep(1 * time.Second)
			fmt.Print(".")
		}
		fmt.Println("\nDaemon started.")
	}

	// Trigger deploy via API
	// In MVP, we assume AppID=1, EnvID=1 (Local)
	// TODO: Parse human.yaml and update backend model before deploy

	resp, err := http.Post("http://localhost:8081/api/deploy", "application/json", nil) // Simplified
	if err != nil {
		fmt.Println("Failed to trigger deploy:", err)
		return
	}
	defer resp.Body.Close()
	fmt.Println("Services started successfully.")
}

func runDown() {
	fmt.Println("Stopping services...")
	// TODO: Implement stop API
}

func runPs() {
	resp, err := http.Get("http://localhost:8081/api/deployments?app_id=1")
	if err != nil {
		fmt.Println("Error connecting to daemon:", err)
		return
	}
	defer resp.Body.Close()
	// Pretty print JSON response
	io.Copy(os.Stdout, resp.Body)
	fmt.Println()
}

func runLogs() {
	// Fetch logs for Env 1
	resp, err := http.Get("http://localhost:8081/api/logs?env_id=1&lines=20")
	if err != nil {
		fmt.Println("Error fetching logs:", err)
		return
	}
	defer resp.Body.Close()
	io.Copy(os.Stdout, resp.Body)
	fmt.Println()
}

func runUi() {
	url := "http://localhost:3000"
	fmt.Printf("Opening UI at %s\n", url)

	var err error
	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	default:
		err = fmt.Errorf("unsupported platform")
	}
	if err != nil {
		fmt.Println("Could not open browser:", err)
	}
}

func checkDaemon() bool {
	client := http.Client{Timeout: 1 * time.Second}
	_, err := client.Get("http://localhost:8081/api/health")
	return err == nil
}

func startDaemon() {
	// Assuming control-plane.exe is in the path or current directory
	// For dev environment, we assume it's in control-plane/control-plane.exe
	cmd := exec.Command("./control-plane/control-plane.exe")
	if runtime.GOOS == "windows" {
		cmd = exec.Command("powershell", "-Command", "Start-Process -FilePath './control-plane/control-plane.exe' -WindowStyle Hidden")
	}
	err := cmd.Start()
	if err != nil {
		fmt.Println("Failed to start daemon:", err)
	}
}
