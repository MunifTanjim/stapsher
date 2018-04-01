#!/usr/bin/env sh

. .scripts/docker/variables.sh

docker image tag ${image_repo}:${package_version} ${image_repo}:latest
