#!/bin/bash

# create repo
cat << __EOT__ > /etc/yum.repos.d/fabric-ceph.repo
[fabric-ceph]
name=fabric-ceph
baseurl=file:///opt/fabric-ceph/ceph-packages/
enabled=1
priority=1
gpgcheck=0
__EOT__

if [ -d /opt/fabric-ceph/ceph-packages ]; then
    rm -rf /opt/fabric-ceph/ceph-packages
fi

# copy files over
mkdir -p /opt/fabric-ceph/ceph-packages
mkdir -p /opt/fabric-ceph/bin

cd /opt/fabric-ceph/ceph-packages; tar xvzf /opt/fabric-ceph/build/ceph-rpms.tgz
cd /opt/fabric-ceph/bin; cp -f /opt/fabric-ceph/build/setup_ceph.py ./ 

# Remove existing python-crypto-2.0.1 rpm.
yum -y --disablerepo=* remove python-crypto-2.0.1

# Install basic packages 
yum -y --disablerepo=* --enablerepo=fabric-ceph install fabric

