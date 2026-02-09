package models

import (
	"time"

	"gorm.io/gorm"
)

type Project struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Apps      []App          `json:"apps,omitempty"`
}

type App struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	ProjectID uint           `json:"project_id"`
	Name      string         `json:"name"`
	GitRepo   string         `json:"git_repo"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Envs      []Environment  `json:"envs,omitempty"`
}

type Environment struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	AppID        uint       `json:"app_id"`
	Name         string     `json:"name"`          // dev, hml, prod
	Provider     string     `json:"provider"`      // gcp-cloudrun, local
	Config       string     `json:"config"`        // JSON: region, project_id, etc
	IsRestricted bool       `json:"is_restricted"` // Enforce strict permissions
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	Resources    []Resource `json:"resources,omitempty"`
	Secrets      []Secret   `json:"secrets,omitempty"`
}

type AuditLog struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Action        string    `json:"action"` // deploy, secret_update, resource_update
	Actor         string    `json:"actor"`  // user or system
	EnvironmentID uint      `json:"environment_id"`
	TargetID      uint      `json:"target_id"` // ID of the object modified
	Details       string    `json:"details"`
	CreatedAt     time.Time `json:"created_at"`
}

type Secret struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	EnvironmentID uint           `json:"environment_id"`
	Key           string         `json:"key"`
	Value         string         `json:"value"`        // Masked in API
	IsReference   bool           `json:"is_reference"` // If true, Value is a ref to Cloud Secret Manager
	Version       int            `json:"version"`
	UpdatedBy     string         `json:"updated_by"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type Resource struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	EnvironmentID uint           `json:"environment_id"`
	Name          string         `json:"name"`
	Type          string         `json:"type"`     // database, cache, storage
	Provider      string         `json:"provider"` // gcp-cloudsql, aws-rds, etc
	Status        string         `json:"status"`   // provisioning, ready, failed
	Config        string         `json:"config"`   // JSON connection info
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type Release struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	AppID     uint       `json:"app_id"`
	Version   string     `json:"version"` // v1, v2, v1.0.1
	CommitSHA string     `json:"commit_sha"`
	Services  string     `json:"services"` // JSON: [{"name":"web","image":"..."},...]
	CreatedAt time.Time  `json:"created_at"`
	WorkItems []WorkItem `json:"work_items,omitempty" gorm:"many2many:release_work_items;"`
}

type Deployment struct {
	ID            uint        `gorm:"primaryKey" json:"id"`
	ReleaseID     uint        `json:"release_id"`
	EnvironmentID uint        `json:"environment_id"`
	Status        string      `json:"status"` // pending, success, failed, rolled_back
	Logs          string      `json:"logs"`
	CreatedAt     time.Time   `json:"created_at"`
	Release       Release     `json:"release"`
	Environment   Environment `json:"environment"`
}

type WorkItem struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	AppID            uint      `json:"app_id"`
	Title            string    `json:"title"`
	Description      string    `json:"description"`
	Type             string    `json:"type"`   // feature, bug, chore, incident
	Status           string    `json:"status"` // todo, doing, done
	Owner            string    `json:"owner"`
	GitHubIssue      string    `json:"github_issue"`      // e.g. "https://github.com/org/repo/issues/123"
	ServicesAffected string    `json:"services_affected"` // JSON array
	TargetEnv        string    `json:"target_env"`        // optional
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	Releases         []Release `json:"releases,omitempty" gorm:"many2many:release_work_items;"`
}

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`   // Admin, Developer, Viewer
	Status    string    `json:"status"` // ACTIVE, PENDING, SUSPENDED
	LastLogin time.Time `json:"last_login"`
	Avatar    string    `json:"avatar"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Role struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Permissions string `json:"permissions"` // JSON array of permissions
}

type Incident struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	AppID            uint      `json:"app_id"`
	Title            string    `json:"title"`
	Description      string    `json:"description"`
	Severity         string    `json:"severity"` // low, medium, high, critical
	Status           string    `json:"status"`   // open, investigating, resolved
	EnvironmentID    uint      `json:"environment_id"`
	ReleaseID        uint      `json:"release_id"` // Release that caused the incident
	Release          Release   `json:"release,omitempty"`
	ServicesAffected string    `json:"services_affected"`
	CreatedAt        time.Time `json:"created_at"`
	ResolvedAt       time.Time `json:"resolved_at"`
}

type Event struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	AppID         uint      `json:"app_id"`
	Type          string    `json:"type"` // deploy, promote, rollback, incident, secret-change, work-link, build
	Message       string    `json:"message"`
	EnvironmentID uint      `json:"environment_id"` // Optional
	ReleaseID     uint      `json:"release_id"`     // Optional
	Service       string    `json:"service"`        // Optional: specific service
	Actor         string    `json:"actor"`          // Who triggered it
	Metadata      string    `json:"metadata"`       // JSON extra info
	CreatedAt     time.Time `json:"created_at"`
}

type Notification struct {
	ID        string    `gorm:"primaryKey" json:"id"` // e.g. "inc-1", "wi-123"
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	Time      time.Time `json:"time"`
	Type      string    `json:"type"` // info, success, warning, error
	Read      bool      `json:"read"`
	Category  string    `json:"category"` // work, system, alert
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
