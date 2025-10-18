#!/bin/sh

set -ex

cd /home/ubuntu/arbitration
sh scripts/get-env.sh
git sync
cd /home/ubuntu/arbitration/arb-rs
sysg restart --config sysg.config.yaml