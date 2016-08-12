# PS4 Playground (FW 3.55)
PS4 Playground is a project created around the 3.55 Code Execution Userland exploit created by xyz and ported by Fire30. The name and idea is based off CTurt's original "PS4 Playground" developed for FW 1.76. It currently only features a POC test of the exploit and a system information page. The project is still a WIP.

To see updates on what is being worked on for PS4 Playground, I'm going to start posting updates about it on my twitter @SpecterDev.

# The Exploit
The exploit was originally ported by Fire30, however I cleaned it up a bit and implemented it so everything is shown in the browser. There is no longer a need to run a Python server / run back and forth between your PS4 and your PC to see the information, it's all right on the browser. The exploit is also slightly more stable, as after my edits it seems to work more consistantly in the web implementation and the browser doesn't crash immediately after the exploit is performed successfully.

# Usage
You will need fakedns. You also need to edit the dns.conf to point to the ip address of your PC (can be found in cmd/terminal by typing ipconfig/ifconfig), and modify your consoles' DNS settings to point to your PC's address. Then type the following in your terminal;

`python fakedns.py -c dns.conf`

You will also need to setup xampp on your computer and run Apache on port 80. For the easiest method, in /htdocs, create the '/document/en/ps4' directory and place the files from this repo in there.

When your fake dns is running and you've setup your localhost server in xampp, you can navigate to PS4 -> Settings -> User Guide. It should then show PS4 Playground.

# Notes
The exploit will not run correctly all of the time. Sometimes it will stick at stage 4 or webkit will crash before the script is finished. If it doesn't work at first, keep trying until it does, it shouldn't take long.

Refreshing the page after a successful attempt or going to another page will crash webkit. Just hit OK and it will resume to the next action you wanted to perform.

The project isn't 100% complete, however more things have been added in the 1.3 update. Modules can now be dumped from memory, however currently only modules loaded by WebKit can be dumped.

The sizes of dumps may be small for some modules, but they should include most of everything you would need anyway.

Because of how large the libSceWebKit2.sprx module is, it must be dumped in 17 parts. Once you have all 17 parts (check filesystem on server first), you can click the "Stitch WebKit" button which will merge them all into one dump. I tried to make it dump the module all at once, but it absolutely wrecked my PS4's ram and gave a system error after a 5 minute long freeze.

If you try to stitch WebKit without all 17 parts, the PHP page you are directed to will probably display errors and you may have to close the browser to get out. I plan to fix this in a future commit with proper error handling/

Dumps are named .bin rather than .sprx to distinguish that they are dumped from memory and not by file, however they will still load fine in IDA for example.

If you have a seemingly endless string of crashes, try closing and re-opening the web browser/user guide, seems to help in this regard.

Big thanks to XorLoser, Maxton, and Fire30 for assistance with dumping the modules.

Thanks to Xerpi, we now have stack/memory management and are able to do more cool stuff!

# Special Thanks To
Fire30 - The porting of the WebKit Exploit to PS4, as well as assistance when I needed it

Xerpi - Functions in his POC edit that I ported over (these functions made things way easier and more efficient)

XYZ - The original exploit for the PSVita

CTurt - JuSt-ROP, the original PS4 Playground, as well as his work with 1.76.

XorLoser - File sizes and headers for the module dumps

Maxton - Assistance in understanding the exploit better and module dumping

Red-EyeX32 - Assistance in development
