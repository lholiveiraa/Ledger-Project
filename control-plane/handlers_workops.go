package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"workops/control-plane/models"
)

type LinkRequest struct {
	WorkItemID uint `json:"work_item_id"`
	ReleaseID  uint `json:"release_id"`
}

func handleWorkItems(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		appID := r.URL.Query().Get("app_id")
		var items []models.WorkItem
		query := db.Preload("Releases")
		if appID != "" {
			query = query.Where("app_id = ?", appID)
		}
		query.Find(&items)
		json.NewEncoder(w).Encode(items)
		return
	}
	if r.Method == "POST" {
		var item models.WorkItem
		if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if item.Status == "" {
			item.Status = "todo"
		}
		db.Create(&item)
		json.NewEncoder(w).Encode(item)
	}
}

func handleIncidents(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		appID := r.URL.Query().Get("app_id")
		var incidents []models.Incident
		query := db.Preload("Release.WorkItems")
		if appID != "" {
			query = query.Where("app_id = ?", appID)
		}
		query.Find(&incidents)
		json.NewEncoder(w).Encode(incidents)
		return
	}
	if r.Method == "POST" {
		var inc models.Incident
		if err := json.NewDecoder(r.Body).Decode(&inc); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		db.Create(&inc)
		// Auto-create event
		event := models.Event{
			AppID:         inc.AppID,
			Type:          "incident",
			Message:       fmt.Sprintf("Incident opened: %s", inc.Title),
			EnvironmentID: inc.EnvironmentID,
			ReleaseID:     inc.ReleaseID,
		}
		db.Create(&event)
		json.NewEncoder(w).Encode(inc)
	}
}

func handleLinkWorkItem(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req LinkRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var item models.WorkItem
	if err := db.First(&item, req.WorkItemID).Error; err != nil {
		http.Error(w, "WorkItem not found", http.StatusNotFound)
		return
	}
	var release models.Release
	if err := db.First(&release, req.ReleaseID).Error; err != nil {
		http.Error(w, "Release not found", http.StatusNotFound)
		return
	}

	if err := db.Model(&release).Association("WorkItems").Append(&item); err != nil {
		http.Error(w, "Failed to link", http.StatusInternalServerError)
		return
	}

	// Create Event
	db.Create(&models.Event{
		AppID:     release.AppID,
		Type:      "work-link",
		Message:   fmt.Sprintf("Linked %s #%d to Release %s", item.Type, item.ID, release.Version),
		ReleaseID: release.ID,
		Actor:     "user", // TODO: get from auth context
		Metadata:  fmt.Sprintf(`{"work_item_id": %d, "title": "%s"}`, item.ID, item.Title),
		CreatedAt: time.Now(),
	})

	json.NewEncoder(w).Encode(map[string]string{"status": "linked"})
}
