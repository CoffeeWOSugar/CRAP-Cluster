FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        openmpi-bin \
        libopenmpi-dev \
        openssh-server && \
    rm -rf /var/lib/apt/lists/*

# SSH daemon needs this
RUN mkdir -p /var/run/sshd

WORKDIR /app
COPY . .

# Build the MPI program
RUN mpicc -O3 -o hello hello_world.c

# Our entrypoint will start sshd, then exec the CMD/command from compose
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

COPY root_entrypoint.sh /usr/local/bin/root_entrypoint.sh
RUN chmod +x /usr/local/bin/root_entrypoint.sh

COPY node_entrypoint.sh /usr/local/bin/node_entrypoint.sh
RUN chmod +x /usr/local/bin/node_entrypoint.sh

ENV ENTRYPOINT_TYPE=node

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Default command (overridden by services)
CMD ["/bin/bash"]

