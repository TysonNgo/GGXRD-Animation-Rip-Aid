# GGXRD-Animation-Rip-Aid
Tool to assist in taking frame-by-frame screenshots from Guilty Gear Xrd

# Requirements

- OpenCV 3.4.2
- Python 2.7
- OS: Windows 10 (Created this to work on a Windows device, so it will most likely not work on any other operating system)
- Cheat Engine 6.7 (This is just the version I was using, any version may work)

# Setup

```
npm install
virtualenv venv
venv\Scripts\activate
pip install -r requirements.txt
cp "PATH\TO\opencv\build\python\2.7\x86\cv2.pyd" "venv\Lib\site-packages\cv2.pyd"
npm start
```

# Concept

- In Guilty Gear Xrd, turn off the HUD for the health bars and tension gauge through the .ini files, go to training mode and use Cheat Engine to change the stage to black, as well as manipulate the camera when necessary, and slow down the game in order to make it easier to capture frame by frame. 

- An indicator for when a frame is changed in the game will be needed to tell the program when to take a screenshot. In training mode, the training dummy's actions can be recorded and played back. The HUD for this functionality displays a frame counter for the recorded action when recording and playing back the dummy's action. This will be a perfect indicator to watch for when a frame is changed.

![](/doc/HUD.PNG) 

- I was thinking I could use computer vision to check if this HUD element has changed by either using OCR for checking if the numbers that the HUD displays has changed or just checking if the entire HUD element has changed.

- I opted for the latter because for this purpose, it will work indefinitely. This is due to the fact that I can use Cheat Engine to isolate this HUD element so that it will not be on top of anything that animates, as well as being able to choose a stage that contains nothing and is only characterized by a black background. In other words, the only time a change is detected in this region would be if the HUD element updates itself.

# Example

Start up Guilty Gear Xrd -REVELATOR- and Cheat Engine, be familiar and make use of [this cheat table](https://www.reddit.com/r/Guiltygear/comments/6uc88a/rudimentary_cheat_engine_camera_mod/). Head to training mode, and record actions from the 2nd player.

![](/doc/game.PNG)

Start up the GUI:

```
npm start
```

In this GUI, you will see:

- a box for the character (this is directory name of where the screenshots will be taken)
- a box for the list of desired moves to make animations of (each item contains the frame range and cropping bounding box)
- the box below that displays a carousel of the screenshots captured and clicking any of them will display that image to the right
- first/last frame button will set the currently selected screenshot to be the first/last frame of the animation respectively
- the crop button will allow you to select a bounding box to crop the dimensions of the animation
- the export gifs button will export gifs from the box with the list of moves

![](/doc/app1.PNG)

Clicking the `+` in the move box will bring up a menu where you can either type in the move name or do the input and the name will be entered

![](/doc/app3.PNG)

To start taking screenshots, hit the rapid screenshot button or press CTRL+Space.

![](/doc/app4.PNG)

Enable Speedhack in Cheat Engine such that it is at a speed where you will not lose frames.

![](/doc/cheatengine_reduce_speed.PNG)

In the game, play the dummy action and the screenshots will be taken.

![](/doc/app5.PNG)

Select crop the region which you want the animation to contain.

![](/doc/app6.PNG)

Select the frame you want to set as the first frame of the animation, then click the `first frame` button. Then do the same with the last frame.

![](/doc/app7.PNG)

Go through the list of moves and set their cropping region and first/last frames. When you are satisfied with them, hit the `export GIFs` button.

![](/doc/app8.PNG)

Here is the result:

![](/doc/2363214S.gif)

