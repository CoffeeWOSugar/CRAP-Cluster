# Ensure docker swarm overlay network exists
docker network create -d overlay mpi-net

# Build the image to be ran on the machines
Docker build -t mpi-test:latest .

# Publish to registry service

# Deploy the stack
docker stack deploy -c compose.yaml mpi-test

# Look at the logs for the output from the project
docker service logs mpi-test