#!/bin/bash

#Loopa igenom ip-addresser i config fil.
    # För varje ip-address:
        # anslut via ssh.
        # Kolla om CRAP-cluster-Node finns
            #gör inget om den finns
            #clona om den inte finns
        # gå in i CRAP-cluster-Node mappen
        # chmod +x build.sh
        # kör build.sh


# while read node;do
#     echo "$node"
# done < nodes.cnf



while IFS="" read -r node || [ -n "$node" ]
do
  arr=($node)
  name="${arr[0]}"
  pass="${arr[1]}"

  echo ">>> connecting to $node"
  sshpass -p $pass ssh -A -R 22222:git@github.com:22 $name << 'EOF'
echo "hej"
EOF

done < nodes.cnf