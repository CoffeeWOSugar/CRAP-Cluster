FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Core dev tools + OpenMPI (C/C++ + OpenMP via GCC)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        openmpi-bin \
        libopenmpi-dev \
        cmake \
        git \
        # performance / debugging tools
        valgrind \
        gdb && \
    rm -rf /var/lib/apt/lists/*

# Non-root user (OpenMPI complains if you run mpirun as root unless you override)
RUN useradd -m hpcuser
USER hpcuser
WORKDIR /home/hpcuser/app

# Copy your code into the image
COPY . .

# Example: build your MPI program here
#   - if you have a Makefile, just: RUN make
# RUN make
#   - or directly:
# RUN mpicc -O3 -fopenmp -o my_mpi_program main.c
#

# Default command – can be overridden by Swarm
CMD ["bash"]
# docker build -t GenericHPCStack:latest .