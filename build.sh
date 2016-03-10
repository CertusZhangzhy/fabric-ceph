#!/bin/bash
#tar cvzf build/ceph-rpms.tgz -C rpms/ .
#files=("ceph-rpms.tgz" "setup_ceph.py" "setup.sh")
#dirs=("calamari" "zabbix")
#for file in ${files[@]}
#do
#    if [ ! -e "build/$file" ];then
#        echo "$file is not available!!!"
#	exit 1
#    fi
#done
#for dir in ${dirs[@]}
#do
#    if [ ! -d "build/$dir" ];then
#	echo "$dir is not available!!!"
#	exit 1
#    fi
#done
#tar cvzf build.tar.gz build utils
#make rpm
CEPH_VERSION="0.94.5"

src_url="http://172.16.1.188:8191/svn/icloud/Doc/Trunk/03.研发/3.5现场实施/FlexStorage/buildPkt"
dst_dir="/home/zhangzhy/svn"

build_dir="/home/zhangzhy/github/fabric-ceph"
rpm_dir="/home/zhangzhy/github/fabric-ceph/rpms"
test_dir="/home/zhangzhy/github/fabric-ceph/test_dir"

target_output_dir="/home/zhangzhy/github/rpmbuild/RPMS/x86_64"
target_commit_dir="/home/zhangzhy/svn/buildPkt/flex_storage"
target_name="fabric-ceph*.rpm"

cm_addr="172.16.164.211"
cm_dir="/home/cm/iCloud/flexstorage/buildRPM"

log()
{
    echo "[BUILD_INFO]$1" | tee -a build.log
}

release_info()
{
    log "release info..."
}

update_rpms()
{
	log "Start to update rpms."
	########--update rpms from svn--########
	cd "${dst_dir}"
	rm -rf *
	svn export "${src_url}" --username zhangzhy --password msazzy1524 >> build.log 2>& 1
	########--copy ceph dependency rpms--########
	cd "${dst_dir}/buildPkt/ceph/dependencies"
	cp *.rpm ${rpm_dir}
	cp ${dst_dir}/buildPkt/ceph/ceph-deploy*.rpm ${rpm_dir}
	########--copy fabric rpms--########
	cd "${dst_dir}/buildPkt/other"
	cp python-crypto-*.rpm python-ecdsa-*.rpm python-paramiko-*rpm fabric-*.rpm ${rpm_dir}
	########--copy expect rpms--########
	cp expect-*.rpm tcl-*.rpm ${rpm_dir} 
	########--copy calamari dependency rpms--########
	cp salt*.rpm diamond*.rpm PyYAML*.rpm m2crypto*.rpm python-msgpack*.rpm python-zmq*.rpm ${rpm_dir}
	########--copy zabbix rpms--########
	cd "${dst_dir}/buildPkt/zabbix"
	cp zabbix-*.rpm ${rpm_dir}
	########--copy calamari-server rpms--########
	cd "${dst_dir}/buildPkt/calamari/calamari-server"
	cp calamari-server-*.rpm ${rpm_dir}
	########--copy calamari-client rpms--########
	log "Start to compile calamari-client."
	###python /home/cmBuildFolder/compileFolder/calamari-clients/buildCalamari-clients.py >> /dev/null
	cd /home/cmBuildFolder/RPM/calamari-client
	if [ -e calamari-client*.rpm ];then
		cp calamari-client*.rpm ${rpm_dir}
	else
		log "calamari-client rpm is unavailable!!!"
		exit 1
	fi
	########--copy ceph rpms--########
	#cd /home/cmBuildFolder/RPM/ceph
	cd /home/zhangzhy/packages/${CEPH_VERSION}
	cp *${CEPH_VERSION}*.rpm ${rpm_dir}
	#exit 1
}

pack_rpms()
{
    update_rpms
	cd ${build_dir}
	if [ -d "${rpm_dir}/repodata" ];then
		rm -rf ${rpm_dir}/repodata
	fi
    createrepo ${rpm_dir} > /dev/null
	if [ $? -eq 1 ]
		then
			log "createrepo error!!!"
		exit 1
		else
			log "Createrepo ok."
	fi
    log "Start to build ceph-rpms.tgz."
	if [ -e "build/ceph-rpms.tgz" ];then
		rm -f build/ceph-rpms.tgz
	fi	
    tar cvzf build/ceph-rpms.tgz -C ${rpm_dir} . >> build.log 2>& 1
}

pack_build()
{
    log "Start to generate build.tar.gz."
    files=("ceph-rpms.tgz" "setup_ceph.py" "setup.sh")
    dirs=("calamari" "zabbix")
    for file in ${files[@]}
    do
        if [ ! -e "build/$file" ];then
            echo "$file is not available!!!"
            exit 1
        fi
    done
    for dir in ${dirs[@]}
    do
        if [ ! -d "build/$dir" ];then
            echo "$dir is not available!!!"
            exit 1
        fi
    done
    tar cvzf build.tar.gz build utils >> build.log 2>& 1
}
svn_user="zhangzhy"
svn_password="msazzy1524"
rpm_build()
{
    log "Start to build fabric-ceph rpm."
    make rpm >> build.log 2>& 1
	if [ $? -eq 1 ]
		then
			log "RPM build error!!!"
		exit 1
		else
			log "Successfully build rpm."
	fi
	cp ${target_output_dir}/${target_name} ${target_commit_dir}
	cd ${target_commit_dir}
	log "Import fabric-ceph rpm."
	#scp ${target_name} cm@${cm_addr}:${cm_dir}
	#svn import ${target_name} ${src_url}/flex_storage/ -m "update" --username ${svn_user} --password ${svn_password}
}
>build.log
release_info
pack_rpms
pack_build
rpm_build
