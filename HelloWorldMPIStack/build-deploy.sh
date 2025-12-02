#!/bin/bash

sudo docker build -t mpi-test:latest .
sudo docker tag mpi-test:latest 192.168.10.3:5000/mpi-test:latest
sudo docker push 192.168.10.3:5000/mpi-test:latest
sudo docker stack deploy -c compose.yaml mpi
