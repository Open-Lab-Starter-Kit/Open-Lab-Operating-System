//TODO
//check and maybe fix the command line history
//implement feed and spindle real time overrides
//add new status mask for when the tool changer is working (outside of the job, when doing it by hand then we should hide the other commands)


//here all the code that executes after the page load
window.onload = function () {

    //here assign variables to all the used HTML elements
    //global statuses of the machine
    //these are updated automatically from the server
    //machine statuses kept global
    //paused or not, for pause and resume button toggling
    let machineStatus = '';
    let workPositionX = -1;
    let workPositionY = -1;
    let workPositionZ = -1;
    let machinePositionX = -1;
    let machinePositionY = -1;
    let machinePositionZ = -1;
    let offsetX = -1;
    let offsetY = -1;
    let offsetZ = -1;
    let isFileOpened = false;
    let openFilename = '';


    //console related
    let sendButtonJ = '#sendButton';
    let commandLineJ = '#commandLine';
    let consoleTextAreaJ = '#consoleTextArea';

    let commandLine = document.getElementById('commandLine');
    let consoleTextArea = document.getElementById('consoleTextArea');
    //let fileListTextArea = document.getElementById('fileListTextArea');
    let sendButton = document.getElementById('sendButton');

    //file related
    let fileInputJ = '#fileInput';
    let uploadButtonJ = '#uploadButton';
    let deleteButtonJ = '#deleteButton';
    let fileSelectionListJ = '#fileSelectionList';
    let currentOpenFileLabelJ = '#currentOpenFileLabel';
    let closeButtonJ = '#closeButton';

    let fileSelectionList = document.getElementById('fileSelectionList');
    let fileInput = document.getElementById('fileInput');
    let uploadButton = document.getElementById('uploadButton');
    let deleteButton = document.getElementById('deleteButton');
    let selectedFileLabel = document.getElementById('selectedFileLabel');
    let currentOpenFileLabel = document.getElementById('currentOpenFileLabel');
    let closeButton = document.getElementById('closeButton');

    //job related
    let openButton = document.getElementById('openButton');
    let stopButton = document.getElementById('stopButton');
    let pauseButton = document.getElementById('pauseButton');
    let startButton = document.getElementById('startButton');

    let pauseButtonJ = '#pauseButton';
    let stopButtonJ = '#stopButton';
    let openButtonJ = '#openButton';
    let startButtonJ = '#startButton';

    //utilities related
    let returnZeroButtonJ = '#returnZeroButton';
    let homingButtonJ = '#homingButton';
    let zeroButtonJ = '#zeroButton';
    let unlockButtonJ = '#unlockButton';

    let returnZeroButton = document.getElementById('returnZeroButton');
    let homingButton = document.getElementById('homingButton');
    let zeroButton = document.getElementById('zeroButton');
    let unlockButton = document.getElementById('unlockButton');

    //status related
    let statusButtonJ = '#statusButton';
    let mxButtonJ = '#mxButton';
    let myButtonJ = '#myButton';
    let mzButtonJ = '#mzButton';

    let wxButtonJ = '#wxButton';
    let wyButtonJ = '#wyButton';
    let wzButtonJ = '#wzButton';

    let statusButton = document.getElementById('statusButton');

    let mxButton = document.getElementById('mxButton');
    let myButton = document.getElementById('myButton');
    let mzButton = document.getElementById('mzButton');

    let wxButton = document.getElementById('wxButton');
    let wyButton = document.getElementById('wyButton');
    let wzButton = document.getElementById('wzButton');

    //jogging related
    let rightButtonJ = '#rightButton';
    let leftButtonJ = '#leftButton';
    let forwardButtonJ = '#forwardButton';
    let backwardButtonJ = '#backwardButton';

    let upButtonJ = '#upButton';
    let downButtonJ = '#downButton';

    let forwardRightButtonJ = '#forwardRightButton';
    let forwardLeftButtonJ = '#forwardLeftButton';
    let backwardRightButtonJ = '#backwardRightButton';
    let backwardLeftButtonJ = '#backwardLeftButton';

    let xyJogSizeJ = '#xyJogSize';
    let zJogSizeJ = '#zJogSize';
    let xyJogFeedJ = '#xyJogFeed';
    let zJogFeedJ = '#zJogFeed';

    let rightButton = document.getElementById('rightButton');
    let leftButton = document.getElementById('leftButton');
    let forwardButton = document.getElementById('forwardButton');
    let backwardButton = document.getElementById('backwardButton');

    let upButton = document.getElementById('upButton');
    let downButton = document.getElementById('downButton');

    let forwardRightButton = document.getElementById('forwardRightButton');
    let forwardLeftButton = document.getElementById('forwardLeftButton');
    let backwardRightButton = document.getElementById('backwardRightButton');
    let backwardLeftButton = document.getElementById('backwardLeftButton');

    let xyJogSize = document.getElementById('xyJogSize');
    let zJogSize = document.getElementById('zJogSize');
    let xyJogFeed = document.getElementById('xyJogFeed');
    let zJogFeed = document.getElementById('zJogFeed');


    let NEWLINE = '\n';

    //websocket server API information here
    let SERIAL_PREFIX = 'S_'; //serial commands have this prefix
    let FILE_PREFIX = 'F_'; //uploaded files have this prefix; the filename is added to the string payload of the message as first line of the file with "NAME_" prefix
    let FILENAME_PREFIX = 'NAME_'; //this is the prefix to indicate the name of the file in the websocket message
    let DELETE_FILE_PREFIX = 'DF_'; //this prefix is used to delete files on the server
    let OPEN_FILE_PREFIX = 'OF_'; //this preifx is used to open a file on the server, the server should send the preview etc
    let CLOSE_FILE_PREFIX = 'CF_'; //with this prefix we close the file currently open in the server
    let START_FILE_PREFIX = 'SF_'; //with this we will start the execution of a previously opened file
    //add more prefixes here for different ServerCore commands

    //front end prefixes API here
    let FRONTEND_CONSOLE_PREFIX = 'C_';
    let FRONTEND_LIST_FILE_PREFIX = 'LS_';
    let FRONTEND_FILE_OPENED_STATUS = 'FOS_';
    let FRONTEND_FILE_CLOSED_STATUS = "FCS_";


    //utilitiy prefixes
    let OPTION_FILENAME_ID_PREFIX = 'OF-'

    //some properties, as this one below should be set and read from outside
    //return to G54 home moving speed
    let RETURN_ZERO_SPEED = 'F2000';

    //built-in button commands
    let COMMAND_HOMING = SERIAL_PREFIX + '$H';
    let COMMAND_RETURN_ZERO = SERIAL_PREFIX + 'G1 X0 Y0 ' + RETURN_ZERO_SPEED;
    let COMMAND_RESET_ZERO = SERIAL_PREFIX + 'G92 X0 Y0 Z0';
    let COMMAND_RESET_ZERO_X = SERIAL_PREFIX + 'G92 X0';
    let COMMAND_RESET_ZERO_Y = SERIAL_PREFIX + 'G92 Y0';
    let COMMAND_RESET_ZERO_Z = SERIAL_PREFIX + 'G92 Z0';
    let COMMAND_UNLOCK = SERIAL_PREFIX + '$X';
    let COMMAND_PAUSE = SERIAL_PREFIX + '!';
    let COMMAND_RESUME = SERIAL_PREFIX + '~';
    //jogging is buggy in grbl-hal because feed hold does not work
    //therefore for jogging normal gcode is used
    let COMMAND_INCREMENTAL_JOGGING = SERIAL_PREFIX + '$J=G91 ';
    let COMMAND_ABSOLUTE_POSITION = SERIAL_PREFIX + 'G90';
    let COMMAND_RELATIVE_POSITION = SERIAL_PREFIX + 'G91';

    //real time commands
    let COMMAND_CTRL_X = SERIAL_PREFIX + '\x18';

    //GRBL status identifiers
    let GRBL_OK = 'ok';
    let GRBL_STATUS_START_STRING = '<';
    let GRBL_STATUS_END_STRING = '>';
    let GRBL_STATUS_SEPARATOR_STRING = '|';
    let GRBL_POSITION_SEPARATOR_STRING = ',';
    let GRBL_MACHINE_POSITION_STRING = 'MPos:';
    let GRBL_WORK_POSITION_STRING = 'WCO:';


    let GRBL_STATUS_HOLD = 'Hold';
    let GRBL_STATUS_IDLE = 'Idle';
    let GRBL_STATUS_RUN = 'Run';
    let GRBL_STATUS_ALARM = 'Alarm';
    let GRBL_STATUS_JOG = 'Jog';
    let GRBL_STATUS_HOMING = 'Homing';



    //other variables
    let MAX_FILE_SIZE = 1024 * 1024 * 500 //file limit size in bytes, in this case 500MB;

    let previousCommands = [];
    let previousCommandsIndex = -1;

    let NUMBER_DIGIT_REGEX = /[0-9]/;

    let webSocketAddress = 'ws://localhost:8887';
    webSocket = new WebSocket(webSocketAddress);

    ////////WEBSOCKETS/////////////
    webSocket.onopen = function (e) {

        console.log("websocket connection established");

    };


    webSocket.onmessage = function (event) {

        //console.log(`Data received from server.`);

        let bufferString = String(event.data);
        let bufferOption;
        let newBufferStringLines;
        let existingOptionsLines;
        let foundFileLine = false;
        let statusInfos = null;
        let positionCoordinates = null;
        let statusString = '';

        //console.log(bufferString);

        //here we distinguish where to dispatch the messages according to prefixes
        if (bufferString.startsWith(FRONTEND_CONSOLE_PREFIX)) {

            //remove the prefix
            bufferString = bufferString.substring(FRONTEND_CONSOLE_PREFIX.length);

            //here we catch the status messages and populate the interface
            if (bufferString.includes(GRBL_STATUS_START_STRING) && bufferString.includes(GRBL_STATUS_END_STRING)) {

                statusInfos = bufferString.split(GRBL_STATUS_SEPARATOR_STRING);

                if (statusInfos != null && statusInfos.length > 0) {

                    //first we update the status
                    statusString = ' ' + statusInfos[0].substring(1);

                    //here we clean the status string if needed
                    if (statusString.includes(':'))
                        statusString = statusString.substring(0, statusString.length - 2);

                    if (statusString.includes(GRBL_STATUS_END_STRING))
                        statusString = statusString.substring(0, statusString.length - 1);

                    statusButton.childNodes[2].textContent = ' ' + statusString;

                    //here set the machine status and arrange the interface accordingly
                    if (statusString.includes(GRBL_STATUS_IDLE)) {

                        machineStatus = GRBL_STATUS_IDLE;

                        //text changes
                        pauseButton.textContent = 'Pause';

                        //enable and disable
                        pauseButton.disabled = true;
                        stopButton.disabled = true;
                        sendButton.disabled = false;
                        homingButton.disabled = false;
                        zeroButton.disabled = false;
                        returnZeroButton.disabled = false;
                        unlockButton.disabled = false;
                        uploadButton.disabled = false;
                        fileInput.disabled = false;
                        rightButton.disabled = false;
                        leftButton.disabled = false;
                        forwardButton.disabled = false;
                        backwardButton.disabled = false;
                        forwardRightButton.disabled = false;
                        forwardLeftButton.disabled = false;
                        backwardRightButton.disabled = false;
                        backwardLeftButton.disabled = false;
                        upButton.disabled = false;
                        downButton.disabled = false;
                        openButton.disabled = false;
                        mxButton.disabled = false;
                        myButton.disabled = false;
                        mzButton.disabled = false;
                        wxButton.disabled = false;
                        wyButton.disabled = false;
                        wzButton.disabled = false;
                        deleteButton.disabled = false;
                        closeButton.disabled = false;
                        startButton.disabled = false;

                    } else
                        if (statusString.includes(GRBL_STATUS_RUN)) {

                            machineStatus = GRBL_STATUS_RUN;

                            //text changes
                            pauseButton.textContent = 'Pause';

                            //enable and disable
                            pauseButton.disabled = false;
                            stopButton.disabled = false;
                            sendButton.disabled = true;
                            homingButton.disabled = true;
                            zeroButton.disabled = true;
                            returnZeroButton.disabled = true;
                            unlockButton.disabled = true;
                            uploadButton.disabled = true;
                            fileInput.disabled = true;
                            rightButton.disabled = true;
                            leftButton.disabled = true;
                            forwardButton.disabled = true;
                            backwardButton.disabled = true;
                            forwardRightButton.disabled = true;
                            forwardLeftButton.disabled = true;
                            backwardRightButton.disabled = true;
                            backwardLeftButton.disabled = true;
                            upButton.disabled = true;
                            downButton.disabled = true;
                            openButton.disabled = true;
                            mxButton.disabled = true;
                            myButton.disabled = true;
                            mzButton.disabled = true;
                            wxButton.disabled = true;
                            wyButton.disabled = true;
                            wzButton.disabled = true;
                            deleteButton.disabled = true;
                            closeButton.disabled = true;
                            startButton.disabled = true;

                        } else
                            if (statusString.includes(GRBL_STATUS_HOLD)) {

                                machineStatus = GRBL_STATUS_HOLD;

                                //text changes
                                pauseButton.textContent = 'Resume';

                                //enable and disable
                                pauseButton.disabled = false;
                                stopButton.disabled = false;
                                sendButton.disabled = true;
                                homingButton.disabled = true;
                                zeroButton.disabled = true;
                                returnZeroButton.disabled = true;
                                unlockButton.disabled = true;
                                uploadButton.disabled = true;
                                fileInput.disabled = true;
                                rightButton.disabled = true;
                                leftButton.disabled = true;
                                forwardButton.disabled = true;
                                backwardButton.disabled = true;
                                forwardRightButton.disabled = true;
                                forwardLeftButton.disabled = true;
                                backwardRightButton.disabled = true;
                                backwardLeftButton.disabled = true;
                                upButton.disabled = true;
                                downButton.disabled = true;
                                openButton.disabled = true;
                                mxButton.disabled = true;
                                myButton.disabled = true;
                                mzButton.disabled = true;
                                wxButton.disabled = true;
                                wyButton.disabled = true;
                                wzButton.disabled = true;
                                deleteButton.disabled = true;
                                closeButton.disabled = true;
                                startButton.disabled = true;

                            } else
                                if (statusString.includes(GRBL_STATUS_ALARM)) {

                                    machineStatus = GRBL_STATUS_ALARM;

                                    //text changes
                                    pauseButton.textContent = 'Pause';

                                    //enable and disable
                                    pauseButton.disabled = true;
                                    stopButton.disabled = true;
                                    sendButton.disabled = false;
                                    homingButton.disabled = true;
                                    zeroButton.disabled = true;
                                    returnZeroButton.disabled = true;
                                    unlockButton.disabled = false;
                                    uploadButton.disabled = true;
                                    fileInput.disabled = true;
                                    rightButton.disabled = true;
                                    leftButton.disabled = true;
                                    forwardButton.disabled = true;
                                    backwardButton.disabled = true;
                                    forwardRightButton.disabled = true;
                                    forwardLeftButton.disabled = true;
                                    backwardRightButton.disabled = true;
                                    backwardLeftButton.disabled = true;
                                    upButton.disabled = true;
                                    downButton.disabled = true;
                                    openButton.disabled = true;
                                    mxButton.disabled = true;
                                    myButton.disabled = true;
                                    mzButton.disabled = true;
                                    wxButton.disabled = true;
                                    wyButton.disabled = true;
                                    wzButton.disabled = true;
                                    deleteButton.disabled = true;
                                    closeButton.disabled = true;
                                    startButton.disabled = true;


                                } else
                                    if (statusString.includes(GRBL_STATUS_JOG)) {

                                        machineStatus = GRBL_STATUS_JOG;

                                        //text changes
                                        pauseButton.textContent = 'Pause';

                                        //enable and disable
                                        pauseButton.disabled = false;
                                        stopButton.disabled = false;
                                        sendButton.disabled = true;
                                        homingButton.disabled = true;
                                        zeroButton.disabled = true;
                                        returnZeroButton.disabled = true;
                                        unlockButton.disabled = true;
                                        uploadButton.disabled = true;
                                        fileInput.disabled = true;
                                        rightButton.disabled = true;
                                        leftButton.disabled = true;
                                        forwardButton.disabled = true;
                                        backwardButton.disabled = true;
                                        forwardRightButton.disabled = true;
                                        forwardLeftButton.disabled = true;
                                        backwardRightButton.disabled = true;
                                        backwardLeftButton.disabled = true;
                                        upButton.disabled = true;
                                        downButton.disabled = true;
                                        openButton.disabled = true;
                                        mxButton.disabled = true;
                                        myButton.disabled = true;
                                        mzButton.disabled = true;
                                        wxButton.disabled = true;
                                        wyButton.disabled = true;
                                        wzButton.disabled = true;
                                        deleteButton.disabled = true;
                                        closeButton.disabled = true;
                                        startButton.disabled = true;


                                    } else
                                        if (statusString.includes(GRBL_STATUS_HOMING)) {

                                            machineStatus = GRBL_STATUS_JOG;

                                            pauseButton.textContent = 'Pause';

                                            //enable and disable
                                            pauseButton.disabled = true;
                                            stopButton.disabled = false;
                                            sendButton.disabled = true;
                                            homingButton.disabled = true;
                                            zeroButton.disabled = true;
                                            returnZeroButton.disabled = true;
                                            unlockButton.disabled = true;
                                            uploadButton.disabled = true;
                                            fileInput.disabled = true;
                                            rightButton.disabled = true;
                                            leftButton.disabled = true;
                                            forwardButton.disabled = true;
                                            backwardButton.disabled = true;
                                            forwardRightButton.disabled = true;
                                            forwardLeftButton.disabled = true;
                                            backwardRightButton.disabled = true;
                                            backwardLeftButton.disabled = true;
                                            upButton.disabled = true;
                                            downButton.disabled = true;
                                            openButton.disabled = true;
                                            mxButton.disabled = true;
                                            myButton.disabled = true;
                                            mzButton.disabled = true;
                                            wxButton.disabled = true;
                                            wyButton.disabled = true;
                                            wzButton.disabled = true;
                                            deleteButton.disabled = true;
                                            closeButton.disabled = true;
                                            startButton.disabled = true;

                                        }

                    //here only if we get the full info with at least machine pos
                    if (statusInfos.length > 2) {

                        //here we get the coordinates
                        positionCoordinates = statusInfos[1].split(GRBL_POSITION_SEPARATOR_STRING);

                        if (positionCoordinates != null && positionCoordinates.length == 3) {

                            machinePositionX = parseFloat(positionCoordinates[0].substring(GRBL_MACHINE_POSITION_STRING.length));
                            machinePositionY = parseFloat(positionCoordinates[1]);
                            machinePositionZ = parseFloat(positionCoordinates[2]);

                            mxButton.childNodes[2].textContent = ' ' + machinePositionX.toFixed(2);
                            myButton.childNodes[2].textContent = ' ' + machinePositionY.toFixed(2);
                            mzButton.childNodes[2].textContent = ' ' + machinePositionZ.toFixed(2);

                            if (bufferString.includes(GRBL_WORK_POSITION_STRING)) {

                                positionCoordinates = statusInfos[4].split(GRBL_POSITION_SEPARATOR_STRING);

                                if (positionCoordinates != null && positionCoordinates.length == 3) {

                                    let xWCO = parseFloat(positionCoordinates[0].substring(GRBL_WORK_POSITION_STRING.length));
                                    let yWCO = parseFloat(positionCoordinates[1]);
                                    let zWCO = parseFloat(positionCoordinates[2]);

                                    workPositionX = machinePositionX - xWCO;
                                    workPositionY = machinePositionY - yWCO;
                                    workPositionZ = machinePositionZ - zWCO;

                                    offsetX = xWCO;
                                    offsetY = yWCO;
                                    offsetZ = zWCO;

                                    wxButton.childNodes[2].textContent = ' ' + workPositionX.toFixed(2);
                                    wyButton.childNodes[2].textContent = ' ' + workPositionY.toFixed(2);
                                    wzButton.childNodes[2].textContent = ' ' + workPositionZ.toFixed(2);

                                }

                            }
                            //here if we do not have the coordinates we use the saved ones if already present
                            else
                                if (offsetX != -1 && offsetY != -1 && offsetZ != -1) {

                                    workPositionX = machinePositionX - offsetX;
                                    workPositionY = machinePositionY - offsetY;
                                    workPositionZ = machinePositionZ - offsetZ;

                                    wxButton.childNodes[2].textContent = ' ' + workPositionX.toFixed(2);
                                    wyButton.childNodes[2].textContent = ' ' + workPositionY.toFixed(2);
                                    wzButton.childNodes[2].textContent = ' ' + workPositionZ.toFixed(2);

                                }

                        }

                    }

                }

            } else
                //here we remove the ok messages, if not we just send the results to the visible console
                if (!bufferString.includes(GRBL_OK)
                    && !bufferString.includes(GRBL_STATUS_START_STRING)
                    && !bufferString.includes(GRBL_STATUS_SEPARATOR_STRING)
                    && !bufferString.includes(GRBL_STATUS_END_STRING)) {

                    consoleTextArea.value += bufferString;
                    consoleTextArea.scrollTop = consoleTextArea.scrollHeight;

                }

        } else
            if (bufferString.startsWith(FRONTEND_LIST_FILE_PREFIX)) {

                bufferString = bufferString.substring(FRONTEND_LIST_FILE_PREFIX.length);

                //fileListTextArea.value = '';
                //fileListTextArea.value += bufferString;
                //fileListTextArea.scrollTop = fileListTextArea.scrollHeight;

                //here we need to split the string per NEWLINE and add it to the file list selection menu
                //here we need to update the list based on what is already existing before the update
                newBufferStringLines = bufferString.split(NEWLINE);

                //reconstruct here the existing array of elements
                existingOptionsLines = fileSelectionList.getElementsByTagName('option');

                numFileFound = 0;

                //here add the new elements if any
                if (newBufferStringLines != null && newBufferStringLines.length > 0) {

                    for (let c = 0; c < newBufferStringLines.length; c++) {

                        foundFileLine = false;

                        if (existingOptionsLines != null && existingOptionsLines.length > 0)
                            for (let i = 0; i < existingOptionsLines.length; i++) {

                                //if(newBufferStringLines[c] != NEWLINE && existingBufferStringLines[i].text != NEWLINE)
                                if (newBufferStringLines[c] == existingOptionsLines[i].text) {

                                    foundFileLine = true;
                                    break;

                                }

                            }

                        if (!foundFileLine) {

                            bufferOption = document.createElement("option");
                            bufferOption.text = newBufferStringLines[c];
                            fileSelectionList.appendChild(bufferOption);
                            bufferOption.id = OPTION_FILENAME_ID_PREFIX + newBufferStringLines[c];

                        }

                    }

                    //here we remove the deleted/move away files
                    for (let c = 0; c < existingOptionsLines.length; c++) {

                        foundFileLine = false;

                        for (let i = 0; i < newBufferStringLines.length; i++) {

                            if (existingOptionsLines[c].text == newBufferStringLines[i]) {

                                foundFileLine = true;
                                break;

                            }

                        }

                        if (!foundFileLine)
                            document.getElementById(OPTION_FILENAME_ID_PREFIX + existingOptionsLines[c].text).remove();

                    }

                }

            } else
                if (bufferString.startsWith(FRONTEND_FILE_OPENED_STATUS)) {

                    //remove the prefix
                    bufferString = bufferString.substring(FRONTEND_FILE_OPENED_STATUS.length);

                    if (bufferString != null && bufferString.length > 3) {

                        currentOpenFileLabel.innerHTML = 'File currently open: <b>' + bufferString + '</b>';
                        //set global status of file open or not
                        isFileOpened = true;
                        openFilename = bufferString;

                    }

                } else
                    if (bufferString.startsWith(FRONTEND_FILE_CLOSED_STATUS)) {

                        openFilename = '';
                        isFileOpened = false;
                        currentOpenFileLabel.innerHTML = 'No file is currently open.';

                    }

    };

    webSocket.onclose = function (event) {

        if (event.wasClean) {
            console.log('Connection closed cleanly.');
        } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
            console.log('Connection died.');
        }

    };

    webSocket.onerror = function (error) {

        console.log(`[error]`);

    };

    /////////TYPING INTERACTIONS//////////
    $(xyJogSizeJ).keyup(function (event) {

        //here we check that is properly float number with dot and not comma
        let bufferString = xyJogSize.value;

        if (bufferString.length > 0) {

            let lastChar = bufferString.substring(bufferString.length - 1);

            //if the last digit is not a number delete it
            if (!lastChar.match(NUMBER_DIGIT_REGEX) && lastChar != '.')
                xyJogSize.value = bufferString.substring(0, bufferString.length - 1);
            else
                if (lastChar == '.') {

                    if (bufferString.length == 1)
                        xyJogSize.value = '';
                    else
                        if (bufferString.split('.').length > 2)
                            xyJogSize.value = bufferString.substring(0, bufferString.length - 1);

                }

        }

    });

    $(xyJogFeedJ).keyup(function (event) {

        //here we check that is properly float number with dot and not comma
        let bufferString = xyJogFeed.value;

        if (bufferString.length > 0) {

            let lastChar = bufferString.substring(bufferString.length - 1);

            //if the last digit is not a number delete it
            if (!lastChar.match(NUMBER_DIGIT_REGEX))
                xyJogFeed.value = bufferString.substring(0, bufferString.length - 1);

        }

    });

    $(zJogSizeJ).keyup(function (event) {

        //here we check that is properly float number with dot and not comma
        let bufferString = zJogSize.value;

        if (bufferString.length > 0) {

            let lastChar = bufferString.substring(bufferString.length - 1);

            //if the last digit is not a number delete it
            if (!lastChar.match(NUMBER_DIGIT_REGEX) && lastChar != '.')
                zJogSize.value = bufferString.substring(0, bufferString.length - 1);
            else
                if (lastChar == '.') {

                    if (bufferString.length == 1)
                        zJogSize.value = '';
                    else
                        if (bufferString.split('.').length > 2)
                            zJogSize.value = bufferString.substring(0, bufferString.length - 1);

                }

        }

    });

    $(zJogFeedJ).keyup(function (event) {

        //here we check that is properly float number with dot and not comma
        let bufferString = zJogFeed.value;

        if (bufferString.length > 0) {

            let lastChar = bufferString.substring(bufferString.length - 1);

            //if the last digit is not a number delete it
            if (!lastChar.match(NUMBER_DIGIT_REGEX))
                zJogFeed.value = bufferString.substring(0, bufferString.length - 1);

        }

    });

    /////////KEY INTERACTIONS//////////
    $(commandLineJ).keydown(function (e) {
        if (e.keyCode == 13 && machineStatus == GRBL_STATUS_IDLE) {

            let inputString = commandLine.value;

            //send something only if lenght more than 0
            if (inputString.length > 0) {

                previousCommands.push(inputString);
                inputString = SERIAL_PREFIX + inputString;
                webSocket.send(inputString);
                //add this to previous commands
                commandLine.value = '';

            }

        }
    });

    $(commandLineJ).keydown(function (e) {
        if (e.keyCode == 38) {

            console.log('keyup detected');

            if ((previousCommandsIndex + 1) < previousCommands.length) {

                ++previousCommandsIndex;
                commandLine.value = previousCommands[previousCommandsIndex];

            }

        }

    });

    $(commandLineJ).keydown(function (e) {
        if (e.keyCode == 40) {

            console.log('keydown detected');

            if ((previousCommandsIndex - 1) > -1 && previousCommands.length > 0) {

                --previousCommandsIndex;
                commandLine.value = previousCommands[previousCommandsIndex];

            }

        }

    });

    /////////CLICK INTERACTIONS//////////
    $(fileSelectionListJ).change(function () {

        let bufferString = fileSelectionList.options[fileSelectionList.selectedIndex];

        if (bufferString != null) {

            bufferString = bufferString.textContent;
            selectedFileLabel.innerHTML = 'Selected file: <b>' + bufferString + '</b>';

        }

    })

    $(closeButtonJ).on("click", function () {

        if (isFileOpened) {

            webSocket.send(FILE_PREFIX + CLOSE_FILE_PREFIX);

        } else
            window.alert('No file was open to close.');

    });

    $(openButtonJ).on("click", function () {

        let bufferString = fileSelectionList.options[fileSelectionList.selectedIndex];

        if (bufferString != null) {

            bufferString = bufferString.textContent;
            webSocket.send(FILE_PREFIX + OPEN_FILE_PREFIX + bufferString);

        } else
            window.alert('First select a file from the list.')

    });

    $(startButtonJ).on("click", function () {

        if (isFileOpened) {

            //tell here the server to launch the file
            webSocket.send(FILE_PREFIX + START_FILE_PREFIX);

        } else
            window.alert('First open a file, no file is open.');


    });

    $(deleteButtonJ).on("click", function () {

        let bufferString = fileSelectionList.options[fileSelectionList.selectedIndex];

        if (bufferString != null) {

            bufferString = bufferString.textContent;

            if (confirm('Do you really want to delete the file: ' + bufferString + '?') == true)
                webSocket.send(FILE_PREFIX + DELETE_FILE_PREFIX + bufferString);

        } else
            window.alert('First select a file from the list.')

    });


    $(wxButtonJ).on("click", function () {

        webSocket.send(COMMAND_RESET_ZERO_X);

    });

    $(wyButtonJ).on("click", function () {

        webSocket.send(COMMAND_RESET_ZERO_Y);

    });

    $(wzButtonJ).on("click", function () {

        webSocket.send(COMMAND_RESET_ZERO_Z);

    });

    $(sendButtonJ).on("click", function () {

        //send something only if lenght more than 0
        if (commandLine.value.length > 0) {

            let bufferString = commandLine.value;

            previousCommands.push(bufferString);
            bufferString = SERIAL_PREFIX + bufferString;
            webSocket.send(bufferString);
            //add this to previous commands
            commandLine.value = '';

        }

    });

    $(upButtonJ).on("click", function () {

        //send something only if lenght more than 0
        if (zJogSize.value.length > 0 && zJogFeed.value.length > 0) {

            webSocket.send(COMMAND_RELATIVE_POSITION);
            webSocket.send(SERIAL_PREFIX + 'G1 Z' + zJogSize.value + ' F' + zJogFeed.value);
            webSocket.send(COMMAND_ABSOLUTE_POSITION);

        }

    });

    $(downButtonJ).on("click", function () {

        //send something only if lenght more than 0
        if (zJogSize.value.length > 0 && zJogFeed.value.length > 0) {

            webSocket.send(COMMAND_RELATIVE_POSITION);
            webSocket.send(SERIAL_PREFIX + 'G1 Z-' + zJogSize.value + ' F' + zJogFeed.value);
            webSocket.send(COMMAND_ABSOLUTE_POSITION);

        }

    });


    $(rightButtonJ).on("click", function () {

        //send something only if lenght more than 0
        if (xyJogSize.value.length > 0 && xyJogFeed.value.length > 0) {

            webSocket.send(COMMAND_RELATIVE_POSITION);
            webSocket.send(SERIAL_PREFIX + 'G1 X' + xyJogSize.value + ' F' + xyJogFeed.value);
            webSocket.send(COMMAND_ABSOLUTE_POSITION);

        }

    });

    $(leftButtonJ).on("click", function () {

        //send something only if lenght more than 0
        if (xyJogSize.value.length > 0 && xyJogFeed.value.length > 0) {

            webSocket.send(COMMAND_RELATIVE_POSITION);
            webSocket.send(SERIAL_PREFIX + 'G1 X-' + xyJogSize.value + ' F' + xyJogFeed.value);
            webSocket.send(COMMAND_ABSOLUTE_POSITION);

        }

    });

    $(forwardButtonJ).on("click", function () {

        //send something only if lenght more than 0
        if (xyJogSize.value.length > 0 && xyJogFeed.value.length > 0) {

            webSocket.send(COMMAND_RELATIVE_POSITION);
            webSocket.send(SERIAL_PREFIX + 'G1 Y' + xyJogSize.value + ' F' + xyJogFeed.value);
            webSocket.send(COMMAND_ABSOLUTE_POSITION);

        }

    });

    $(backwardButtonJ).on("click", function () {

        //send something only if lenght more than 0
        if (xyJogSize.value.length > 0 && xyJogFeed.value.length > 0) {

            webSocket.send(COMMAND_RELATIVE_POSITION);
            webSocket.send(SERIAL_PREFIX + 'G1 Y-' + xyJogSize.value + ' F' + xyJogFeed.value);
            webSocket.send(COMMAND_ABSOLUTE_POSITION);

        }

    });

    $(forwardRightButtonJ).on("click", function () {

        //send something only if lenght more than 0
        if (xyJogSize.value.length > 0 && xyJogFeed.value.length > 0) {

            webSocket.send(COMMAND_RELATIVE_POSITION);
            webSocket.send(SERIAL_PREFIX + 'G1' + ' X+' + xyJogSize.value + ' Y+' + xyJogSize.value + ' F' + xyJogFeed.value);
            webSocket.send(COMMAND_ABSOLUTE_POSITION);

        }

    });

    $(forwardLeftButtonJ).on("click", function () {

        //send something only if lenght more than 0
        if (xyJogSize.value.length > 0 && xyJogFeed.value.length > 0) {

            webSocket.send(COMMAND_RELATIVE_POSITION);
            webSocket.send(SERIAL_PREFIX + 'G1' + ' X-' + xyJogSize.value + ' Y+' + xyJogSize.value + ' F' + xyJogFeed.value);
            webSocket.send(COMMAND_ABSOLUTE_POSITION);

        }

    });

    $(backwardLeftButtonJ).on("click", function () {

        //send something only if lenght more than 0
        if (xyJogSize.value.length > 0 && xyJogFeed.value.length > 0) {

            webSocket.send(COMMAND_RELATIVE_POSITION);
            webSocket.send(SERIAL_PREFIX + 'G1' + ' X-' + xyJogSize.value + ' Y-' + xyJogSize.value + ' F' + xyJogFeed.value);
            webSocket.send(COMMAND_ABSOLUTE_POSITION);

        }

    });

    $(backwardRightButtonJ).on("click", function () {

        //send something only if lenght more than 0
        if (xyJogSize.value.length > 0 && xyJogFeed.value.length > 0) {

            webSocket.send(COMMAND_RELATIVE_POSITION);
            webSocket.send(SERIAL_PREFIX + 'G1' + ' X+' + xyJogSize.value + ' Y-' + xyJogSize.value + ' F' + xyJogFeed.value);
            webSocket.send(COMMAND_ABSOLUTE_POSITION);

        }

    });

    $(unlockButtonJ).on("click", function () {

        webSocket.send(COMMAND_UNLOCK);

    });

    $(zeroButtonJ).on("click", function () {

        webSocket.send(COMMAND_RESET_ZERO);

    });


    $(pauseButtonJ).on("click", function () {

        if (machineStatus == GRBL_STATUS_HOLD)
            webSocket.send(COMMAND_RESUME);
        else
            if (machineStatus == GRBL_STATUS_RUN || machineStatus == GRBL_STATUS_JOG)
                webSocket.send(COMMAND_PAUSE);

    });

    $(returnZeroButtonJ).on("click", function () {

        webSocket.send(COMMAND_RETURN_ZERO);

    });

    $(stopButtonJ).on("click", function () {

        webSocket.send(COMMAND_CTRL_X);

    });

    $(homingButtonJ).on("click", function () {

        webSocket.send(COMMAND_HOMING);

    });

    $(uploadButtonJ).on("click", function () {

        //first check if a file has been selected
        if (fileInput.files.length > 0) {

            var file = fileInput.files[0];
            var reader = new FileReader();

            //check filesize here
            if (file.size <= MAX_FILE_SIZE) {

                reader.readAsText(file);

                reader.loadend = function () { }

                reader.onload = function () {

                    let content = FILE_PREFIX;
                    content += FILENAME_PREFIX;
                    content += file.name;
                    content += NEWLINE;
                    content += reader.result;

                    webSocket.send(content);

                    fileInput.value = '';

                    console.log('file has been sent');
                    console.log(reader.result);

                }

            } else
                window.alert('File exceeds the limit of ' + bytesToMB(MAX_FILE_SIZE));

        } else
            console.log('no files selected');

    });

    ///////////UTILITIES//////////
    function bytesToMB(bytes) { return (bytes / (1024 * 1024)).toFixed(2) + ' MB'; }

};

