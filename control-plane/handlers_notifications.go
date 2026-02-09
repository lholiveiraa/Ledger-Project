package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"time"
	"workops/control-plane/models"
)

// syncNotifications ensures that recent events/incidents exist in the persistent Notification table
func syncNotifications() {
	// 1. Recent Incidents (Errors/Warnings)
	var incidents []models.Incident
	db.Where("created_at > ?", time.Now().Add(-24*time.Hour)).Find(&incidents)
	for _, inc := range incidents {
		id := fmt.Sprintf("inc-%d", inc.ID)
		var exists int64
		db.Model(&models.Notification{}).Where("id = ?", id).Count(&exists)
		if exists == 0 {
			nType := "error"
			if inc.Severity == "low" {
				nType = "warning"
			}
			db.Create(&models.Notification{
				ID:        id,
				Title:     fmt.Sprintf("Incident: %s", inc.Title),
				Message:   inc.Description,
				Time:      inc.CreatedAt,
				Type:      nType,
				Read:      false,
				Category:  "system",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			})
		}
	}

	// 2. Recent Deploys (Success/Fail)
	var events []models.Event
	db.Where("type = ? AND created_at > ?", "deploy", time.Now().Add(-24*time.Hour)).Find(&events)
	for _, evt := range events {
		id := fmt.Sprintf("evt-%d", evt.ID)
		var exists int64
		db.Model(&models.Notification{}).Where("id = ?", id).Count(&exists)
		if exists == 0 {
			nType := "info"
			isRead := true
			if evt.Message == "deploy-failed" || strings.Contains(evt.Message, "FAILED") {
				nType = "error"
				isRead = false
			} else if strings.Contains(evt.Message, "SUCCESS") {
				nType = "success"
			}

			db.Create(&models.Notification{
				ID:        id,
				Title:     "Deployment Update",
				Message:   evt.Message,
				Time:      evt.CreatedAt,
				Type:      nType,
				Read:      isRead,
				Category:  "deployment",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			})
		}
	}

	// 3. Work Item Assignments
	var workItems []models.WorkItem
	db.Where("created_at > ?", time.Now().Add(-24*time.Hour)).Find(&workItems)
	for _, item := range workItems {
		id := fmt.Sprintf("wi-%d", item.ID)
		var exists int64
		db.Model(&models.Notification{}).Where("id = ?", id).Count(&exists)
		if exists == 0 {
			db.Create(&models.Notification{
				ID:        id,
				Title:     "Work Item Created",
				Message:   fmt.Sprintf("%s: %s", item.Type, item.Title),
				Time:      item.CreatedAt,
				Type:     "info",
				Read:      false,
				Category:  "work",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			})
		}
	}
}

func handleNotifications(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method == "GET" {
		// Sync first to ensure we have latest data
		syncNotifications()

		var notifications []models.Notification
		db.Find(&notifications)

		// Sort by time desc
		sort.Slice(notifications, func(i, j int) bool {
			return notifications[i].Time.After(notifications[j].Time)
		})

		json.NewEncoder(w).Encode(notifications)
		return
	}

	if r.Method == "POST" {
		// Handle "Mark as Read" or "Delete"
		// Expects JSON: { "action": "read"|"delete", "ids": ["inc-1", "evt-2"], "all": true }
		var req struct {
			Action string   `json:"action"` // read, delete
			IDs    []string `json:"ids"`
			All    bool     `json:"all"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if req.Action == "delete" {
			if len(req.IDs) > 0 {
				db.Where("id IN ?", req.IDs).Delete(&models.Notification{})
			}
		} else {
			// Default to mark read
			if req.All {
				db.Model(&models.Notification{}).Where("read = ?", false).Update("read", true)
			} else if len(req.IDs) > 0 {
				db.Model(&models.Notification{}).Where("id IN ?", req.IDs).Update("read", true)
			}
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	}
}
