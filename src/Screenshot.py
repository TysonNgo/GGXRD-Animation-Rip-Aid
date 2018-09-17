from PIL import Image
import numpy as np
import win32con
import win32gui
import win32ui


class Screenshot():
    def __init__(self, window_title):
        self.window_title = window_title
        self.dataBitMap = None
        self.cDC = None

    # ---------------------------------------------------------------------------------------------------------
    # https://stackoverflow.com/questions/15589517/how-to-crop-an-image-in-opencv-using-python#answer-49983255
    def __imcrop(self, img, bbox):
        """
         rtype: np.array
        """
        x1, y1, x2, y2 = bbox
        if x1 < 0 or y1 < 0 or x2 > img.shape[1] or y2 > img.shape[0]:
            img, x1, x2, y1, y2 = self.__img_fit_bbox(img, x1, x2, y1, y2)
        return img[y1:y2, x1:x2, :]

    def __img_fit_bbox(self, img, x1, x2, y1, y2):
        """
         rtype: np.array
        """
        img = np.pad(img, (
            (np.abs(np.minimum(0, y1)),
             np.maximum(y2 - img.shape[0], 0)),
            (np.abs(np.minimum(0, x1)),
             np.maximum(x2 - img.shape[1], 0)), (0, 0)), mode='constant')
        y1 += np.abs(np.minimum(0, y1))
        y2 += np.abs(np.minimum(0, y1))
        x1 += np.abs(np.minimum(0, x1))
        x2 += np.abs(np.minimum(0, x1))
        return img, x1, x2, y1, y2
    # ---------------------------------------------------------------------------------------------------------

    # -------------------------------------------------------------------------------------------------------------------
    # https://stackoverflow.com/questions/3586046/fastest-way-to-take-a-screenshot-with-python-on-windows#answer-3586280
    def screenshot(self):
        """
         rtype: np.array
        """
        hwnd = win32gui.FindWindow(None, self.window_title)
        rect = win32gui.GetWindowRect(hwnd)
        x, y = rect[:2]
        w, h = (xy2-xy1 for xy1, xy2 in zip(rect[:2], rect[2:]))

        wDC = win32gui.GetWindowDC(hwnd)
        dcObj = win32ui.CreateDCFromHandle(wDC)

        if (self.cDC or self.dataBitMap):
            self.free()

        self.cDC = dcObj.CreateCompatibleDC()
        self.dataBitMap = win32ui.CreateBitmap()
        self.dataBitMap.CreateCompatibleBitmap(dcObj, w, h)
        self.cDC.SelectObject(self.dataBitMap)
        self.cDC.BitBlt((0, 0), (w, h), dcObj, (0, 0), win32con.SRCCOPY)

        bmpstr = self.dataBitMap.GetBitmapBits(True)
        im = np.fromstring(bmpstr, dtype='uint8')
        im.shape = (h, w, 4)

        dcObj.DeleteDC()
        win32gui.ReleaseDC(hwnd, wDC)

        return im
    # -------------------------------------------------------------------------------------------------------------------

    def crop_action_hud(self, im):
        """
         rtype: np.array
        """
        w, h = 1368.0, 795.0
        # x1, y1 = 1030/w, 215/h
        x1, y1 = 1150/w, 215/h
        x2, y2 = 1285/w, 260/h
        h, w = im.shape[:2]
        bbox = (int(x1*w), int(y1*h), int(x2*w), int(y2*h))

        return self.__imcrop(im, bbox)

    def get_info(self):
        if self.dataBitMap:
            return self.dataBitMap.GetInfo()

    def free(self):
        try:
            self.cDC.DeleteDC()
            win32gui.DeleteObject(self.dataBitMap.GetHandle())
        except Exception as ex:
            print ex

    def save(self, fn):
        if (self.cDC and self.dataBitMap):
            bmpinfo = self.dataBitMap.GetInfo()
            bmpstr = self.dataBitMap.GetBitmapBits(True)
            im = Image.frombuffer(
                'RGB',
                (bmpinfo['bmWidth'], bmpinfo['bmHeight']),
                bmpstr, 'raw', 'BGRX', 0, 1)
            im.save(fn)
