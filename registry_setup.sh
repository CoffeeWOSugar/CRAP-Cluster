# Start registry service on manager node
docker service create --name cluster-registry --publish published=5000,target=5000 --restart-condition=any registry:2
<<<<<<< HEAD

docker network create -d overlay mpi-net

=======
>>>>>>> 595ae6e (Updated registry setup)

# Then push the stack/container to the registry using "docker push cluster-registry:5000/docker_stack_demo:1.0
# And start the service on each machine using docker service create --name docker_stack_demo cluster-registry:5000/docker_stack_demo:1.0
