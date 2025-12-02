FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        openmpi-bin \
        libopenmpi-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# Build the MPI program
RUN mpicc -O3 -o hello hello_world.c

CMD ["mpirun", "--allow-run-as-root", "/app/hello"]
