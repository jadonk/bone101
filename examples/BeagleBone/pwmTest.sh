#!/bin/bash
cd /sys/class/pwm/pwmchip0
index=0
echo $index > export
cd pwm$index
echo 1 > enable
echo 1000000000 > period
echo  500000000 > duty_cycle

# universaln
# 0 lrwxrwxrwx 1 root root 0 Feb  8 19:32 pwmchip0 -> ../../devices/platform/ocp/48300000.epwmss/48300200.ehrpwm/pwm/pwmchip0
# 0 lrwxrwxrwx 1 root root 0 Feb  8 19:32 pwmchip2 -> ../../devices/platform/ocp/48302000.epwmss/48302200.ehrpwm/pwm/pwmchip2
# 0 lrwxrwxrwx 1 root root 0 Feb  8 19:32 pwmchip4 -> ../../devices/platform/ocp/48300000.epwmss/48300100.ecap/pwm/pwmchip4
# 0 lrwxrwxrwx 1 root root 0 Feb  8 19:32 pwmchip5 -> ../../devices/platform/ocp/48304000.epwmss/48304100.ecap/pwm/pwmchip5
# 0 lrwxrwxrwx 1 root root 0 Feb  8 19:32 pwmchip6 -> ../../devices/platform/ocp/48304000.epwmss/48304200.ehrpwm/pwm/pwmchip6


# cape-emmc
# 0 lrwxrwxrwx 1 root root 0 Feb  8 19:01 pwmchip0 -> ../../devices/platform/ocp/48300000.epwmss/48300100.ecap/pwm/pwmchip0
# 0 lrwxrwxrwx 1 root root 0 Feb  8 19:01 pwmchip1 -> ../../devices/platform/ocp/48304000.epwmss/48304100.ecap/pwm/pwmchip1
# 0 lrwxrwxrwx 1 root root 0 Feb  8 19:01 pwmchip2 -> ../../devices/platform/ocp/48300000.epwmss/48300200.ehrpwm/pwm/pwmchip2
# 0 lrwxrwxrwx 1 root root 0 Feb  8 19:01 pwmchip4 -> ../../devices/platform/ocp/48302000.epwmss/48302200.ehrpwm/pwm/pwmchip4
# 0 lrwxrwxrwx 1 root root 0 Feb  8 19:01 pwmchip6 -> ../../devices/platform/ocp/48304000.epwmss/48304200.ehrpwm/pwm/pwmchip6

# New universaln
# 0 lrwxrwxrwx 1 root root 0 Feb  9 08:57 pwmchip0 -> ../../devices/platform/ocp/48300000.epwmss/48300200.ehrpwm/pwm/pwmchip0
# 0 lrwxrwxrwx 1 root root 0 Feb  9 08:57 pwmchip2 -> ../../devices/platform/ocp/48302000.epwmss/48302200.ehrpwm/pwm/pwmchip2
# 0 lrwxrwxrwx 1 root root 0 Feb  9 08:57 pwmchip4 -> ../../devices/platform/ocp/48300000.epwmss/48300100.ecap/pwm/pwmchip4
# 0 lrwxrwxrwx 1 root root 0 Feb  9 08:57 pwmchip5 -> ../../devices/platform/ocp/48304000.epwmss/48304200.ehrpwm/pwm/pwmchip5
# 0 lrwxrwxrwx 1 root root 0 Feb  9 08:57 pwmchip7 -> ../../devices/platform/ocp/48304000.epwmss/48304100.ecap/pwm/pwmchip7