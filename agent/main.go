package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"workops/spec"
)

var runtime *RuntimeWrapper

func main() {
	runtimeCmd := os.Getenv("WORKOPS_RUNTIME")
	if runtimeCmd == "" {
		runtimeCmd = "docker"
	}
	runtime = NewRuntime(runtimeCmd)

	http.HandleFunc("/api/up", handleUp)
	http.HandleFunc("/api/down", handleDown)
	http.HandleFunc("/api/status", handleStatus)
	http.HandleFunc("/api/logs", handleLogs)

	// CORS simples para desenvolvimento
	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			if r.Method == "OPTIONS" {
				return
			}
			next.ServeHTTP(w, r)
		})
	}

	port := "8080"
	fmt.Printf("Agent listening on port %s using runtime '%s'...\n", port, runtimeCmd)
	log.Fatal(http.ListenAndServe(":"+port, corsMiddleware(http.DefaultServeMux)))
}

func handleUp(w http.ResponseWriter, r *http.Request) {
	var app spec.AppSpec
	if err := json.NewDecoder(r.Body).Decode(&app); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 1. Criar network
	netName := "workops-" + app.Name
	runtime.CreateNetwork(netName)

	// 2. Processar Services
	for name, svc := range app.Services {
		// Build se necessário
		if svc.Build != nil {
			imageTag := app.Name + "-" + name + ":latest"
			if err := runtime.BuildImage(imageTag, svc.Build.Context); err != nil {
				log.Printf("Error building %s: %v", name, err)
				http.Error(w, fmt.Sprintf("Build failed for %s", name), http.StatusInternalServerError)
				return
			}
			svc.Image = imageTag
		}

		// Run
		containerName := app.Name + "-" + name
		if err := runtime.RunContainer(containerName, svc.Image, svc.Ports, svc.Env, netName); err != nil {
			log.Printf("Error running %s: %v", name, err)
			http.Error(w, fmt.Sprintf("Run failed for %s", name), http.StatusInternalServerError)
			return
		}
	}

	// 3. Processar Resources (Db, etc)
	for name, res := range app.Resources {
		containerName := app.Name + "-" + name
		image := ""
		env := make(map[string]string)
		ports := []string{}

		switch res.Engine {
		case "postgres":
			image = "postgres:14-alpine"
			env["POSTGRES_PASSWORD"] = "postgres" // MVP hardcoded
			ports = []string{"5432:5432"}
		case "redis":
			image = "redis:alpine"
			ports = []string{"6379:6379"}
		}

		if image != "" {
			if err := runtime.RunContainer(containerName, image, ports, env, netName); err != nil {
				log.Printf("Error running resource %s: %v", name, err)
			}
		}
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "App started successfully")
}

func handleDown(w http.ResponseWriter, r *http.Request) {
	// MVP: Stop all containers listed in payload or just try to stop based on pattern?
	// Para simplificar, vamos assumir que o cliente manda os nomes ou o AppSpec para sabermos o que derrubar.
	// Aqui vou simplificar: Recebe AppSpec para saber os nomes.
	var app spec.AppSpec
	if err := json.NewDecoder(r.Body).Decode(&app); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	for name := range app.Services {
		runtime.StopContainer(app.Name + "-" + name)
	}
	for name := range app.Resources {
		runtime.StopContainer(app.Name + "-" + name)
	}
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "App stopped")
}

func handleStatus(w http.ResponseWriter, r *http.Request) {
	containers, err := runtime.ListContainers()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"containers": containers,
	})
}

func handleLogs(w http.ResponseWriter, r *http.Request) {
	service := r.URL.Query().Get("service")
	logs, err := runtime.GetLogs(service, 100)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write([]byte(logs))
}
