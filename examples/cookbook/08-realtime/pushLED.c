#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

#include "libsoc_gpio.h"
#include "libsoc_debug.h"

/**
 * 
 * This gpio_test is intended to be run on BeagleBone
 * and reads pin P9_42 (gpio7) and write the value to P9_12 (gpio60).
 *
 * The GPIO_OUTPUT and INPUT defines can be changed to support any two pins.
 * 
 */
 
#define GPIO_OUTPUT  60
#define GPIO_INPUT   7

// Create both gpio pointers
 gpio *gpio_output, *gpio_input;

static int interrupt_count = 0;

int callback_test(void* arg) {
  int* tmp_count = (int*) arg;
  int value;
  
  *tmp_count = *tmp_count + 1;
  value = libsoc_gpio_get_level (gpio_input);
  libsoc_gpio_set_level(gpio_output, value);
  // Comment out the following line to make the code respond faster
  printf("Got it (%d), button = %d\n", *tmp_count, value);
  
  return EXIT_SUCCESS;
}

int main(void) {
  // Enable debug output
  libsoc_set_debug(1);

  // Request gpios
  gpio_output = libsoc_gpio_request(GPIO_OUTPUT, LS_SHARED);
  gpio_input = libsoc_gpio_request(GPIO_INPUT, LS_SHARED);

  // Set direction to OUTPUT
  libsoc_gpio_set_direction(gpio_output, OUTPUT);
  
  // Set direction to INPUT
  libsoc_gpio_set_direction(gpio_input, INPUT);

  // Set edge to BOTH
  libsoc_gpio_set_edge(gpio_input, BOTH);

  // Setup callback
  libsoc_gpio_callback_interrupt(gpio_input, &callback_test, 
                      (void*) &interrupt_count);
  
  printf("Push the button...\n"); 
  // Disaple debug output so the code will respond faster
  libsoc_set_debug(0);

  sleep(10);
  
  libsoc_set_debug(1);
 
  // Cancel the callback on interrupt
  libsoc_gpio_callback_interrupt_cancel(gpio_input);
  
  //If gpio_request was successful
  if (gpio_input) { // Free gpio request memory
    libsoc_gpio_free(gpio_input);
  }
  
  if (gpio_output) { // Free gpio request memory
    libsoc_gpio_free(gpio_output);
  }
  
  return EXIT_SUCCESS;
}
