#!/bin/bash
# These are the commands to run on the host so the Bone
#  can access the Internet through the USB connection.
# Run ./ipMasquerade.sh the first time. It will set up the host.
# Run this script if the host is already set up.

hostAddr=192.168.7.1
beagleAddr=192.168.7.2

# Save the /etc/resolv.conf on the Bone in case we mess things up.
ssh root@$beagleAddr "mv -n /etc/resolv.conf /etc/resolv.conf.orig"
# Create our own resolv.conf
cat - << EOF > /tmp/resolv.conf
# This is installed by host.setDNS.sh on the host

EOF

# Look up the nameserver of the host and add it to our resolv.conf
nmcli dev list | grep IP4.DNS | sed 's/IP4.DNS\[.\]:/nameserver/' >> /tmp/resolv.conf
scp /tmp/resolv.conf root@$beagleAddr:/etc

# Tell the beagle to use the host as the gateway.
ssh root@$beagleAddr "/sbin/route add default gw $hostAddr" || true
