#!/bin/bash

# Exit on any error
set -e

# Get current datetime in format: YYYY.MM.DD.HHMM
datetime=$(date +"%Y.%m.%d.%H%M")
VERSION=$datetime
IMAGE_NAME="jarebear/hbni-itv"

echo "Building Docker image: $IMAGE_NAME:$VERSION"
docker build -t "$IMAGE_NAME:$VERSION" .

echo "Tagging image as latest..."
docker tag "$IMAGE_NAME:$VERSION" "$IMAGE_NAME:latest"

echo "Pushing versioned tag: $VERSION"
docker push "$IMAGE_NAME:$VERSION"

echo "Pushing latest tag..."
docker push "$IMAGE_NAME:latest"

echo "Done!"
