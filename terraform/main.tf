# Akamai Connected Cloud (Linode) Infrastructure
# Migration from Digital Ocean

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    linode = {
      source  = "linode/linode"
      version = "~> 2.0"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "linode" {
  token = var.linode_token
}

# Variables
variable "linode_token" {
  description = "Linode API token"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "Linode region"
  type        = string
  default     = "us-east" # Newark, NJ - good latency for US East
}

variable "instance_type" {
  description = "Linode instance type"
  type        = string
  default     = "g6-standard-1" # 2GB RAM, 1 CPU - equivalent to DO Basic Droplet
}

variable "root_password" {
  description = "Root password for the Linode instance"
  type        = string
  sensitive   = true
}

variable "authorized_keys" {
  description = "SSH public keys for access"
  type        = list(string)
  default     = []
}

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
  default     = "production"
}

# Main web server instance
resource "linode_instance" "web_server" {
  label           = "lot-computer-${var.environment}"
  region          = var.region
  type            = var.instance_type
  image           = "linode/ubuntu22.04"
  root_pass       = var.root_password
  authorized_keys = var.authorized_keys
  backups_enabled = true

  tags = [
    "lot-computer",
    var.environment,
    "web-server"
  ]

  # Provisioning script
  stackscript_id = linode_stackscript.setup.id
  stackscript_data = {
    "ENVIRONMENT" = var.environment
  }
}

# StackScript for initial server setup
resource "linode_stackscript" "setup" {
  label       = "lot-computer-setup"
  description = "Initial setup script for LOT-Computer web server"
  script      = file("${path.module}/scripts/setup.sh")
  images      = ["linode/ubuntu22.04"]
  rev_note    = "Initial version"
}

# Firewall for the web server
resource "linode_firewall" "web_firewall" {
  label = "lot-computer-firewall"

  inbound {
    label    = "allow-ssh"
    action   = "ACCEPT"
    protocol = "TCP"
    ports    = "22"
    ipv4     = ["0.0.0.0/0"]
    ipv6     = ["::/0"]
  }

  inbound {
    label    = "allow-http"
    action   = "ACCEPT"
    protocol = "TCP"
    ports    = "80"
    ipv4     = ["0.0.0.0/0"]
    ipv6     = ["::/0"]
  }

  inbound {
    label    = "allow-https"
    action   = "ACCEPT"
    protocol = "TCP"
    ports    = "443"
    ipv4     = ["0.0.0.0/0"]
    ipv6     = ["::/0"]
  }

  inbound_policy  = "DROP"
  outbound_policy = "ACCEPT"

  linodes = [linode_instance.web_server.id]
}

# NodeBalancer for load balancing (optional, for scaling)
resource "linode_nodebalancer" "web_lb" {
  count  = var.environment == "production" ? 1 : 0
  label  = "lot-computer-lb"
  region = var.region

  tags = [
    "lot-computer",
    var.environment
  ]
}

resource "linode_nodebalancer_config" "web_lb_config" {
  count           = var.environment == "production" ? 1 : 0
  nodebalancer_id = linode_nodebalancer.web_lb[0].id
  port            = 443
  protocol        = "https"
  algorithm       = "roundrobin"
  check           = "http"
  check_path      = "/health"
  check_interval  = 30
  check_timeout   = 5
  check_attempts  = 3
  ssl_cert        = file("${path.module}/certs/server.crt")
  ssl_key         = file("${path.module}/certs/server.key")
}

resource "linode_nodebalancer_node" "web_node" {
  count           = var.environment == "production" ? 1 : 0
  nodebalancer_id = linode_nodebalancer.web_lb[0].id
  config_id       = linode_nodebalancer_config.web_lb_config[0].id
  label           = "lot-computer-node"
  address         = "${linode_instance.web_server.private_ip_address}:80"
  weight          = 100
}

# Object Storage bucket for static assets (optional)
resource "linode_object_storage_bucket" "assets" {
  cluster = "${var.region}-1"
  label   = "lot-computer-assets-${var.environment}"
}

# Outputs
output "server_ip" {
  description = "Public IP address of the web server"
  value       = linode_instance.web_server.ip_address
}

output "server_ipv6" {
  description = "IPv6 address of the web server"
  value       = linode_instance.web_server.ipv6
}

output "nodebalancer_hostname" {
  description = "NodeBalancer hostname (production only)"
  value       = var.environment == "production" ? linode_nodebalancer.web_lb[0].hostname : null
}

output "object_storage_endpoint" {
  description = "Object storage endpoint for static assets"
  value       = "https://${linode_object_storage_bucket.assets.cluster}.linodeobjects.com/${linode_object_storage_bucket.assets.label}"
}
