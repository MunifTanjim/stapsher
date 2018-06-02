#!/usr/bin/env sh

package_version=${npm_package_version}

image_repo="muniftanjim/stapsher"
name="stapsher"
port=3000

logs="$(pwd)/logs"
secrets="$(pwd)/secrets"
cache_volume="stapsher_cache"

root_path="/stapsher"
cache_path="${root_path}/cache"
logs_path="${root_path}/logs"
secrets_path="${root_path}/secrets"
