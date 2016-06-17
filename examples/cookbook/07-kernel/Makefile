obj-m := hello.o
KDIR  := /lib/modules/$(shell uname -r)/build

all:
	make -C $(KDIR) M=$$PWD
	
clean:
	rm hello.mod.c hello.o modules.order hello.mod.o Module.symvers
