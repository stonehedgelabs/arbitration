#!/bin/sh
set -ex
aws secretsmanager get-secret-value --secret-id ".env" --region us-east-2 --query SecretString --output text > .env