#!/bin/sh

set -ex

cd /home/ubuntu/arbitration
sh scripts/get-env.sh
git sync
cd /home/ubuntu/arbitration/arb-rs
cargo build --release
RUST_LOG=debug sysg restart --config sysg.config.yaml