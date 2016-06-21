DESTDIR:=
PREFIX:=/usr/local
CLOUD9_DIR:=/var/lib/cloud9
JEKYLL:=$(shell which jekyll)
HTMLPROOFER:=$(shell which htmlproofer)

all: ./bone101

./bone101: Makefile _config.yml
	$(JEKYLL) build -d ./bone101

clean:
	rm -rf ./bone101

test:
ifdef HTMLPROOFER
	$(HTMLPROOFER) "./bone101" --disable-external --alt-ignore "/.*/"  --only-4xx --url-ignore "/#.*/"  --url-swap "/bone101:" --file-ignore "/Support/bone101/UI/","/Support/bonecard/create/"
else
	@echo htmlproofer not found
endif

install: ./bone101
	install -m 0755 -d $(DESTDIR)$(PREFIX)/share/bone101
	cp -dr --preserve=mode,timestamp ./bone101/* $(DESTDIR)$(PREFIX)/share/bone101/
	cp -dr --preserve=mode,timestamp ./.c9/* $(DESTDIR)$(CLOUD9_DIR)
	cp -dr --preserve=mode,timestamp ./examples/* $(DESTDIR)$(CLOUD9_DIR)
	cp -dr --preserve=mode,timestamp ./LICENSE $(DESTDIR)$(CLOUD9_DIR)
	cp -dr --preserve=mode,timestamp ./README.md $(DESTDIR)$(CLOUD9_DIR)
	install -m 0755 -d $(DESTDIR)$(PREFIX)/share/applications
	cp --preserve=mode,timestamp bone101.desktop $(DESTDIR)$(PREFIX)/share/applications/

.PHONY: clean test install
