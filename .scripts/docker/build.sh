#!/usr/bin/env sh

. .scripts/docker/variables.sh

docker image build . -t ${image_repo}:${package_version}
