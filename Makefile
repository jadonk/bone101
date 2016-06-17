PREFIX:=/usr/local
CLOUD9_DIR:=/var/lib/cloud9

all: ./bone101

./bone101: Makefile _config.yml
	if [ -e /etc/profile.d/rvm.sh ] ; then . /etc/profile.d/rvm.sh ; fi
	jekyll build -d ./bone101

clean:
	rm -rf ./bone101

test:
	if [ -e /etc/profile.d/rvm.sh ] ; then . /etc/profile.d/rvm.sh ; fi
	htmlproofer "./bone101" --disable-external --alt-ignore "/.*/"  --only-4xx --url-ignore "/#.*/"  --url-swap "/bone101:" --file-ignore "/Support/bone101/UI/","/Support/bonecard/create/"

install: ./bone101
	install -m 0755 -d $(PREFIX)/share/bone101
	cp -dr --preserve=mode,timestamp ./bone101/* $(PREFIX)/share/bone101/
	cp -dr --preserve=mode,timestamp ./.c9/* $(CLOUD9_DIR)
	cp -dr --preserve=mode,timestamp ./examples/* $(CLOUD9_DIR)
	cp -dr --preserve=mode,timestamp ./LICENSE $(CLOUD9_DIR)
	cp -dr --preserve=mode,timestamp ./README.md $(CLOUD9_DIR)
	install -m 0755 -d $(PREFIX)/share/applications
	cp --preserve=mode,timestamp bone101.desktop $(PREFIX)/share/applications/

package:
	

.PHONY: clean test install package
