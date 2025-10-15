#!/usr/bin/env sh
set -e

sudo apt update -y
sudo apt install -y \
  software-properties-common \
  apt-transport-https \
  ca-certificates \
  lsb-release \
  gnupg \
  curl \
  git \
  build-essential \
  pkg-config \
  libssl-dev \
  zlib1g-dev \
  libbz2-dev \
  libreadline-dev \
  libsqlite3-dev \
  wget \
  llvm \
  libncurses5-dev \
  libncursesw5-dev \
  xz-utils \
  tk-dev \
  libffi-dev \
  liblzma-dev \
  nginx \
  redis-server \
  redis-tools \
  python3-venv \
  python3-pip \
  certbot \
  python3-certbot-nginx \
  unzip

curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g yarn

#sudo mkdir -p /etc/apt/keyrings/
#curl -fsSL https://apt.grafana.com/gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/grafana.gpg
#echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | \
#  sudo tee /etc/apt/sources.list.d/grafana.list > /dev/null
#sudo apt update -y
#sudo apt install -y grafana

curl -fsSL https://sh.rustup.rs | sh -s -- -y --default-toolchain 1.90.0
. "$HOME/.cargo/env"

curl -fsSL https://pyenv.run | bash
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
pyenv install 3.12.0
pyenv global 3.12.0

sudo apt autoremove -y
sudo apt clean