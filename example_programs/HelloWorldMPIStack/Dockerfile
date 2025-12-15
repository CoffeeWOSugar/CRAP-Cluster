###################################
# BUILD MPI PROGRAM
###################################
FROM ubuntu:22.04 AS build

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        openmpi-bin \
        libopenmpi-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY src/ src/

# Build the MPI program
RUN mpicc -O3 -o hello src/hello_world.c && strip hello

###################################
# SLIM RUNTIME IMAGE
###################################
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# ONLY the runtime dependancies
RUN apt-get update && \ 
    apt-get install -y --no-install-recommends \
      openmpi-bin \
      openssh-server && \
    rm -rf /var/lib/apt/lists/*

# SSH Daemon needs this:
RUN mkdir -p /var/run/sshd/

WORKDIR /app

# Copy the executable
COPY --from=build /app/hello /app/hello

# Copy the entrypoint scripts
COPY docker/entrypoints/ /opt/mpi/bin/
RUN chmod +x /opt/mpi/bin/*.sh

# Copy ssh files
COPY ssh/ /app/ssh/

ENV ENTRYPOINT_TYPE=node

ENTRYPOINT ["/bin/bash", "/opt/mpi/bin/entrypoint.sh"]
CMD ["/bin/bash"]
