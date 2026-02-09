package main

import (
	"encoding/json"
	"net/http"
	"time"
	"workops/control-plane/models"
)

func handleUsers(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method == "GET" {
		var users []models.User
		db.Find(&users)
		json.NewEncoder(w).Encode(users)
		return
	}

	if r.Method == "POST" {
		var user models.User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		user.CreatedAt = time.Now()
		user.UpdatedAt = time.Now()
		user.Status = "ACTIVE" // Default
		if user.Role == "" {
			user.Role = "Developer"
		}
		db.Create(&user)
		json.NewEncoder(w).Encode(user)
	}
}

func handleRoles(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method == "GET" {
		var roles []models.Role
		db.Find(&roles)
		json.NewEncoder(w).Encode(roles)
		return
	}
}
