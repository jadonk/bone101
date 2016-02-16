from Grove_Fingerprint import Fingerprint
import sys

fp = Fingerprint()
if fp.verifyPassword():
    print 'Found device.'
else:
    print 'Device not found'
    sys.exit(0)

def getFingerprintIDez():
    p = fp.getImage()
    if p != fp.FINGERPRINT_OK:
        return -1
    
    p = fp.image2Tz(1) 
    if p != fp.FINGERPRINT_OK:
        return -1

    p = fp.fingerFastSearch()
    if p != fp.FINGERPRINT_OK:
        return -1
    print ' Found ID #', fp.fingerID


while True:
    getFingerprintIDez()
