#!/bin/sh

set -ex

cd /home/ubuntu/arbitration/arb-rs

git fetch && git pull && sysg restart --config sysg.config.yaml
