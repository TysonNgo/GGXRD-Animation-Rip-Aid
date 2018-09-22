from compare2images import is_different
from Screenshot import Screenshot
from sys import argv, stdout
import errno
import imageio
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

def export_gifs(conn, data):
    global ss_dir
    global char_dir
    progress = 0
    complete = sum([g['frame_end']+1-g['frame_start'] for g in data['gifs']])
    for n, gif in enumerate(data['gifs']):
        out = os.path.join(ss_dir, char_dir, gif['filename'])
        bbox = gif['bbox']
        try:
            with imageio.get_writer(out, mode='I', fps=60) as writer:
                for i in range(gif['frame_start'], gif['frame_end']+1):
                    im = imageio.imread(os.path.join(ss_dir, char_dir, str(i)+'.png'))
                    if all(gif['bbox']):
                        h, w, _ = im.shape
                        writer.append_data(im[
                            int(bbox[1]*h):int(bbox[3]*h),
                            int(bbox[0]*w):int(bbox[2]*w)])
                    else:
                        writer.append_data(im)
                    progress += 1
                    conn.send(json.dumps({
                        'event': 'export_progress',
                        'progress': progress,
                        'complete': complete,
                        'message':
                        # n of N gifs | file.gif - 1/30 frames
                        str(n+1) + ' of ' + str(len(data['gifs'])) + ' gifs | ' +
                        gif['filename'] + ' - ' +
                        str(i-gif['frame_start']+1) + '/' + str(gif['frame_end']-gif['frame_start']+1) + 'frames'
                    }))
        except Exception as ex:
            conn.send(json.dumps({
                'event': 'error',
                'error': str(ex)
            }))

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
    print 'Listening on port ' + str(PORT)
    stdout.flush()
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
                    char_dir = data['character'].strip()
                    take_screenshots(conn)
                    conn.send(json.dumps({'event': 'stop'}))
                elif data['event'] == 'export_gifs':
                    print 'received'
                    export_gifs(conn, data)
        except socket.error as err:
            if err[0] == 10054:
                print 'Connected by', addr
                conn, addr = s.accept()
            else:
                raise err
    conn.close()


if __name__ == '__main__':
    main()
