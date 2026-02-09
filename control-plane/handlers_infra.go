package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"
	"workops/control-plane/models"
	"workops/control-plane/provider"

	"gorm.io/gorm"
)

// Secrets Handlers

type SetSecretsRequest struct {
	Secrets map[string]string `json:"secrets"` // Key -> Value
}

func handleSecrets(w http.ResponseWriter, r *http.Request) {
	// Extract envID from query for now, assuming /api/secrets?env_id=1
	// In a better router we would use /api/envs/{id}/secrets
	envIDStr := r.URL.Query().Get("env_id")
	if envIDStr == "" {
		http.Error(w, "env_id required", http.StatusBadRequest)
		return
	}
	envID, _ := strconv.Atoi(envIDStr)

	if r.Method == "GET" {
		var secrets []models.Secret
		db.Where("environment_id = ?", envID).Find(&secrets)

		// Mask values
		for i := range secrets {
			if !secrets[i].IsReference {
				secrets[i].Value = "*****"
			}
		}
		json.NewEncoder(w).Encode(secrets)
		return
	}

	if r.Method == "POST" {
		var req SetSecretsRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		var env models.Environment
		if err := db.First(&env, envID).Error; err != nil {
			http.Error(w, "Environment not found", http.StatusNotFound)
			return
		}

		// 1. Update/Create in DB
		for k, v := range req.Secrets {
			var sec models.Secret
			isRef := false
			val := v
			if len(v) > 4 && v[:4] == "ref:" {
				isRef = true
				val = v[4:]
			}

			result := db.Where("environment_id = ? AND key = ?", envID, k).First(&sec)
			if result.Error == gorm.ErrRecordNotFound {
				sec = models.Secret{
					EnvironmentID: uint(envID),
					Key:           k,
					Value:         val,
					IsReference:   isRef,
					Version:       1,
					UpdatedBy:     "admin",
				}
				db.Create(&sec)
			} else {
				sec.Value = val
				sec.IsReference = isRef
				sec.Version++
				sec.UpdatedBy = "admin"
				db.Save(&sec)
			}
		}

		// Audit Log
		db.Create(&models.AuditLog{
			Action:        "secret_update",
			Actor:         "admin", // Mock user
			EnvironmentID: uint(envID),
			Details:       fmt.Sprintf("Updated %d secrets", len(req.Secrets)),
			CreatedAt:     time.Now(),
		})

		// Create Event for Timeline
		db.Create(&models.Event{
			AppID:         env.AppID,
			Type:          "secret-change",
			Message:       fmt.Sprintf("Secrets updated in %s", env.Name),
			EnvironmentID: uint(envID),
			Actor:         "admin",
			CreatedAt:     time.Now(),
		})

		// 2. Sync with Provider
		prov := provider.GetProvider(env.Provider)
		if err := prov.SetSecrets(r.Context(), env, req.Secrets); err != nil {
			http.Error(w, fmt.Sprintf("Failed to sync secrets to provider: %v", err), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "synced"})
	}
}

// Resources Handlers

func handleResources(w http.ResponseWriter, r *http.Request) {
	envIDStr := r.URL.Query().Get("env_id")
	if envIDStr == "" {
		http.Error(w, "env_id required", http.StatusBadRequest)
		return
	}
	envID, _ := strconv.Atoi(envIDStr)

	if r.Method == "GET" {
		var resources []models.Resource
		db.Where("environment_id = ?", envID).Find(&resources)
		json.NewEncoder(w).Encode(resources)
		return
	}

	if r.Method == "POST" {
		var res models.Resource
		if err := json.NewDecoder(r.Body).Decode(&res); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		res.EnvironmentID = uint(envID)
		res.Status = "provisioning"
		db.Create(&res)

		// Trigger async provision (mock)
		go func() {
			// In real world, call Terraform or Cloud API
			// db.Model(&res).Update("status", "ready")
		}()

		json.NewEncoder(w).Encode(res)
	}
}

func handleEnvStatus(w http.ResponseWriter, r *http.Request) {
	envIDStr := r.URL.Query().Get("env_id")
	if envIDStr == "" {
		http.Error(w, "env_id required", http.StatusBadRequest)
		return
	}
	envID, _ := strconv.Atoi(envIDStr)

	var env models.Environment
	if err := db.First(&env, envID).Error; err != nil {
		http.Error(w, "Environment not found", http.StatusNotFound)
		return
	}

	prov := provider.GetProvider(env.Provider)
	status, err := prov.GetStatus(r.Context(), env)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(status)
}
