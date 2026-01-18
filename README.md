# CRAP-Cluster
The **Circular Resource-limited Application Platform** Cluster.

The CRAP-Cluster aims to make old hardware useful by giving it a second chance as a productive part of a cluster / homelab setup. 

---

## ToC

- Installation
- Usage
- Tech Stack
- Contact

---

## Installation

**Clone the repo**
```bash
git clone https://github.com/CoffeeWOSugar/CRAP-Cluster.git
cd CRAP-Cluster
```

**Install dependencies**
```bash
EXAMPLE SETUP
```


**Configuration files**
Add the information about the nodes in the file configuration/nodes.cnf on the following format: 

```bash
# Manager node 
IP-adress

# Worker nodes 
user IP-adress password
user IP-adress password
```


---

## Usage

INSTRUCTIONS

The CRAP-Cluster project is a tool for node connection, cluster configuration, and job scheduling, designed with heterogeneous clusters in mind. 

To use, run ./crap.sh
This will display a help text and options for setting up the cluster as well as scheduling jobs.

The nodes must be reachable from each other, preferably connected via a network switch to allow connection from the manager node via ssh. 


### EXAMPLE
Setting up the cluster and swarm
./crap.sh cluster-up
./crap.sh swarm-init

Scheduling a job with no constraints
./crap.sh schedule -path jobs/DockerStackDemo

Scheduling a job on node with GPU at 12:00 today
./crap.sh schedule \
    -path jobs/HelloWorldMPIStack \
    -time 12:00 today \
    gpu=true


---

## Tech Stack


- Docker 
- Docker Swarm 
- React
- Vite.js
- Electron

---

## Contact
Project link: [CRAP-Cluster](https://github.com/CoffeeWOSugar/CRAP-Cluster)
