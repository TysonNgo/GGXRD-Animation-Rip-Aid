from skimage.measure import compare_ssim
import cv2
import imutils
 
def is_different(image1, image2):
    """
     Checks if image1 is different than image2
       this function is taken and modified from
       https://github.com/ninjakx/Spot_the_difference/blob/master/compare2images.py
     image1: np.array
     image2: np.array
     rtype: bool
    """
    gray1 = cv2.cvtColor(image1, cv2.COLOR_RGB2GRAY)
    gray2 = cv2.cvtColor(image2, cv2.COLOR_RGB2GRAY)

    (score,diff) = compare_ssim(gray1,gray2,full=True)
    diff = (diff * 255).astype("uint8")

    thresh = cv2.threshold(diff, 0, 255,
        cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
    cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE)
    cnts = cnts[0] if imutils.is_cv2() else cnts[1]

    return bool(cnts)
