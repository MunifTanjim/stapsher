#!/usr/bin/env sh

. .scripts/docker/variables.sh

container_id=$(docker container ls -aqf name=^/${name}$)

[ -z ${container_id} ] || docker container rm -f ${container_id}
