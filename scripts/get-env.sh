#!/bin/sh
set -ex
cd /home/ubuntu/arbitration
aws secretsmanager get-secret-value --secret-id ".env" --region us-east-2 --query SecretString --output text > .env