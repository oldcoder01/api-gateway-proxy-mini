variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-1"
}

variable "project_name" {
  description = "Base name for resources"
  type        = string
  default     = "api-gateway-proxy-mini"
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "tfdev"
}

variable "lambda_zip_path" {
  description = "Path to the Lambda deployment zip, relative to this Terraform folder"
  type        = string
  default     = "../../lambda-package.zip"
}

variable "db_host" {
  description = "Host of the existing Postgres database (RDS endpoint)"
  type        = string
}

variable "db_port" {
  description = "Postgres port"
  type        = number
  default     = 5432
}

variable "db_name" {
  description = "Postgres database name"
  type        = string
  default     = "app_db"
}

variable "db_username" {
  description = "Database username"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}
