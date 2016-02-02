from fabric.api import env

host1 = 'root@172.16.120.162'
host2 = 'root@172.16.120.163'
host3 = 'root@172.16.120.160'
host4 = 'root@172.16.120.161'

env.roledefs = {
    'all': [host3, host2],
    'ceph-nodes' : [host3],
    'admin' : [host3],
    'mon' : [host3],
    'osd' : [host3],
    'calamari' : [host2],
}

# hostname of each host
env.hostnames = {
    'all' : ['ceph', 'calamari'],
    'ceph-nodes' : ['ceph'],
}
env.password = '123456'
# password of each host
env.passwords = {
    host1 : '123456',
    host2 : '123456',
    host3 : '123456',
    host4 : '123456',
}
env.ntp = {
    'server' : [host3],
    'clients' : [host2],
}
# each osd contains osd_path:journal_path
# osd_path can be a folder
env.osd_path = {
    host3: '/home/osd0',
    #host4: '/home/osd0',
}

# items for zabbix
env.zabbix = {
    'server_ip' : '172.16.120.161',
}

# items for calamari
env.calamari = {
    'server_ip' : '172.16.120.163',
    'user' : 'root',
    'email' : 'certusor@certusnet.com.cn',
    'secret' : '123456',
}
