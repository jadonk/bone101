CC:=gcc
CCFLAGS:= -shared -fpic
LIBS:= -lmraa
SRCS:= $(wildcard ./*/*.c)
OBJS:= $(patsubst %.c,%,$(SRCS))

all: $(OBJS)
$(OBJS):
%: %.c
	$(CC) $(CCFLAGS)  -o $@ $< $(LIBS)
clean:
	rm -f $(OBJS)
.PHONY: clean

