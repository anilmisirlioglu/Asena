#!/usr/bin/env bash

set -eo pipefail

cd "$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

exit_err() {
  echo >&2 "${1}"
  exit 1
}

check_docker_binaries() {
  if [[ -f /usr/bin/docker ]]; then
    DOCKER=/usr/bin/docker
  elif [[ -n $(type docker) ]]; then
    DOCKER=$(type -p docker)
  else
    exit_err "Executable docker binary not found. Please install docker."
  fi
}

build_image() {
  if ! $DOCKER build . -t asena:stable; then
    exit_err "Docker image build error."
  fi
}

configure_systemctl() {
  cp docker/systemd/asena.service /etc/systemd/system/asena.service

  systemctl daemon-reload
  systemctl enable asena.service
}

main() {
  if [[ $EUID -ne 0 ]]; then
    exit_err "This script must be run as root."
  fi

  check_docker_binaries

  build_image

  configure_systemctl

  echo "Service installation successfully finished."
  if [[ "${1}" == '--run' || "${1}" == '-r' ]]; then
    cd docker/
    if ! $DOCKER compose up -d; then
      exit_err "Services could not be started. Please start it manually."
    fi

    systemctl start asena.service
    systemctl status asena.service
  fi
}

# run script
main "$@"
