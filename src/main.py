from compare2images import is_different
from Screenshot import Screenshot
from sys import argv
import errno
import json
import numpy as np
import os
import socket


window_title = 'Guilty Gear Xrd -REVELATOR-'
ss_dir = 'screenshots'
char_dir = ''


def mkdirs(directory):
    try:
        os.makedirs(directory)
    except OSError as e:
        if e.errno != errno.EEXIST:
            raise


def take_screenshots(conn):
    global window_title
    global ss_dir
    global char_dir

    ss = Screenshot(window_title)
    outdir = os.path.join(ss_dir, char_dir)
    mkdirs(outdir)

    first = prev = curr = ss.screenshot()
    first = ss.crop_action_hud(first)
    i = 0
    while True:
        curr = ss.screenshot()
        curr_crop = ss.crop_action_hud(curr)
        if i != 0:
            if not is_different(first, curr_crop):
                break

        if is_different(ss.crop_action_hud(prev), curr_crop):
            outfile = os.path.join(outdir, str(i)+'.png')
            ss.save(outfile)
            info = ss.get_info()
            conn.send(json.dumps({
                'event': 'new_file',
                'file': os.path.abspath(outfile),
                'width': info['bmWidth'],
                'height': info['bmHeight']
                }))
            i += 1

        prev = curr


def main():
    global ss_dir
    global char_dir
    # create screenshots folder
    mkdirs(ss_dir)

    # initiate socket
    with open('config.json') as f:
        HOST, PORT = '', json.load(f)['port']
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind((HOST, PORT))
    s.listen(1)

    conn, addr = s.accept()
    print 'Connected by', addr
    while True:
        try:
            data = conn.recv(1024)
            if not data:
                break
            else:
                data = json.loads(data)
                if data['event'] == 'start':
                    print 'capturing screenshots'
                    char_dir = data['character']
                    take_screenshots(conn)
                    conn.send(json.dumps({'event': 'stop'}))
                elif data['event'] == 'export_gifs':
                    print 'received'
                    for gif in data['gifs']:
                        print gif
        except socket.error as err:
            if err[0] == 10054:
                print 'Connected by', addr
                conn, addr = s.accept()
            else:
                raise err
    conn.close()


if __name__ == '__main__':
    main()
