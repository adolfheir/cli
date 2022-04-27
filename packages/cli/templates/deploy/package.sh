#! /bin/bash
set -e

export DOCKER_CLI_EXPERIMENTAL=enabled
export DOCKER_BUILDX_PLATFORM=linux/amd64
export DOCKER_IMAGE_REPO=ihouqi-docker.pkg.coding.net/shipinanquan
export CI_PROJECT_NAMESPACE=web-project
export CI_PROJECT_NAME=${DEPOT_NAME}
export CI_COMMIT_REF_NAME=${BRANCH_NAME}
export CI_PIPELINE_ID=${CI_BUILD_NUMBER}

export IMAGE_NAME="${DOCKER_IMAGE_REPO}/${CI_PROJECT_NAMESPACE}/${CI_PROJECT_NAME}:${CI_COMMIT_REF_NAME//\//-}-${CI_PIPELINE_ID}"

echo ${IMAGE_NAME}

docker buildx build --platform ${DOCKER_BUILDX_PLATFORM} -t ${IMAGE_NAME} -f Dockerfile . --push

