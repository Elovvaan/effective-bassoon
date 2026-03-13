app = "effective-bassoon"
primary_region = "ams"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "8080"
  NODE_ENV = "production"
  API_PREFIX = "/api"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "requests"
    soft_limit = 20
    hard_limit = 25

  [[services.tcp_checks]]
    interval = "10s"
    timeout = "2s"
    grace_period = "20s"
    restart_limit = 0
