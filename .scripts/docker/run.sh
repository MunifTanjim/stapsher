#!/usr/bin/env sh

env_file=${1}

[ -z ${env_file} ] && echo "Environment File must be passed as first argument" && exit

. .scripts/docker/variables.sh

docker container run -d --name ${name} -p 3000:${port} -v ${cache_volume}:${cache_path} -v ${logs}:${logs_path} -v ${secrets}:${secrets_path}:ro --env-file ${env_file} ${image_repo}
