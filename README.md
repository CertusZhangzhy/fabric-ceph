fabric-ceph
===================================
``fabric-ceph`` is a tool to install config and deploy ceph cluster, which supports:
* ceph 0.94.5
* Automatically configure SSH password-free access
* Batch install and uninstall ceph
* Automatic deployment and purge CEPH
* Automatic install, uninstall and config zabbix-agent
* Automatic install, uninstall and config calamari


Building fabric-ceph
-----------------------------------
    cd fabric-ceph
    ./build.sh

Installing fabric-ceph
-----------------------------------
    rpm -ivh fabric-ceph-1.0.0-3.x86_64.rpm
By this command, revelent files will be extracted to /opt/abric-ceph.
Useage
-----------------------------------
    fab install_rpm_all:...
    fab create_install_repo
    fab install_ceph
    ... ...
For more information, please refer to ``instruction``.
