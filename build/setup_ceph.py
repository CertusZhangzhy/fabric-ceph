#!/usr/bin/env python
#-*- coding:utf-8 -*-

import os
from testbed import *
from fabric.api import *


def get_all_nodes():
    
    return [get_hostname(node) for node in env.roledefs['all']]

def get_ceph_nodes():

    return [get_hostname(node) for node in env.roledefs['ceph-nodes']]

def get_mon_nodes():
    
    return [get_hostname(node) for node in env.roledefs['mon']]

def get_osd_nodes():
    
    return [get_hostname(node) for node in env.roledefs['osd']]

def get_host(hostname):

    return env.roledefs['all'][env.hostnames['all'].index(hostname)]

def get_osd_path(hostname):
    
    host = get_host(hostname)
    osd_paths = env.osd_path[host]
    osd_paths = osd_paths.split(';')
    result = [osd_path.strip() for osd_path in osd_paths]
    
    return result


def get_ip(host):
    
    return host[host.find('@') + 1 :] 

def get_hostname(host):

    return env.hostnames['all'][env.roledefs['all'].index(host)] 

def prepare_deploy():

    #write ip&hostname to hosts
    get_host = lambda x:env.roledefs['all'][env.hostnames['all'].index(x)]
    get_ip = lambda x:get_host(x).split('@')[1]
    context = open('/etc/hosts').read()
    for hostname in env.hostnames['all']:
        ip = get_ip(hostname)
        print ip, hostname
        if hostname not in context:
            with open('/etc/hosts','a') as fp:
                fp.write('%s %s\n' % (ip, hostname))
   
    #Config logining in ceph nodes free of ssh-key.
    hostnames = env.hostnames['all']

    cmd = "sed -i 's/^#   StrictHostKeyChecking ask/StrictHostKeyChecking no/' /etc/ssh/ssh_config"
    os.system(cmd)
    os.system('rm -rf ~/.ssh/id_rsa*')
    os.system("ssh-keygen -f ~/.ssh/id_rsa -t rsa -N ''")
    os.system('cat ~/.ssh/id_rsa.pub > authorized_keys')

    for hostname in hostnames:
        with settings(host_string = hostname):
            run('mkdir -p .ssh')
            run('hostnamectl set-hostname %s' % (hostname))
            put('authorized_keys', '/root/.ssh/')
    #hostname
    for node in get_all_nodes():
        with settings(host_string = node):
            run('hostnamectl set-hostname %s' % node)
    #firewall
    for node in get_all_nodes():
        os.system('ssh %s "systemctl stop firewalld"' % node)    

    #clean folder
    script = lambda osd_host, osd_path:'ssh %s "if [ ! -d \"%s\" ];then mkdir %s;else rm -rf %s/*;fi"' % (osd_host, osd_path, osd_path, osd_path)
    for hostname in get_osd_nodes():
        osd_paths = get_osd_path(hostname)
	[os.system(script(hostname, osd_path)) for osd_path in osd_paths]


def deploy():
    
    os.system('mkdir -p /root/my-cluster')
    os.system('rm -rf /root/my-cluster/*')
    os.chdir('/root/my-cluster')
    
    os.system('ceph-deploy new %s' % ' '.join(get_mon_nodes()))

    os.system('ceph-deploy --overwrite-conf mon create-initial')

    with open('ceph.conf', 'a') as f:
        #f.write('osd pool default size = %d\n' % len(env.roledefs['osd']))
        f.write('osd pool default size = 2\n')

    os.system('ceph-deploy --overwrite-conf admin %s' % ' '.join(get_ceph_nodes()))

    keyring = '/etc/ceph/ceph.client.admin.keyring'
    script = lambda node:'scp %s root@%s:/etc/ceph/' % (keyring, node)
    [os.system(script(node)) for node in get_osd_nodes()]

    keyring = '/var/lib/ceph/bootstrap-osd/ceph.keyring'
    script = lambda node:'scp %s root@%s:/var/lib/ceph/bootstrap-osd/' % (keyring, node)
    [os.system(script(node)) for node in get_osd_nodes()]
    
    script = lambda node,osd_path:'ceph-deploy --overwrite-conf osd prepare %s:%s' % (node, osd_path)
    [os.system(script(node, osd_path)) for node in get_osd_nodes() for osd_path in get_osd_path(node)]

    script = lambda node,osd_path:'ceph-deploy osd activate %s:%s' % (node, osd_path)
    [os.system(script(host, osd_path)) for host in get_osd_nodes() for osd_path in get_osd_path(host)]

    os.system('/etc/init.d/ceph -a restart')
    os.system('ceph osd pool delete rbd rbd --yes-i-really-really-mean-it')
    os.system('ceph osd pool create rbd 64')

if __name__ == '__main__':
    prepare_deploy()
    deploy()
