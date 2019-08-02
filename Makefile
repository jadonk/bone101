DESTDIR:=
PREFIX:=/usr/local
CLOUD9_DIR:=/var/lib
CLOUD9_NAME:=/cloud9
JEKYLL:=$(shell which jekyll)
HTMLPROOFER:=$(shell which htmlproofer)

all: ./bone101

./bone101: Makefile _config.yml
ifdef JEKYLL
	$(JEKYLL) build -d ./bone101
else
	$(error jekyll not installed)
endif

clean:
	rm -rf ./bone101

test:
ifdef HTMLPROOFER
	$(HTMLPROOFER) "./bone101" --disable-external --alt-ignore "/.*/"  --only-4xx --url-ignore "/#.*/"  --url-swap "/bone101:" --file-ignore "/Support/bone101/UI/","/Support/bone101/PBUI/","/Support/bonecard/create/"
else
	@echo htmlproofer not found
endif

install: ./bone101
	install -m 0755 -d $(DESTDIR)$(PREFIX)/share/bone101
	cp -dr --preserve=mode,timestamp ./bone101/* $(DESTDIR)$(PREFIX)/share/bone101/
	rm -rf $(DESTDIR)$(PREFIX)/share/bone101/debian/
	install -m 0755 -d $(DESTDIR)$(PREFIX)/share/applications
	cp --preserve=mode,timestamp bone101.desktop $(DESTDIR)$(PREFIX)/share/applications/
	install -m 755 bone101.desktop $(DESTDIR)/home/debian/bone101.desktop
	chown debian:debian ${DESTDIR)/home/debian/Desktop/bone101.desktop

.PHONY: clean test install
