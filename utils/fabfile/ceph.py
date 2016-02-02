#!/usr/bin/env python
#-*- coding:utf-8 -*-

import sys
reload(sys)
import os
import ast
import tempfile
import time

from fabric.api import *
from testbeds.testbed import *
'''
class Logger(object):
    def __init__(self, filename = '/opt/fabric-ceph/fabric-ceph.log'):
        self.terminal = sys.stdout
        self.log = open(filename, 'a')

    def write(self, message):
        self.terminal.write(message)
	self.log.write(message)

    def isatty(self):
	return self.terminal.isatty()

    def flush(self):
        self.terminal.flush()
        self.log.flush()

sys.stdout = Logger()
'''
def get_linux_distro():
    linux_distro = "python -c 'from platform import linux_distribution; print linux_distribution()'"
    (dist, version, extra) = ast.literal_eval(run(linux_distro))
    return (dist, version, extra)

def detect_ostype():
    (dist, version, extra) = get_linux_distro()
    if extra is not None and 'xen' in extra:
        dist = 'xen'

    if 'red hat' in dist.lower():
        dist = 'redhat'
    elif 'centos linux' in dist.lower():
        dist = 'centos'

    return dist.lower()
#end detect_ostype

def get_build(pkg='fabric-ceph'):
    pkg_rel = None
    dist = detect_ostype()
   
    if dist in ['centos', 'fedora', 'redhat']:
        cmd = "rpm -q --queryformat '%%{RELEASE}' %s" %pkg
    elif dist in ['ubuntu']:
        cmd = "dpkg -s %s | grep Version: | cut -d' ' -f2 | cut -d'-' -f2" %pkg
    pkg_rel = run(cmd)
    if 'is not installed' in pkg_rel or 'is not available' in pkg_rel:
        print "Package %s not installed." % pkg
        return None
    return pkg_rel

@task
@roles('all')
def install_rpm_all(rpm):
    """Installs any rpm/deb package in all nodes."""
    execute('install_pkg_node', rpm, env.host_string)

@task
def install_pkg_node(pkg, *args):
    """Installs any rpm/deb in one node."""
    for host_string in args:
        with settings(host_string=host_string, password=env.password, warn_only=True):
            # Get the package name from .rpm | .deb
            if pkg.endswith('.rpm'):
                pkgname = local("rpm -qpi %s | grep Name | cut -d':' -f2 | cut -d' ' -f2" % pkg, capture=True).strip()
            elif pkg.endswith('.deb'):
                pkgname = local("dpkg --info %s | grep Package: | cut -d':' -f2" % pkg, capture=True).strip()
            build = get_build(pkgname)
            if build and build in pkg:
                print "Package %s already installed in the node(%s)." % (pkg, host_string)
                continue
            pkg_name = os.path.basename(pkg)
            temp_dir= tempfile.mkdtemp()
            run('mkdir -p %s' % temp_dir)
            put(pkg, '%s/%s' % (temp_dir, pkg_name))
            if pkg.endswith('.rpm'):
                run("yum --disablerepo=* -y localinstall %s/%s" % (temp_dir, pkg_name))
            elif pkg.endswith('.deb'):
                run("dpkg -i %s/%s" % (temp_dir, pkg_name))

@task
def pre_install():
    '''Do some preparations for installation.'''
    with settings(host_string=env.ntp['server'][0], password=env.password, warn_only=True):
        run('echo "server 127.127.1.0">>/etc/ntp.conf')
        run('echo "fudge 127.127.1.0 stratum 8">>/etc/ntp.conf')
	run('systemctl start ntpd')
    for host in env.roledefs['all']:
    	with settings(host_string=host, password=env.password, warn_only=True):
		run('yum remove PackageKit')       
		run("sed -i 's/^SELINUX=.*/SELINUX=disabled/' /etc/selinux/config")
		run('setenforce 0')
        	run('systemctl enable ntpd')
		run('systemctl stop firewalld')
		run('systemctl disable firewalld')
		run('systemctl disable chronyd')
		run('systemctl enable ntpd')
		run('rm -f /etc/localtime')
		run('ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime')
		if host==env.ntp['server'][0]:
                    continue
		ntp_server = env.ntp['server'][0].split('@')[1]
		run('systemctl stop ntpd')
		run('ntpdate %s' % str(ntp_server))
		run('systemctl start ntpd')
    
@task
@roles('all')
def create_install_repo():
    """Create install repo in all nodes."""
    execute("create_install_repo_node", env.host_string)

@task
def create_install_repo_node(*args):
    """Create install repo in one or list of nodes."""
    for host_string in args:
        with settings(host_string=host_string, password=env.password, warn_only=True):
            #run("sed -i 's/^SELINUX=.*/SELINUX=disabled/' /etc/selinux/config")
            #run('setenforce 0')
            #run('systemctl enable ntpd')
            #run('systemctl start ntpd')
            #run('systemctl stop firewalld')
            #run('systemctl disable firewalld')
            #run('rm -f /etc/localtime')
            #run('ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime')
            #run('ntpdate pool.ntp.org')
	    #run('yum remove PackageKit')
            run("sudo /opt/fabric-ceph/build/setup.sh")

@task
def ceph_config_ssh(addr, password):
    """To config openssh without password from ceph-admin to another node."""
    with settings(host_string=addr, password=password, warn_only=True):
        #run('hostnamectl set-hostname %s' % (hostname))
        get('/root/.ssh/authorized_keys', '/tmp/authorized_keys')

    with settings(host_string=env.roledefs['admin'][0], password=env.password, warn_only=True):
        #line = addr+' '+hostname
        #run("sed -i '/%s$/d' /etc/hosts" % (hostname))
        #run('echo %s >> /etc/hosts' % (line))
	run('if [ ! -e /root/.ssh/id_rsa.pub ];then ssh-keygen -f /root/.ssh/id_rsa -t rsa -N \'\';fi')
	get('/root/.ssh/id_rsa.pub', '/tmp/id_rsa.pub')

    #local("sed -i '/%s$/d' /tmp/authorized_keys" % (env.hostnames['ceph-nodes'][0]))
    local('cat /tmp/id_rsa.pub >> /tmp/authorized_keys')

    with settings(host_string=addr, password=password, warn_only=True):
        put('/tmp/authorized_keys', '/root/.ssh/authorized_keys')
    local('rm -f /tmp/id_rsa.pub /tmp/authorized_keys')

@task
@roles('ceph-nodes')
def install_ceph():
    """Install ceph and cpeh-deploy to all ceph-nodes."""
    with settings(password=env.password, warn_only=True):
    	run('yum install --disablerepo=\\* --enablerepo=fabric-ceph -y ceph-deploy')
    	run('yum install --disablerepo=\\* --enablerepo=fabric-ceph -y ceph')

@task
def ceph_clear_dirs():
    """Clear revelent directories of ceph."""
    dirs = ['/etc/ceph/*',\
            '/var/lib/ceph/bootstrap-mds/*',\
	    '/var/lib/ceph/bootstrap-osd/*',\
	    '/var/lib/ceph/mds/*',\
	    '/var/lib/ceph/mon/*',\
	    '/var/lib/ceph/tmp/*',\
	    '/var/lib/ceph/osd/*',\
	    '/var/run/ceph/*',\
	    '/var/log/ceph/*']

    for dir in dirs:
        run('rm -rf %s' % (dir))
    for host in env.osd_path:
        dir = env.osd_path[host]
        run('rm -rf %s/*' % (dir))

@task
def uninstall_ceph():
    """Purge ceph on all ceph-nodes."""
    hostnames = env.hostnames['ceph-nodes']
    with settings(host_string = env.roledefs['admin'][0], password=env.password, warn_only=True):
        run('ceph-deploy purge %s' % ' '.join(hostnames))
        run('ceph-deploy purgedata %s' % ' '.join(hostnames))
        run('ceph-deploy forgetkeys')

    for host in env.roledefs['ceph-nodes']:
        with settings(host_string = host, password=env.password, warn_only=True):
            ceph_clear_dirs()

@task
def ceph_setup_all():
    """Deploy a new ceph cluster."""
    admin_host = env.roledefs['admin'][0]
    with settings(host_string = admin_host, password=env.password, warn_only=True):
        put('/opt/fabric-ceph/utils/fabfile/testbeds/testbed.py', '/opt/fabric-ceph/bin/')
        with cd('/opt/fabric-ceph/bin/'):
	    run('chmod +x setup_ceph.py')
            run('./setup_ceph.py')

@task
@roles('ceph-nodes')
def install_zabbix_agent():
    """Install zabbix_agent to all ceph-nodes."""
    run('yum install --disablerepo=\\* --enablerepo=fabric-ceph -y zabbix')
    run('yum install --disablerepo=\\* --enablerepo=fabric-ceph -y zabbix-agent')
    run('chkconfig zabbix-agent on')

@task
@roles('ceph-nodes')
def config_zabbix_agent():
    """Edit zabbix_agent.conf."""
    execute('config_zabbix_agent_node', env.host_string)

@task
def config_zabbix_agent_node(*args):
    """Edit zabbix_agent.conf on a node."""
    for host_string in args:
        with settings(host_string=host_string, password=env.password, warn_only=True):
            run("sed -i 's/^Server=.*/Server=%s/' /etc/zabbix/zabbix_agentd.conf" % env.zabbix['server_ip'])
            run("sed -i 's/^ServerActive=.*/ServerActive=%s/' /etc/zabbix/zabbix_agentd.conf" % env.zabbix['server_ip'])
            run("sed -i '/^Hostname=.*/d' /etc/zabbix/zabbix_agentd.conf")
	    run("sed -i '/^UnsafeUserParameters=.*/d' /etc/zabbix/zabbix_agentd.conf")
	    #run("echo Hostname=`eval hostname` >> /etc/zabbix/zabbix_agentd.conf")
	    #run('sed -i "/^# Hostname=.*/a Hostname=`eval hostname`" /etc/zabbix/zabbix_agentd.conf')
	    run("sed -i '/# UnsafeUserParameters=.*/a UnsafeUserParameters=1' /etc/zabbix/zabbix_agentd.conf")
            #run("echo UnsafeUserParameters=1 >> /etc/zabbix/zabbix_agentd.conf")
	    run('cp /opt/fabric-ceph/build/zabbix/zabbix_agent_ceph_plugin.conf /etc/zabbix/zabbix_agentd.d/')
            run('cp /opt/fabric-ceph/build/zabbix/ceph-status.sh /opt/')
            run('chmod +x /opt/ceph-status.sh')
	    run('chmod +r /etc/ceph/ceph.client.admin.keyring')
            run("service zabbix-agent start")

@task
@roles('ceph-nodes')
def uninstall_zabbix_agent():
    """Remove zabbix from all ceph-nodes."""
    execute('uninstall_zabbix_agent_node', env.host_string)

@task
def uninstall_zabbix_agent_node(*args):

    for host_string in args:
        with settings(host_string=host_string, password=env.password, warn_only=True):
            run('service zabbix-agent stop')
            run('chkconfig zabbix-agent off')
	    run('rpm -e zabbix-agent')
	    run('rpm -e zabbix')
            run('rm -rf /etc/zabbix/')
            run('rm -rf /var/log/zabbix/')
	    run('rm -rf /var/run/zabbix/')
	    run('rm -f /opt/ceph-status.sh')

@task
@roles('calamari')
def calamari_install_calamari():
    """Install calamari server and client."""
    with settings(warn_only=True, password=env.password):
    	#run("sed -i 's/^SELINUX=.*/SELINUX=disabled/' /etc/selinux/config")
        #run('setenforce 0')
    	#run('systemctl enable ntpd')
    	#run('systemctl start ntpd')
    	#run('rm -f /etc/localtime')
    	#run('ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime')
    	#run('ntpdate pool.ntp.org')
    	run('yum install --disablerepo=\\* --enablerepo=fabric-ceph -y calamari-server tcl expect')
    	client_dir = '/opt/calamari/webapp/content'
    	run('if [ -d %s ];then rm -rf %s/*;else mkdir -p %s;fi' % (client_dir,client_dir,client_dir))
    with cd('/opt/fabric-ceph/build/calamari'):
        file_dirs = ['login','admin','manage','dashboard']
        for dir in file_dirs:
            run('cp -r %s %s/' % (dir,client_dir))
    run('sed -i "/^#ServerName www.example.com:80/a ServerName localhost:80" /etc/httpd/conf/httpd.conf')
    run('systemctl restart httpd')
    put('/opt/fabric-ceph/build/calamari/setup_calamari.sh','/opt/fabric-ceph/bin')
    with cd('/opt/fabric-ceph/bin'):
        run('chmod +x setup_calamari.sh')
	cmd = './setup_calamari.sh'+' '+env.calamari['user']+' '+env.calamari['email']+' '+env.calamari['secret']
	run(cmd)
    #run('calamari-ctl initialize')

@task
def ceph_install_calamari():
    """Install diamond and salt-minion on ceph-nodes."""
    calamari_addr = env.calamari['server_ip']
    minion_dir = "/etc/salt/minion.d"
    for host in env.roledefs['ceph-nodes']:
        with settings(host_string = host, password=env.password, warn_only=True):
            run('yum install --disablerepo=\\* --enablerepo=fabric-ceph -y diamond')
            run('yum install --disablerepo=\\* --enablerepo=fabric-ceph -y PyYAML m2crypto python-msgpack python-zmq')
            run('rpm -ivh /opt/fabric-ceph/build/calamari/salt-2015.5.5-1.el7.noarch.rpm --force')
            run('rpm -ivh /opt/fabric-ceph/build/calamari/salt-minion-2015.5.5-1.el7.noarch.rpm --force')
            run('chkconfig salt-minion on')
            run('chkconfig diamond on')
            run('if [ -d %s ];then rm -rf %s/*;else mkdir -p %s;fi' % (minion_dir,minion_dir,minion_dir))
            run('echo master : %s>%s/calamari.conf' % (calamari_addr,minion_dir))
            run('service salt-minion start')

    with settings(host_string = env.roledefs['calamari'][0], password=env.password, warn_only=True):
	run('salt-key -y -D')

    for host in env.roledefs['ceph-nodes']:
        with settings(host_string = host, password=env.password, warn_only=True):
	    run('service salt-minion restart')

    time.sleep(3)
    with settings(host_string = env.roledefs['calamari'][0], password=env.password, warn_only=True):
        for i in range(3):
            time.sleep(3)
            run('salt-key -y -A')

    time.sleep(3)
    for host in env.roledefs['ceph-nodes']:
        with settings(host_string = host, password=env.password, warn_only=True):
            run('/etc/init.d/diamond stop')
	    time.sleep(3)
	    run('service salt-minion restart')
	    run('rm -f /var/lock/subsys/diamond')
	    loop=0
	    while(1):
		loop = loop + 1
		time.sleep(3)
	        run('rm -f /var/lock/subsys/diamond')
	        ret = run('/etc/init.d/diamond start')
		if 'failed' not in ret:
		    break
		if loop == 5:
		    break
		

@task
def uninstall_calamari():
    """Uninstall_calamari"""
    with settings(host_string=env.roledefs['calamari'][0], password=env.password, warn_only=True):
        run('rpm -e calamari-server')
        run('rm -f /etc/httpd/conf.d/calamari.conf')
        run('rpm -e salt-master')
        run('rm -rf /var/log/salt/* /var/cache/salt/* /etc/salt/* /var/run/salt/*')
    for host in env.roledefs['ceph-nodes']:
        with settings(host_string=host, password=env.password, warn_only=True):
            run('rpm -e salt-minion')
            run('rpm -e salt')
            run('rpm -e diamond')
            run('rm -rf /var/log/salt/* /var/cache/salt/* /etc/salt/* /var/run/salt/*')
            run('rm -rf /etc/diamond/* /var/log/diamond/*')
