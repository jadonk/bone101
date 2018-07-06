DESTDIR:=
PREFIX:=/usr/local
CLOUD9_DIR:=/var/lib/cloud9
JEKYLL:=$(shell which jekyll)
HTMLPROOFER:=$(shell which htmlproofer)
NPM:=$(shell which npm)

all: ./bone101

./bone101: Makefile _config.yml
ifdef JEKYLL
	$(JEKYLL) build -d ./bone101
else
	$(error jekyll not installed)
endif
ifdef NPM
	mkdir -p node_modules
	cd node_modules
	$(NPM) install --unsafe-perm=true --progress=false --loglevel=error async@2.0.0-rc.6
	$(NPM) install --unsafe-perm=true --progress=false --loglevel=error sensortag@1.2.2
	cd ..
else
	@echo npm not found
endif

clean:
	rm -rf ./bone101
	rm -rf ./node_modules

test:
ifdef HTMLPROOFER
	$(HTMLPROOFER) "./bone101" --disable-external --alt-ignore "/.*/"  --only-4xx --url-ignore "/#.*/"  --url-swap "/bone101:" --file-ignore "/Support/bone101/UI/","/Support/bone101/PBUI/","/Support/bonecard/create/"
else
	@echo htmlproofer not found
endif

install: ./bone101
	install -m 0755 -d $(DESTDIR)$(PREFIX)/share/bone101
	cp -dr --preserve=mode,timestamp ./bone101/* $(DESTDIR)$(PREFIX)/share/bone101/
	install -m 0755 -d $(DESTDIR)$(CLOUD9_DIR)
	install -m 0755 -d $(DESTDIR)$(CLOUD9_DIR)/.c9
	cp -dr --preserve=mode,timestamp ./.c9/* $(DESTDIR)$(CLOUD9_DIR)/.c9
	install -m 0755 -d $(DESTDIR)$(CLOUD9_DIR)/examples
	cp -dr --preserve=mode,timestamp ./examples/* $(DESTDIR)$(CLOUD9_DIR)/examples
	cp -dr --preserve=mode,timestamp ./LICENSE $(DESTDIR)$(CLOUD9_DIR)
	cp -dr --preserve=mode,timestamp ./README.md $(DESTDIR)$(CLOUD9_DIR)
	install -m 0755 -d $(DESTDIR)$(PREFIX)/share/applications
	cp --preserve=mode,timestamp bone101.desktop $(DESTDIR)$(PREFIX)/share/applications/
	install -m 0755 -d $(DESTDIR)/usr/local/lib/node_modules
	cp -dr --preserve=mode,timestamp node_modules/* $(DESTDIR)/usr/local/lib/node_modules/

.PHONY: clean test install
