/*
 * Copyright (C) 2018 Jason Kridner <jdk@ti.com>, Texas Instruments Incorporated
 *
 * Concept based on example code from:
 * http://credentiality2.blogspot.com/2015/09/beaglebone-pru-ddr-memory-access.html
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *	* Redistributions of source code must retain the above copyright
 *	  notice, this list of conditions and the following disclaimer.
 *
 *	* Redistributions in binary form must reproduce the above copyright
 *	  notice, this list of conditions and the following disclaimer in the
 *	  documentation and/or other materials provided with the
 *	  distribution.
 *
 *	* Neither the name of Texas Instruments Incorporated nor the names of
 *	  its contributors may be used to endorse or promote products derived
 *	  from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/mman.h>

#define AM33XX_DATARAM0_PHYS_BASE		0x4a300000
#define AM33XX_DATARAM1_PHYS_BASE		0x4a302000
#define AM33XX_PRUSS_SHAREDRAM_BASE		0x4a310000

void main() {
	unsigned int i, j;

	/* Allocate shared memory pointer to PRU0 DATARAM */
	int mem_dev = open("/dev/mem", O_RDWR | O_SYNC);
	volatile void *shared_dataram = mmap(NULL,
		16,	/* grab 16 bytes */
		PROT_READ | PROT_WRITE,
		MAP_SHARED,
		mem_dev,
		AM33XX_PRUSS_SHAREDRAM_BASE
	);

	printf("shared_dataram = %p\n", shared_dataram);
	j = *(unsigned int *)shared_dataram;
	printf("Read 0x%08x\n", j);

	for(i=0; i<10; i++) {
		printf("Writing 0x%08x\n", i);
		*(unsigned int *)shared_dataram = i;
		usleep(1);
		j = *(unsigned int *)shared_dataram;
		printf("Read 0x%08x (0x%08x)\n", j, j^0xAAAAAAAA);
	}
}
