package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"time"

	"workops/control-plane/models"
	"workops/control-plane/provider"
)

func handleLogs(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	envIDStr := r.URL.Query().Get("env_id")
	service := r.URL.Query().Get("service")
	releaseID := r.URL.Query().Get("release_id")
	linesStr := r.URL.Query().Get("lines")

	envID, err := strconv.Atoi(envIDStr)
	if err != nil {
		http.Error(w, "Invalid env_id", http.StatusBadRequest)
		return
	}

	var env models.Environment
	if err := db.First(&env, envID).Error; err != nil {
		http.Error(w, "Environment not found", http.StatusNotFound)
		return
	}

	lines := 100
	if linesStr != "" {
		if l, err := strconv.Atoi(linesStr); err == nil {
			lines = l
		}
	}

	prov := provider.GetProvider(env.Provider)
	logs, err := prov.GetLogs(r.Context(), env, service, releaseID, lines)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to fetch logs: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(logs)
}

func handleEvents(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	envIDStr := r.URL.Query().Get("env_id")
	service := r.URL.Query().Get("service")
	releaseIDStr := r.URL.Query().Get("release_id")
	eventType := r.URL.Query().Get("type")

	query := db.Model(&models.Event{}).Order("created_at desc")

	if envIDStr != "" {
		query = query.Where("environment_id = ?", envIDStr)
	}
	if service != "" {
		query = query.Where("service = ?", service)
	}
	if releaseIDStr != "" {
		query = query.Where("release_id = ?", releaseIDStr)
	}
	if eventType != "" {
		query = query.Where("type = ?", eventType)
	}

	var events []models.Event
	if err := query.Find(&events).Error; err != nil {
		http.Error(w, "Failed to fetch events", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	envIDStr := r.URL.Query().Get("env_id")
	envID, err := strconv.Atoi(envIDStr)
	if err != nil {
		http.Error(w, "Invalid env_id", http.StatusBadRequest)
		return
	}

	var env models.Environment
	if err := db.First(&env, envID).Error; err != nil {
		http.Error(w, "Environment not found", http.StatusNotFound)
		return
	}

	prov := provider.GetProvider(env.Provider)
	status, err := prov.GetStatus(r.Context(), env)
	if err != nil {
		// Just return empty or partial if status check fails
		status = map[string]interface{}{"status": "unknown", "error": err.Error()}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}

func handleComparison(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	sourceIDStr := r.URL.Query().Get("source")
	targetIDStr := r.URL.Query().Get("target")

	if sourceIDStr == "" || targetIDStr == "" {
		http.Error(w, "source and target env IDs required", http.StatusBadRequest)
		return
	}

	sourceID, _ := strconv.Atoi(sourceIDStr)
	targetID, _ := strconv.Atoi(targetIDStr)

	var source, target models.Environment
	if err := db.Preload("Secrets").Preload("Resources").First(&source, sourceID).Error; err != nil {
		http.Error(w, "Source environment not found", http.StatusNotFound)
		return
	}
	if err := db.Preload("Secrets").Preload("Resources").First(&target, targetID).Error; err != nil {
		http.Error(w, "Target environment not found", http.StatusNotFound)
		return
	}

	diff := map[string]interface{}{
		"source_env":      source.Name,
		"target_env":      target.Name,
		"source_provider": source.Provider,
		"target_provider": target.Provider,
		"source_config":   source.Config,
		"target_config":   target.Config,
		"secrets_diff":    []string{},
		"config_diff":     source.Config != target.Config,
	}

	// Compare Secrets keys (not values)
	sourceKeys := make(map[string]bool)
	for _, s := range source.Secrets {
		sourceKeys[s.Key] = true
	}
	for _, s := range target.Secrets {
		if !sourceKeys[s.Key] {
			diff["secrets_diff"] = append(diff["secrets_diff"].([]string), fmt.Sprintf("Missing in %s: %s", source.Name, s.Key))
		}
	}
	for _, s := range source.Secrets {
		found := false
		for _, ts := range target.Secrets {
			if ts.Key == s.Key {
				found = true
				break
			}
		}
		if !found {
			diff["secrets_diff"] = append(diff["secrets_diff"].([]string), fmt.Sprintf("Missing in %s: %s", target.Name, s.Key))
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(diff)
}

func handleMetrics(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	envIDStr := r.URL.Query().Get("env_id")

	// Last 24 hours
	start := time.Now().Add(-24 * time.Hour)

	var events []models.Event
	query := db.Where("created_at > ?", start)
	if envIDStr != "" {
		query = query.Where("environment_id = ?", envIDStr)
	}
	query.Find(&events)

	type MetricPoint struct {
		Time    string `json:"time"`
		Errors  int    `json:"errors"`
		Deploys int    `json:"deploys"`
		Latency int    `json:"latency"` // Mocked/Derived
	}

	buckets := make(map[string]*MetricPoint)

	// Fill last 6 hours buckets to ensure chart has data
	for i := 5; i >= 0; i-- {
		t := time.Now().Add(time.Duration(-i) * time.Hour).Format("15:00")
		buckets[t] = &MetricPoint{Time: t, Latency: 40} // Base latency
	}

	for _, e := range events {
		bucketTime := e.CreatedAt.Format("15:00")
		if _, ok := buckets[bucketTime]; !ok {
			buckets[bucketTime] = &MetricPoint{Time: bucketTime, Latency: 40}
		}

		if e.Type == "incident" || e.Type == "rollback" {
			buckets[bucketTime].Errors++
		} else if e.Type == "deploy" {
			buckets[bucketTime].Deploys++
		}
	}

	var result []MetricPoint
	for _, v := range buckets {
		result = append(result, *v)
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Time < result[j].Time
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}
