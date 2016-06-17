#!/usr/bin/env python
from pru_speak import pru_speak

# Copy the signal on pin P8_16 to P9_31
code = '''\
SCRIPT
SET var1, DIO[14]
SET DIO[0], var1
GOTO 0
ENDSCRIPT
RUN
'''

halt = '''\
HALT
'''

ret = pru_speak.execute_instruction(code)
print ret
