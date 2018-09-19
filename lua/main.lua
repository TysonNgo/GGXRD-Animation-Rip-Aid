-- uses cheat table from https://www.reddit.com/r/Guiltygear/comments/6uc88a/rudimentary_cheat_engine_camera_mod/

--[[
  arrow keys to move camera left/right/up/down
  [ins][hom] -> moves player 1 (player 2 will be used for the rips) up/down
  [del][end] -> zoom in/out
  numpad5 sets the stage to black (must change characters to take effect)
  numpad1 pans camera to p1
  numpad2 default zoom
  numpad3 pans camera to p2
--]]

a = getAddressList()

camYDefault = 106.4230957
camZDefault = 540
blackStage = 19
move = 10

camX = a.getMemoryRecordByDescription('Camera X')
camY = a.getMemoryRecordByDescription('Camera Y')
camZ = a.getMemoryRecordByDescription('Camera Z')
p1X = a.getMemoryRecordByDescription('Player 1 X')
p1Y = a.getMemoryRecordByDescription('Player 1 Y')
p2X = a.getMemoryRecordByDescription('Player 2 X')
p2Y = a.getMemoryRecordByDescription('Player 2 Y')

hotkeys = {
  createHotkey(setStage, VK_NUMPAD5),
  createHotkey(moveCamLeft, VK_LEFT),
  createHotkey(moveCamRight, VK_RIGHT),
  createHotkey(moveCamUp, VK_UP),
  createHotkey(moveCamDown, VK_DOWN),

  createHotkey(zoomCamIn, VK_DELETE),
  createHotkey(zoomCamOut, VK_END),
  createHotkey(moveP1Up, VK_INSERT),
  createHotkey(moveP1Down, VK_HOME),

  createHotkey(defaultZoom, VK_NUMPAD2),
  createHotkey(panToP1, VK_NUMPAD1),
  createHotkey(panToP2, VK_NUMPAD3)
}

function getPtrAddress(mRecord)
  r = mRecord.getAddress()
  r = string.format('[%s]', r)
  c = mRecord.getOffsetCount()-1
  for i=c,0,-1 do
    r = string.format('%s+%x', r, mRecord.getOffset(i))
    if i ~= 0 then
      r = '[' .. r .. ']'
    end
  end
  return r
end

function setStage()
  stage = a.getMemoryRecordByDescription('Stage Select')
  writeBytes(getPtrAddress(stage), blackStage)
end

function moveCamLeft()
  local a = getPtrAddress(camX)
  local x = readFloat(a)
  writeFloat(a, x - move)
end

function moveCamRight()
  local a = getPtrAddress(camX)
  local x = readFloat(a)
  writeFloat(a, x + move)
end

function moveCamUp()
  local a = getPtrAddress(camY)
  local y = readFloat(a)
  writeFloat(a, y + move)
end

function moveCamDown()
  local a = getPtrAddress(camY)
  local y = readFloat(a)
  writeFloat(a, y - move)
end

function zoomCamIn()
  local a = getPtrAddress(camZ)
  local z = readFloat(a)
  writeFloat(a, z - move)
end

function zoomCamOut()
  local a = getPtrAddress(camZ)
  local z = readFloat(a)
  writeFloat(a, z + move)
end

function defaultZoom()
  local a = getPtrAddress(camZ)
  local z = readFloat(a)
  writeFloat(a, camZDefault)
end

function moveP1Up()
  local a = getPtrAddress(p1Y)
  local y = readFloat(a)
  writeFloat(a, y + move)
end

function moveP1Down()
  local a = getPtrAddress(p1Y)
  local y = readFloat(a)
  writeFloat(a, y - move)
end

function panToP1()
  local cXAdd = getPtrAddress(camX)
  local cYAdd = getPtrAddress(camY)
  local pXAdd = getPtrAddress(p1X)
  local pYAdd = getPtrAddress(p1Y)
  local cX = readFloat(cXAdd)
  local cY = readFloat(cYAdd)
  local pX = readFloat(pXAdd)
  local pY = readFloat(pYAdd)
  writeFloat(cXAdd, pX + camYDefault * 1.4)
  writeFloat(cYAdd, pY + camYDefault)
  writeFloat(getPtrAddress(camZ), 700)
end

function panToP2()
  local cXAdd = getPtrAddress(camX)
  local cYAdd = getPtrAddress(camY)
  local pXAdd = getPtrAddress(p2X)
  local pYAdd = getPtrAddress(p2Y)
  local cX = readFloat(cXAdd)
  local cY = readFloat(cYAdd)
  local pX = readFloat(pXAdd)
  local pY = readFloat(pYAdd)
  --[[writeFloat(cXAdd, pX - camYDefault)
  writeFloat(cYAdd, pY + camYDefault)
  --]]
  writeFloat(cXAdd, pX + camYDefault * 1.4)
  writeFloat(cYAdd, pY + camYDefault)
  writeFloat(getPtrAddress(camZ), 700)
end

function destroyHotkeys()
  for k, v in pairs(hotkeys) do
    hotkeys[k].destroy()
  end
end

