#!/bin/bash
if [[ $EUID -ne 0 ]]; then
	echo "This script must be run as root" 
	exit 1
fi

cd $(dirname $0)

# Add test for overlay firmware files

sed -i -e "s/#?uboot_overlay_addr0=.*$/uboot_overlay_pru=\/lib\/firmware\/PB-I2C2-ACCEL-TECHLAB-CAPE.dtbo/;" /boot/uEnv.txt
sed -i -e "s/#?uboot_overlay_addr1=.*$/uboot_overlay_pru=\/lib\/firmware\/PB-PWM-RGB-TECHLAB-CAPE.dtbo/;" /boot/uEnv.txt
sed -i -e "s/#?uboot_overlay_addr2=.*$/uboot_overlay_pru=\/lib\/firmware\/PB-SPI1-7SEG-TECHLAB-CAPE.dtbo/;" /boot/uEnv.txt
sed -i -e "s/#?uboot_overlay_pru=.*RPROC.*$/uboot_overlay_pru=\/lib\/firmware\/AM335X-PRU-RPROC-4-14-TI-00A0.dtbo/;" /boot/uEnv.txt
cp techlab-leds-noroot.rules /etc/udev/rules.d/86-techlab-leds-noroot.rules

echo .
echo Please reboot with 'sudo shutdown -r now'
echo .
