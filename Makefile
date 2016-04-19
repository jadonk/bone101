all: bone101

bone101:
	jekyll build -d ./bone101

clean:
	rm -rf ./bone101

test:
	htmlproofer ./bone101

install:
	

package:
	
