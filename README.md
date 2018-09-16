# GGXRD-Animation-Rip-Aid
Tool to assist in taking frame-by-frame screenshots from Guilty Gear Xrd

# Requirements

- OpenCV 3.4.2
- Python 2.7
- OS: Windows 10 (Created this to work on a Windows device, so it will most likely not work on any other operating system)
- Cheat Engine 6.7 (This is just the version I was using, any version may work)

# Concept

- In Guilty Gear Xrd, turn off the HUD for the health bars and tension gauge through the .ini files, go to training mode and use Cheat Engine to change the stage to black, as well as manipulate the camera when necessary, and slow down the game in order to make it easier to capture frame by frame. 

- An indicator for when a frame is changed in the game will be needed to tell the program when to take a screenshot. In training mode, the training dummy's actions can be recorded and played back. The HUD for this functionality displays a frame counter for the recorded action when recording and playing back the dummy's action. This will be a perfect indicator to watch for when a frame is changed.

- I was thinking I could use computer vision to check if this HUD element has changed by either using OCR for checking if the numbers that the HUD displays has changed or just checking if the entire HUD element has changed.

- I opted for the latter because for this purpose, it will work indefinitely. This is due to the fact that I can use Cheat Engine to isolate this HUD element so that it will not be on top of anything that animates. In other words, the only time a change is detected in this region would be if the HUD element updates itself.
