#!/usr/bin/env sh

env_file=${1}

[ -z ${env_file} ] && echo "Environment File must be passed as first argument" && exit

. .scripts/docker/variables.sh

docker container run --detach \
  --name ${name} \
  --publish ${port}:3000 \
  --volume ${cache_volume}:${cache_path} \
  --volume ${logs}:${logs_path} \
  --volume ${secrets}:${secrets_path}:ro \
  --env-file ${env_file} \
    ${image_repo}
