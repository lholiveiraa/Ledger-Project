package spec

// AppSpec define a estrutura do arquivo workops.yaml
type AppSpec struct {
	Version      string                 `yaml:"version" json:"version"`
	Name         string                 `yaml:"name" json:"name"`
	Services     map[string]ServiceSpec `yaml:"services" json:"services"`
	Resources    map[string]ResourceSpec `yaml:"resources" json:"resources"`
	Environments map[string]EnvOverride `yaml:"environments,omitempty" json:"environments,omitempty"`
}

type ServiceSpec struct {
	Type        string            `yaml:"type" json:"type"` // web, api, worker, cron
	Build       *BuildSpec        `yaml:"build,omitempty" json:"build,omitempty"`
	Image       string            `yaml:"image,omitempty" json:"image,omitempty"`
	Ports       []string          `yaml:"ports,omitempty" json:"ports,omitempty"`
	Routes      []RouteSpec       `yaml:"routes,omitempty" json:"routes,omitempty"`
	Env         map[string]string `yaml:"env,omitempty" json:"env,omitempty"`
	DependsOn   []string          `yaml:"depends_on,omitempty" json:"depends_on,omitempty"`
	HealthCheck *HealthCheckSpec  `yaml:"healthcheck,omitempty" json:"healthcheck,omitempty"`
	// Runtime status (não no yaml)
	Status string `yaml:"-" json:"status,omitempty"`
}

type BuildSpec struct {
	Context    string `yaml:"context" json:"context"`
	Dockerfile string `yaml:"dockerfile,omitempty" json:"dockerfile,omitempty"`
}

type RouteSpec struct {
	Path        string `yaml:"path" json:"path"`
	StripPrefix bool   `yaml:"strip_prefix,omitempty" json:"strip_prefix,omitempty"`
}

type HealthCheckSpec struct {
	Path     string `yaml:"path" json:"path"`
	Interval string `yaml:"interval" json:"interval"`
}

type ResourceSpec struct {
	Type    string `yaml:"type" json:"type"` // db, cache, queue
	Engine  string `yaml:"engine" json:"engine"`
	Version string `yaml:"version,omitempty" json:"version,omitempty"`
	Mode    string `yaml:"mode,omitempty" json:"mode,omitempty"` // local-container, managed
}

type EnvOverride struct {
	Services  map[string]ServiceSpec  `yaml:"services,omitempty" json:"services,omitempty"`
	Resources map[string]ResourceSpec `yaml:"resources,omitempty" json:"resources,omitempty"`
}
