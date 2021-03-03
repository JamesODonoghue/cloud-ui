This directory contains complete source code of TreeGrid component. All .js files are coded in 7bit ASCII.

You can use these sources for debugging:
Link file GridESrc.js instead of compiled GridE.js file into your page
Change the TGPath variable inside GridESrc.js, if the GridESrc.js file is placed in different directory than the GridE.js
The GridESrc.js file must be always placed in the root directory of TreeGrid sources
!!! Debugging sources can be run only from the local servers: localhost, 127.0.0.1, 192.168.*.*, 10.*.*.* and directly via file:// protocol

Or you can modify these sources, compile them and use the result in your application(s):
Run the compiler GenerateGridE.exe. The output of GenerateGridE is file GridE.js that can be included to HTML pages as standard TreeGrid core file.

When you are changing the code, always use precise syntax and always separate commands by semicolons to avoid problems with GenerateGridE.
If you use some non-standard JavaScript keywords or specific keywords to some browser, always check files Words\JavaScriptGlobals.txt and Words\JavaScriptProperties.txt (all object properties). If the keywords are not present in these files, add them.
Add to the word lists only missing JavaScript keywords or keywords you need to have visible, but not any other. Adding too many words to word lists makes obfuscation ineffective and is prohibited.

Never try to compress the sources by another compressor than GenerateGridE, especially uploading them to any online compressor is strictly prohibited!
