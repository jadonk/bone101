from Grove_Fingerprint import Fingerprint
import sys
import wiringpi2

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
    
    p = fp.image2Tz() 
    if p != fp.FINGERPRINT_OK:
        return -1

    p = fp.fingerFastSearch()
    if p != fp.FINGERPRINT_OK:
        return -1
    print ' Found ID #', fp.fingerID

def getFingerprintEnroll(id):
    p = -1
    print 'waiting fort valid finger to enroll...'
    while p != fp.FINGERPRINT_OK:
        p = fp.getImage()
        if p == fp.FINGERPRINT_OK:
            print 'image taken.'
        elif p == fp.FINGERPRINT_NOFINGER:
            sys.stdout.write('.')
        elif p == fp.FINGERPRINT_PACKETRECIEVEERR:
            print 'Communication error'
        elif p == fp.FINGERPRINT_IMAGEFAIL:
            print 'Image error.'
        else:
            print 'Unknow error.'

    # Success
    p = fp.image2Tz(1)
    if p == fp.FINGERPRINT_OK:
	print 'image converted.'
    elif p == fp.FINGERPRINT_IMAGEMESS:
	print 'Image too messy'
        return p
    elif p == fp.FINGERPRINT_PACKETRECIEVEERR:
	print 'Communication error'
        return p
    elif p == fp.FINGERPRINT_FEATUREFAIL:
	print 'Cound not find fingerprint features'
        return p
    elif p == fp.FINGERPRINT_INVALIDIMAGE:
	print 'Cound not find fingerprint features'
        return p
    else:
	print 'Unknow error.'
        return p
     
    print 'Remove finger.' 
    wiringpi2.delay(2000) 
    p = 0
    while p != fp.FINGERPRINT_NOFINGER:
        p = fp.getImage()

    p = -1
    print 'Place same finger again'
    while p != fp.FINGERPRINT_OK:
        p = fp.getImage()
        if p == fp.FINGERPRINT_OK:
            print 'image taken.'
        elif p == fp.FINGERPRINT_NOFINGER:
            sys.stdout.write('.')
        elif p == fp.FINGERPRINT_PACKETRECIEVEERR:
            print 'Communication error'
        elif p == fp.FINGERPRINT_IMAGEFAIL:
            print 'Image error.'
        else:
            print 'Unknow error.'

  
    # Success
    p = fp.image2Tz(2)
    if p == fp.FINGERPRINT_OK:
	print 'image converted.'
    elif p == fp.FINGERPRINT_IMAGEMESS:
	print 'Image too messy'
        return p
    elif p == fp.FINGERPRINT_PACKETRECIEVEERR:
	print 'Communication error'
        return p
    elif p == fp.FINGERPRINT_FEATUREFAIL:
	print 'Cound not find fingerprint features'
        return p
    elif p == fp.FINGERPRINT_INVALIDIMAGE:
	print 'Cound not find fingerprint features'
        return p
    else:
	print 'Unknow error.'
        return p
    
    # ok converted
    p = fp.createModel()
    if p == fp.FINGERPRINT_OK:
        print 'Prints matched.'
    elif p == fp.FINGERPRINT_PACKETRECIEVEERR:
        print 'Communication error.'
        return p
    elif p == fp.FINGERPRINT_ENROLLMISMATCH:
        print 'Fingerprints did not match.'
        return p
    else:
        print 'Unknow error' 
        return p

    p = fp.storModel(id)
    if p == fp.FINGERPRINT_OK:
        print 'Stored!'
    elif p == fp.FINGERPRINT_PACKETRECIEVEERR:
        print 'Communication error.'
        return p
    elif p == fp.FINGERPRINT_BADLOCATION:
        print 'Could not store in that location.'
        return p
    elif p == fp.FINGERPRINT_FLASHERR:
        print 'Error writing to flash.'
        return p
    else:
        print 'Unknow error' 
        return p

while True:
#    getFingerprintIDez()
     print 'Type in the ID # you want to save this finger as...'
     content = raw_input('input')
     id = content
     print 'Enroll ID #', content
     while 0 == getFingerprintEnroll(id):
         pass
