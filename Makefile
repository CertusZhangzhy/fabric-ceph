SHELL=bash
# set REAL_BUILD in the env to actually do the build; otherwise,
# presumes existence of BUILD_PRODUCT_TGZ and merely packages

SRC := $(shell pwd)

# set these only if not set with ?=
VERSION ?= 1.0.0
REVISION ?=1
BUILD_PRODUCT_TGZ=$(SRC)/build.tar.gz

RPM_REVISION ?=3
RPMBUILD=$(SRC)/../rpmbuild

rpm:
	mkdir -p $(RPMBUILD)/{SPECS,RPMS,BUILDROOT}
	cp fabric-ceph.spec $(RPMBUILD)/SPECS
	( \
	cd $(RPMBUILD); \
	rpmbuild -bb --define "_topdir $(RPMBUILD)" --define "version $(VERSION)" --define "revision $(RPM_REVISION)" --define "tarname $(BUILD_PRODUCT_TGZ)" SPECS/fabric-ceph.spec; \
	)

# either put the build files into $DESTDIR on Ubuntu, or
# untar them from BUILD_PRODUCT_TGZ on other distros


