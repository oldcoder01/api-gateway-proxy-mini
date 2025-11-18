output "account_id" {
  description = "AWS account ID for the current credentials"
  value       = data.aws_caller_identity.current.account_id
}

output "lambda_function_name" {
  description = "Deployed Lambda function name"
  value       = aws_lambda_function.api.function_name
}

output "http_api_invoke_url" {
  description = "Base URL for the HTTP API"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}
