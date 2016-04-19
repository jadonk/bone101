PREFIX:=/usr/local

all: ./bone101

./bone101: Makefile _config.yml
	jekyll build -d ./bone101

clean:
	rm -rf ./bone101

test:
	htmlproofer ./bone101

install: ./bone101
	install -m 0755 -d $(PREFIX)/share/bone101
	cp -dr --preserve=mode,timestamp ./bone101/* $(PREFIX)/share/bone101/

package:
	

.PHONY: clean test install package
