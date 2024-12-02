//TO-DO
//decide if it is necessary to send ok or not during tool change
//decide if it is necessary to send status report or not during tool  change (if not sent the gui will not see the position during tool change)
//check bug of quick consequencial tool changers not executing actions
//set fixed positions as global variables for easy settings every time
//define generic add and return tools functions given the macro
//convert the set tool offset to string and use the macro buffer lines to write it to the teensy‚
/////////////////////////////////INCLUDES////////////////////////////////////////////
#include <EEPROM.h>
#include <FastLED.h>

//CONSTANTS

//DEBUG
#define DEBUGGING_BASE 0
#define DEBUGGING_TOOL 0
#define DEBUGGING_MACRO_BUFFER 0
#define BENCHMARKING 0
#define BENCHMARK_TRESHOLD_MS 1
//if(DEBUGGING){USBSerialPrintln();}

//PIN ASSIGNMENTS

//LED pins
#define LED_STRIPES_PIN_1 12
#define LED_STRIPES_PIN_2 13
#define GREEN_LED_OUTPUT_PIN 4
#define BLUE_LED_OUTPUT_PIN 5
#define RED_LED_OUTPUT_PIN 6

//Laser Pins
#define ENABLE_DIODE_POWER_PIN 8
#define ENABLE_DIODE_PIN 9
#define ENABLE_CO2_PIN 10

#define LASER_RED_POINTER_PIN 11
#define ENABLE_DELAY_PIN 22
#define PWM_DELAY_PIN 23

#define NUM_LEDS 50

CRGB leds1[NUM_LEDS];
CRGB leds2[NUM_LEDS];

#define LASER_ENABLE_DELAY 20


#define SERIAL_BUFFER_SIZE 256
#define USB_SERIAL_BAUD_RATE 115200
#define TEENSY_BAUD_RATE 115200

// JOYSTICK oins
#define JoyStick_X_PIN A1
#define JoyStick_Y_PIN A0
#define JoyStick_Z_PIN 7 

//EEPROM
//minimum is 256, max is 4096 bytes (4K)
#define EEPROM_BYTES 1024
#define EEPROM_EMPTY_BYTE 255
#define CURRENT_TOOL_NUMBER_ADDRESS 1
#define TOOL_STRUCTS_INITIAL_ADDRESS 10


//GRBL
#define GRBL_INTERROGATIVE '?'
#define GRBL_TILDE '~'
#define GRBL_ESCLAMATIVE '!'

#define TOOL_DATA_START_CHAR '='
#define TRUE "true"
#define FALSE "false"

const byte GRBL_CTRLX = 24;

//PICO available commands
#define AIR_ON "GA1"             //example: "GA1" turn on tool changer air
#define AIR_OFF "GA0"            //examle: "GA0" turn off tool changer air
#define IS_AIR_ON "GAC"          //example "GAC" returns if the tool changer air is on or off
#define M6 "M6"                  //command to change the tool, must be used with a tool, example "M6T0" to bring back any tool, "M6T1" to bring back the current tool (if any in spindle) and take T1
#define CLEAR_EEPROM "GEE"       //with this command we clear the EEPROM of all the tool data saved about the tool changer, like body length, diameter etc
#define SET_TOOL "GFT"           //warning this forces to set the current tool in the spindle, mainly used for manual operations, example is "GFT T1" to force T1 in spindle
#define READ_SPINDLE_TOOL "GRT"  //this reads the current tool number in spindle, example is "GRT"
#define PRINT_TOOL_INFO "GPT"    //print tool info from the tool struct current in memory, which in turn is loaded from EEPROM, examples "GPT"
#define PRINT_TOOLS_INFO "GPAT"  //print info about all the tools, which in turn is loaded from EEPROM, example is "GPAT"
#define ENABLE_STATUS "GSE"      //Enabale fetching the status of the machine during tool changing process
#define DISABLE_STATUS "GSD"     //Disable fetching the status of the machine during tool changing process

#define SET_TOOL_DESCRIPTION "STDE"  //example "STDE=6mm 2 flutes"
#define SET_TOOL_DIAMETER "STDI"     //example "STDI=6mm"
#define SET_TOOL_OFFSET "STO"        //example "STO=5.545mm"
#define SET_TOOL_CLOCKWISE "STR"     //example "STR=true", "STR=false"
#define SET_TOOL_LENGTH "STL"        //example "STL=50mm"

#define PICO_COMMAND_AMOUNT 16

const char PICO_COMMANDS[PICO_COMMAND_AMOUNT][10] = {

  M6,                    //case 0 tool change
  AIR_ON,                //case 1 activate tool change air
  AIR_OFF,               //case 2 de-activate tool change air
  CLEAR_EEPROM,          //case 3 clear EEPROM
  SET_TOOL,              //case 4 force tool, see the define for warning
  READ_SPINDLE_TOOL,     //case 5 reads tool installed in spindle
  IS_AIR_ON,             //case 6 check if tool change air is enabled or not
  PRINT_TOOL_INFO,       //case 7 print tool info from the tool struct current in memory, which in turn is loaded from EEPROM
  SET_TOOL_DESCRIPTION,  //case 8 set tool description
  SET_TOOL_DIAMETER,     //case 9 set tool diameter
  SET_TOOL_OFFSET,       //case 10 set tool offset, this tool offset is for now the tool body length
  SET_TOOL_CLOCKWISE,    //case 11 set tool rotation, clockwise, counterclockwise
  SET_TOOL_LENGTH,       //case 12 set tool length
  PRINT_TOOLS_INFO,      //case 13 print infos about all the tools
  ENABLE_STATUS,         //case 14 enable printing the status
  DISABLE_STATUS         //case 15 disable printing the status

};

#define TOOL_AMOUNT 3  //one tool is for the T0
#define TOOL_MAX_OFFSET 100
#define TOOL_MAX_LENGTH 100
#define TOOL_MAX_DIAMETER 100
#define TOOL_DESCRIPTION_CHARS 50
#define TOOL_ATCION_CHARS 10

typedef struct {

  char toolName[5];
  char toolDescription[TOOL_DESCRIPTION_CHARS];
  char toolSetAction[10];
  double toolDiameter;
  int toolNumber;
  double toolOffSet;
  bool clockwise;
  double length;

} Tool;

Tool tools[TOOL_AMOUNT];

const char TOOL_NAMES[TOOL_AMOUNT][5] = {
  "T0",
  "T1",
  "T2",
};

#define SET_TOOL_T0 "GFT T0"
#define SET_TOOL_T1 "GFT T1"
#define SET_TOOL_T2 "GFT T2"

//warining, we need to add here tools according to the number of tools defined in the tool TOOL_NAMES
const char SET_TOOL_COMMANDS[TOOL_AMOUNT][10] = {

  SET_TOOL_T0,
  SET_TOOL_T1,
  SET_TOOL_T2,

};

#define SYNC_ACTION_AMOUNT 10
#define SYNC_ACTION_CHARS 10

typedef struct {

  char type[SYNC_ACTION_CHARS];
  float positionX;
  float positionY;
  float positionZ;
  float positionRange;
  int pollingInterval;

} syncAction;

syncAction syncActions[SYNC_ACTION_AMOUNT];


//GRBL GCODE MACROS, corresponding to PICO_COMMANDS lines
//special chars are used to be substituted later with parametrized values
//special chars can be added only at the end of the strings
//! will be changed with Z feed rate speed -> for later!
//? will be changed with XY feed rate speed -> for later!
//we use the commands directly in the macro for PICO commands, check the defines
#define TOOL_MACRO_LINES 40
#define TOOL_MACRO_CHARS 50

//buffer for macro lines to be written in case of tool change
//this code should only send its own commands to GRBL in case of tool change
//in any case for each command sent from this code on its own, we need to wait for the ok
#define TOOL_MACRO_BUFFER_LINES TOOL_MACRO_LINES * 4
#define TOOL_MACRO_BUFFER_CHARS TOOL_MACRO_CHARS


char bufferMacroLines[TOOL_MACRO_BUFFER_LINES][TOOL_MACRO_BUFFER_CHARS] = {};


//speeds of tool change for XY and Z
//warning, too high speed may cause the tracking not to work according to polling times, GRBL should have max 10Hz polling time?
#define TOOL_SET_TOOL_OFFSET "G43.1 Z"


//warning, here we need to match the syncActions present in the macro
//the match of the position is basically the position just before the command is sent, in the line or lines before
const char MACRO_TAKE_T1[TOOL_MACRO_LINES][TOOL_MACRO_CHARS] = {

  "M5",        

  "G1 F3000",  
  "G53 Y-70",      
  "G53 X-211.2",
  
  "G1 F3000",  
  "G53 Y40",
  
  "G1 F200",
  "G53 Y47",
  
  "G1 F500",
  "G53 X-252.2",
  
  "G1 F1000",
  "G53 Y40",
  
  "G1 F3000",
  "G53 Y-75",
  
  SET_TOOL_T1,
  "\0",

};

const char MACRO_TAKE_T2[TOOL_MACRO_LINES][TOOL_MACRO_CHARS] = {

  "M5",

  "G1 F3000",
  "G53 Y-70",
  "G53 X-34.8",

  "G1 F3000",
  "G53 Y40",

  "G1 F200",
  "G53 Y46",

  "G1 F500",
  "G53 X-88.8",

  "G1 F1000",
  "G53 Y40",

  "G1 F3000",
  "G53 Y-80",

  SET_TOOL_T2,
  "\0",

};

const char MACRO_RETURN_T1[TOOL_MACRO_LINES][TOOL_MACRO_CHARS] = {

  "M5",

  "G1 F3000",
  "G53 Y-120",
  "G53 X-252.2",

  "G1 F3000",
  "G53 Y40",

  "G1 F1000",
  "G53 Y47",

  "G1 F500",
  "G53 X-211.2",
  "G53 Y40",

  "G1 F3000",
  "G53 Y-85",

  SET_TOOL_T0,
  "\0",

};

const char MACRO_RETURN_T2[TOOL_MACRO_LINES][TOOL_MACRO_CHARS] = {

  "M5",

  "G1 F3000",
  "G53 Y-120",
  "G53 X-88.8",

  "G1 F3000",
  "G53 Y40",

  "G1 F200",
  "G53 Y47",

  "G1 F500",
  "G53 X-34.8",

  "G1 F200",
  "G53 Y40",

  "G1 F3000",
  "G53 Y-90",

  SET_TOOL_T0,
  "\0",

};

//GRBL RESPONSES
#define GRBL_MPOS "MPos"
#define GRBL_OK "ok"
#define GRBL_STATUS_START_STRING "<"
#define GRBL_STATUS_END_STRING ">"

//tool changer success indicator for the server
#define TOOL_CHANGER_SUCCESS "TCOK"
#define TOOL_SYNTAX_ERROR "TCSE"

//LINES
#define NEWLINE '\n'
#define RETURN '\r'
#define NULL_CHAR '\0'

/////////////////////////////////////////////////////////////////////////////////////

//BUFFERS
#define LINE_BUFFER_CHARACTERS 100

// joystick
#define JOYSTICK_XY_STATUS_INTERVAL 500
#define JOYSTICK_DATA_INTERVAL 100
#define JOYSTICK_Z_STATUS_INTERVAL 3000
#define JOYSTICK_ERROR_THRESHOLD 20

#define JOYSTICK_MAX_THRESHOLD 1250
#define JOYSTICK_MIN_THRESHOLD 300


// LED 
#define FADE_INTERVAL 50
// changes based on the fadeAmount value
#define MAX_BRIGHTNESS 250
#define MIN_BRIGHTNESS 1

unsigned long startTime = 0.0;
unsigned long currentTime = 0.0;
unsigned long benchmarkTime = 0.0;
unsigned long startPollingTime = 0.0;


bool startUpOnce = true;
bool airOn = false;
bool isToolChange = false;
char bufferCharUSB = NULL_CHAR;
char bufferCharTEENSY = NULL_CHAR;
char USBLineArray[LINE_BUFFER_CHARACTERS];
char TEENSYLineArray[LINE_BUFFER_CHARACTERS];

byte bufferByteUSB = 0;
byte bufferByteTEENSY = 0;
int syncActionIndex = 0;
int bufferMacroLineIndex = 0;

float lastPositionX = 0.0;
float lastPositionY = 0.0;
float lastPositionZ = 0.0;

bool trackingPosition = false;
bool getStatus = true;
bool isMachineStarting = true;

int previousTool = 0;

//COUNTERS
int USBLinePos = 0;
int TEENSYLinePos = 0;
//when we are executing the macros for the tool change, we need wait for an ok from GRBL before proceeding further
//this counter keeps the number of oks we need to wait before sending the next line
int waitForOk = 0;

enum MachineState {
  IDLE,
  HOLD,
  ALARM,
  RUN,
  DOOR,
  HOME,
  UNKNOWN
};
MachineState preState = UNKNOWN;

const int JOYSTICK_INITIAL_X = 812;  // initial X position
const int JOYSTICK_INITIAL_Y = 812;  // initial X position
unsigned long joystickLastMovementTime = 0; // Store the time of the last movement
unsigned long joystickLastDataTime = 0; // Store the time of the last data printed
unsigned long joystickResetTime = 0; // Store the time of the last reset
int joystickPosX, joystickPosY, joystickPosZ;
char joystickMessage[50]; // Define a global char array to hold the joystick status

unsigned long fadeTime = 0; // Store the time of the last fade
unsigned long fadeLastDataTime = 0; // Store the time of the last data printed
int fadeAmount = 10;
int ledBrightness = 1;
boolean fadeDirection = true;

void setup() {

  //increase analog resolution to 12 bits
  analogReadResolution(12);

  //test relais
  pinMode(ENABLE_DIODE_PIN, OUTPUT);
  pinMode(ENABLE_CO2_PIN, OUTPUT);
  pinMode(ENABLE_DIODE_POWER_PIN,OUTPUT);

  //PIN MODES
  pinMode(LASER_RED_POINTER_PIN, OUTPUT);
  pinMode(ENABLE_DELAY_PIN,   OUTPUT);
  pinMode(PWM_DELAY_PIN,   OUTPUT);

  pinMode(LED_STRIPES_PIN_1,   OUTPUT);
  pinMode(LED_STRIPES_PIN_2,   OUTPUT);
  pinMode(RED_LED_OUTPUT_PIN, OUTPUT);
  pinMode(BLUE_LED_OUTPUT_PIN, OUTPUT);
  pinMode(GREEN_LED_OUTPUT_PIN, OUTPUT);

  pinMode(JoyStick_X_PIN, INPUT);
  pinMode(JoyStick_Y_PIN, INPUT);
  pinMode(JoyStick_Z_PIN, INPUT);

  //INIT PINS FIRST
  digitalWrite(LASER_RED_POINTER_PIN, LOW);
  
  //LOW means enabled on these ones
  digitalWrite(ENABLE_DIODE_PIN, HIGH);
  digitalWrite(ENABLE_CO2_PIN, HIGH);
  digitalWrite(ENABLE_DIODE_POWER_PIN, HIGH);

  digitalWrite(ENABLE_DELAY_PIN, HIGH);
  digitalWrite(PWM_DELAY_PIN, HIGH);

  //LEDS
  FastLED.addLeds<WS2811, LED_STRIPES_PIN_1, RGB>(leds1, NUM_LEDS);
  FastLED.addLeds<WS2812B, LED_STRIPES_PIN_2, RGB>(leds2, NUM_LEDS);
  FastLED.clear();


    for (int i=0; i<NUM_LEDS; i++ ){
    
      leds1[i].r = 250; 
      leds1[i].g = 250;  
      leds1[i].b = 250;

    }

      for (int i=0; i<NUM_LEDS; i++ ){
    
      leds2[i].r = 250; 
      leds2[i].g = 250;  
      leds2[i].b = 250;

    }

    FastLED.setBrightness(MAX_BRIGHTNESS);
    FastLED.show();

  //Serial.setFIFOSize(SERIAL_BUFFER_SIZE); not available for USBSerial looks like!!
  Serial.begin(USB_SERIAL_BAUD_RATE);
  //while (!Serial) {}

  Serial1.setFIFOSize(SERIAL_BUFFER_SIZE);
  Serial1.begin(TEENSY_BAUD_RATE);
  while (!Serial1) {}

  if (DEBUGGING_BASE) { USBSerialPrintln("Serial ports initialized"); }



  resetUSBLine();
  resetTEENSYLine();
  resetSyncActions();
  resetBufferMacroLines();
  if (DEBUGGING_BASE) { USBSerialPrintln("buffer arrays cleared"); }





  //get the time from the finish of the init phase
  startTime = millis();

  //if a current in spindle tool number has not been set, set T0 as default
  byte currentTool;
  EEPROM.begin(EEPROM_BYTES);

  currentTool = EEPROM.read(CURRENT_TOOL_NUMBER_ADDRESS);

  if (currentTool >= TOOL_AMOUNT) {

    EEPROM.write(CURRENT_TOOL_NUMBER_ADDRESS, 0);
    EEPROM.commit();
  }

  EEPROM.end();

  if (DEBUGGING_BASE) { USBSerialPrintln("EEPROM initialised"); }

  //here init the tools
  initTools();

  if (DEBUGGING_BASE) { USBSerialPrintln("Tools initialised"); }

}

////////////MAIN LOOP////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void loop() {

  // joystick
  handleJoystick();


  if(isMachineStarting) {
    handleStartLEDFading();
  }

  if (BENCHMARKING)
    benchmarkTime = millis();

  if (startUpOnce) {

    currentTime = millis();

    if ((currentTime - startTime) > LASER_ENABLE_DELAY) {

      digitalWrite(ENABLE_DELAY_PIN, HIGH);
      digitalWrite(PWM_DELAY_PIN, HIGH);
      startUpOnce = false;
      if (DEBUGGING_BASE) { USBSerialPrintln("Laser Enabled"); }
      
    }
  }

  bufferCharUSB = readFromUSB();
  bufferByteUSB = bufferCharUSB;

  if (bufferCharUSB != NULL_CHAR) {

    if (DEBUGGING_BASE) { USBSerialPrint("from USB: "); }
    if (DEBUGGING_BASE) { USBSerialPrintln(bufferByteUSB); }

    if (checkGRBLSpecialChar(bufferCharUSB) || checkGBRLSpecialByte(bufferByteUSB)) {

      TEENSYSerialWrite(bufferByteUSB);

      if (DEBUGGING_BASE) { USBSerialPrintln("special byte from USB"); }

      //cancel any sync action if CTRL-18 has been received
      if (bufferCharUSB == GRBL_CTRLX) {

        resetSyncActions();
        resetLastPostions();
        trackingPosition = false;
      }

      resetUSBLine();

    } else {

      USBLineArray[USBLinePos] = bufferCharUSB;
      ++USBLinePos;

      if (bufferCharUSB == NEWLINE) {

        handleUSBLine();

        resetUSBLine();
      }
    }
  }

  bufferCharTEENSY = readFromTeensy();
  bufferByteTEENSY = bufferCharTEENSY;

  if (bufferCharTEENSY != NULL_CHAR) {

    if (DEBUGGING_BASE) { USBSerialPrint("from TEENSY: "); }
    if (DEBUGGING_BASE) { USBSerialPrintln(bufferByteTEENSY); }


    if (checkGRBLSpecialChar(bufferCharTEENSY) && checkGBRLSpecialByte(bufferByteTEENSY)) {

      if (DEBUGGING_BASE) { USBSerialPrintln("special byte from TEENSY"); }

      USBSerialWrite(bufferByteTEENSY);

      resetTEENSYLine();

    } else {

      TEENSYLineArray[TEENSYLinePos] = bufferCharTEENSY;
      ++TEENSYLinePos;

      if (bufferCharTEENSY == NEWLINE) {

        handleTEENSYLine();

        // make sure that the message is status message
        char* subString  = strstr(TEENSYLineArray, GRBL_STATUS_START_STRING);

        if (subString != NULL) {
      
          // LED based on machine state
          handleLEDOutput();

          // stop the LED from fading
          if(isMachineStarting) {
            handleStopLEDFading();
          }
        }
        resetTEENSYLine();
      }
    }
  }

  //here check sync actions, remember that if a cancel command arrives for GRBL, the sync actions must be cleared
  syncActionIndex = firstSyncAction();

  if (syncActionIndex >= 0) {

    trackingPosition = true;
    // don't ask for the machine status if it is disabled
    if(getStatus) {
      askGRBLStatus(syncActions[syncActionIndex].pollingInterval);
    }

    //if a position has been determined thanks to position tracking
    //check if the position is in range

    if (abs(lastPositionX - syncActions[syncActionIndex].positionX) <= syncActions[syncActionIndex].positionRange)
      if (abs(lastPositionY - syncActions[syncActionIndex].positionY) <= syncActions[syncActionIndex].positionRange){
        //if (abs(lastPositionZ - syncActions[syncActionIndex].positionZ) <= syncActions[syncActionIndex].positionRange) { //do not check z position for laser tool changer?

          //here exeute the action
          char* subString = NULL;

          subString = strstr(syncActions[syncActionIndex].type, AIR_ON);

          if (subString != NULL)
            handleAirOn();

          subString = NULL;
          subString = strstr(syncActions[syncActionIndex].type, AIR_OFF);

          if (subString != NULL)
            handleAirOff();


          for (int C = 0; C < TOOL_AMOUNT; C++) {

            subString = NULL;
            subString = strstr(syncActions[syncActionIndex].type, tools[C].toolSetAction);

            if (subString != NULL)
              handleForceSetTool(tools[C].toolSetAction, false);
          }

          /*
          subString = NULL;
          subString = strstr(syncActions[syncActionIndex].type, tools[0].toolSetAction);
          
          if(subString != NULL)
              handleForceSetTool(tools[0].toolSetAction);   

          subString = NULL;
          subString = strstr(syncActions[syncActionIndex].type, tools[1].toolSetAction);
          
          if(subString != NULL)
              handleForceSetTool(tools[1].toolSetAction);    

          subString = NULL;
          subString = strstr(syncActions[syncActionIndex].type, tools[2].toolSetAction);
          
          if(subString != NULL)
              handleForceSetTool(tools[2].toolSetAction);        

          subString = NULL;
          subString = strstr(syncActions[syncActionIndex].type, tools[3].toolSetAction);
          
          if(subString != NULL)
              handleForceSetTool(tools[3].toolSetAction);           
          
          */

          if (DEBUGGING_TOOL) { USBSerialPrint("Last position X,Y,Z: "); }
          if (DEBUGGING_TOOL) { USBSerialPrint(lastPositionX); }
          if (DEBUGGING_TOOL) { USBSerialPrint(","); }
          if (DEBUGGING_TOOL) { USBSerialPrint(lastPositionY); }
          if (DEBUGGING_TOOL) { USBSerialPrint(","); }
          if (DEBUGGING_TOOL) { USBSerialPrintln(lastPositionZ); }

          if (DEBUGGING_TOOL) { USBSerialPrintln("syncActionIndex:"); }
          if (DEBUGGING_TOOL) { USBSerialPrintln(syncActionIndex); }
          //here we reset the trackingPosition only if it is the last action to be executed?
          //not after every action otherwise some oks can escape in between

          if (lastSyncAction() == syncActionIndex) {

            trackingPosition = false;

            //also here we send the signal to the server that the tool change has been successfully completed and also an additional ok
            //USBSerialPrintln(GRBL_OK);
            USBSerialPrintln(TOOL_CHANGER_SUCCESS);
          }

          resetSyncAction(syncActionIndex);
          resetLastPostions();
        }

    //if position is in range, execute action, eliminate the action
    //after the action is fulfilled deactivate the position tracking

    //}
  }

  //here we deal with writing the macro lines that are present in the buffer, ready to be written to teensy
  bufferMacroLineIndex = firstMacroBufferLine();

  if (bufferMacroLineIndex > -1) {

    if (waitForOk <= 0) {

      for (int C = 0; C < TOOL_MACRO_BUFFER_CHARS; C++) {

        if (bufferMacroLines[bufferMacroLineIndex][C] == NULL_CHAR) {

          //USBSerialWrite(NEWLINE);
          TEENSYSerialWrite(NEWLINE);
          ++waitForOk;
          clearCharArray(bufferMacroLines[bufferMacroLineIndex], TOOL_MACRO_BUFFER_CHARS);
          break;
        }

        //USBSerialWrite(_array[C]);
        TEENSYSerialWrite(bufferMacroLines[bufferMacroLineIndex][C]);
      }
    }

  } else
    waitForOk = 0;

  if (DEBUGGING_MACRO_BUFFER && waitForOk > 0) {
    USBSerialPrint("waitForOk:");
    USBSerialPrintln(waitForOk);
  }


  if (BENCHMARKING) {

    benchmarkTime = millis() - benchmarkTime;

    if (benchmarkTime > BENCHMARK_TRESHOLD_MS) {

      USBSerialPrint("loop ms: ");
      USBSerialPrintln(benchmarkTime);
    }
  }
}


/////////////////////////IMPLEMENTATION METHODS////////////////////////////////
void handleStartLEDFading() {

  unsigned long currentTime = millis();

  if(isFadeValid(currentTime)) {

      if(ledBrightness <  MIN_BRIGHTNESS)
        ledBrightness = MIN_BRIGHTNESS; 
      else
      if(ledBrightness >  MAX_BRIGHTNESS)
            ledBrightness = MAX_BRIGHTNESS;

     if(ledBrightness == MIN_BRIGHTNESS)
        fadeDirection = true;
    else    
      if(ledBrightness == MAX_BRIGHTNESS)
        fadeDirection = false;

    if(fadeDirection == true)
      ledBrightness = ledBrightness+fadeAmount;
    else
      ledBrightness = ledBrightness-fadeAmount;

    setLEDColor(0, 0, ledBrightness); 
    //FastLED.setBrightness(ledBrightness);
    //FastLED.show();

  }
}

void handleStopLEDFading() {

  isMachineStarting = false;
  //FastLED.setBrightness(MAX_BRIGHTNESS);
  //FastLED.show();

}

bool isFadeValid(unsigned long currentTime) {

  // Calculate the time elapsed since the last fade
  unsigned long fadeTimeElapsed = currentTime - fadeTime;  
  // Check if it's been more than a specific time interval since the last fade 
  if (fadeTimeElapsed > FADE_INTERVAL) {
    // Check if it's been more a specific time interval since the last data print to serial
    unsigned long dataTimeElapsed = currentTime - fadeLastDataTime;

    if(dataTimeElapsed > FADE_INTERVAL) {

      fadeLastDataTime = currentTime; // Update the time of the last fade data printed on the serial
      return true;

    } 
  } 

  return false;

}

void handleJoystick() {
  // Determine the machine state based on the status message
  MachineState state = getMachineState(TEENSYLineArray);
  // allow moving the joystick only when the machine is in idle state
  if(state == IDLE) {
    joystickPosX = analogRead(JoyStick_X_PIN);
    joystickPosY = analogRead(JoyStick_Y_PIN);
    joystickPosZ = digitalRead(JoyStick_Z_PIN);

    // make sure it is a valid movement
    String joyStickStatus = isJoystickValidMovement(joystickPosX, joystickPosY, joystickPosZ);
    if (joyStickStatus != "") {
      //joystickStatus(joystickMessage, joystickPosX, joystickPosY, joystickPosZ); // Pass joystick array to store the status
      USBSerialPrintln(joyStickStatus);
    }
  }
}

String isJoystickValidMovement(int x, int y, int z) {
  unsigned long currentTime = millis();
  if(isJoystickTimeMovementValid(currentTime)) {
    if(x > JOYSTICK_MAX_THRESHOLD) {
      if(y > JOYSTICK_MAX_THRESHOLD) {
        return "JoyStick:DOWNLEFT";
      } else if(y < JOYSTICK_MIN_THRESHOLD){
        return "JoyStick:UPLEFT";
      } else {
        return "JoyStick:LEFT";
      }
    }

    else if(y > JOYSTICK_MAX_THRESHOLD) {
      if(x > JOYSTICK_MAX_THRESHOLD) {
        return "JoyStick:DOWNLEFT";
      } else if(x < JOYSTICK_MIN_THRESHOLD){
        return "JoyStick:DOWNRIGHT";
      } else {
        return "JoyStick:DOWN";
      }
    }   
      
    else if(x < JOYSTICK_MIN_THRESHOLD) {
      if(y > JOYSTICK_MAX_THRESHOLD) {
        return "JoyStick:DOWNRIGHT";
      } else if(y < JOYSTICK_MIN_THRESHOLD){
        return "JoyStick:UPRIGHT";
      } else {
        return "JoyStick:RIGHT";
      }
    }

    else if(y < JOYSTICK_MIN_THRESHOLD) {
      if(x > JOYSTICK_MAX_THRESHOLD) {
        return "JoyStick:UPLEFT";
      } else if(x < JOYSTICK_MIN_THRESHOLD){
        return "JoyStick:UPRIGHT";
      } else {
        return "JoyStick:UP";
      }   
    }
  }
    return "";
 // Calculate distance from initial position
  // int deltaX = abs(x - JOYSTICK_INITIAL_X);
  // int deltaY = abs(y - JOYSTICK_INITIAL_Y);
  // Check if the joystick has moved significantly or z changed the value
  // if (deltaX > JOYSTICK_ERROR_THRESHOLD || deltaY > JOYSTICK_ERROR_THRESHOLD) {
   //  return isJoystickTimeMovementValid(currentTime);
    // return true;
 //  } else {
   //  joystickLastMovementTime = currentTime; // Update the time of the last movement
   //  return false;
 //  }
}

bool isJoystickTimeMovementValid(unsigned long currentTime) {
  // Calculate the time elapsed since the last movement
  unsigned long movementTimeElapsed = currentTime - joystickLastMovementTime;  
  // Check if it's been more than a specific time interval since the last movement 
  if (movementTimeElapsed > JOYSTICK_XY_STATUS_INTERVAL) {
    // Check if it's been more a specific time interval since the last data print to serial
    unsigned long dataTimeElapsed = currentTime - joystickLastDataTime;
    if(dataTimeElapsed > JOYSTICK_DATA_INTERVAL) {
      joystickLastDataTime = currentTime; // Update the time of the last joystick data printed on the serial
      return true;
    } 
  } 
  return false;
}

void joystickStatus(char* message, int joystickPosX, int joystickPosY, bool joystickPosZ) {
  sprintf(message, "<Joystick,X:%d,Y:%d,Z:%d>", joystickPosX, joystickPosY, !joystickPosZ);
}

void handleLEDOutput() {
  // Determine the machine state based on the status message
  MachineState state = getMachineState(TEENSYLineArray);

  if(state != preState) {
    preState = state;
    // Control the LED based on the machine state
    switch (state) {
      case IDLE:
        setLEDColor(0, 0, 255);  // Blue color
        break;
      case HOLD:
        setLEDColor(255, 255, 0);  // Yellow color
        break;
      case ALARM:
        setLEDColor(255, 0, 0);  // Red color
        break;
      case RUN:
        setLEDColor(0, 255, 0);  // Green color
        break;
      case HOME:
        setLEDColor(160, 32, 240);  // Purple color
        break;
      case DOOR:
        setLEDColor(255, 100, 0);  // Orange color
        break;
      case UNKNOWN:
        setLEDColor(255, 255, 255); // White color
    }
  }
}

MachineState getMachineState(char* status) {
  // Determine the machine state based on the extracted state substring
  if (strstr(status, "Idle") != NULL) {
    return IDLE;
  } else if (strstr(status, "Hold") != NULL) {
    return HOLD;
  } else if (strstr(status, "Alarm") != NULL) {
    return ALARM;
  } else if (strstr(status, "Run") != NULL || strstr(status, "Jog") != NULL) {
    return RUN;
  } else if (strstr(status, "Home") != NULL) {
    return HOME;
  } else if (strstr(status, "Door") != NULL) {
    return DOOR;
  }
  // Default to unknown state if state cannot be determined
  return UNKNOWN;
}

void setLEDColor(int red, int green, int blue) {
  analogWrite(RED_LED_OUTPUT_PIN, red);
  analogWrite(GREEN_LED_OUTPUT_PIN, green);
  analogWrite(BLUE_LED_OUTPUT_PIN, blue);
}

//if considerToolOffset
void handleForceSetTool(char* line, bool considerToolOffset) {

  int toolNumber = extractToolNumber(line);
  int previousToolNumber = 0;
  double toolOffSet = 0;

  if (DEBUGGING_TOOL) { USBSerialPrint("Force tool number: "); }
  if (DEBUGGING_TOOL) { USBSerialPrintln(toolNumber); }

  if (toolNumber > -1) {

    EEPROM.begin(EEPROM_BYTES);

    previousToolNumber = EEPROM.read(CURRENT_TOOL_NUMBER_ADDRESS);

    if (DEBUGGING_TOOL) { USBSerialPrint("previous tool number: "); }
    if (DEBUGGING_TOOL) { USBSerialPrintln(previousToolNumber); }
    if (DEBUGGING_TOOL) { USBSerialPrint("current tool number: "); }
    if (DEBUGGING_TOOL) { USBSerialPrintln(toolNumber); }


    EEPROM.write(CURRENT_TOOL_NUMBER_ADDRESS, toolNumber);

    EEPROM.commit();
    EEPROM.end();

    //change the laser selection accordingly
    //Diode is T2
    //CO2 is T1
    //HIGH on the selection pins means Diode T2 is enabled to FIRE

    if(toolNumber == 1){//CO2 Laser
      
      digitalWrite(ENABLE_DIODE_PIN, HIGH);
      digitalWrite(ENABLE_CO2_PIN, LOW);
      digitalWrite(LASER_RED_POINTER_PIN, HIGH);
      digitalWrite(ENABLE_DIODE_POWER_PIN, HIGH);
      


    }else
    if(toolNumber == 2 ){//Diode

      

      digitalWrite(ENABLE_DIODE_POWER_PIN, LOW);
      digitalWrite(ENABLE_DIODE_PIN, LOW);
      digitalWrite(ENABLE_CO2_PIN, HIGH);
      digitalWrite(LASER_RED_POINTER_PIN, LOW);
       
    }else
    if(toolNumber == 0){//empty

      digitalWrite(ENABLE_DIODE_POWER_PIN, HIGH);
      digitalWrite(ENABLE_DIODE_PIN, HIGH);
      digitalWrite(ENABLE_CO2_PIN, HIGH);
      digitalWrite(LASER_RED_POINTER_PIN, LOW);

    }


    if (considerToolOffset && previousToolNumber > -1 && previousToolNumber < TOOL_AMOUNT) {

      toolOffSet = (tools[toolNumber].toolOffSet - tools[previousToolNumber].toolOffSet);

      if (DEBUGGING_TOOL) { USBSerialPrint("Tool OffSet: "); };
      if (DEBUGGING_TOOL) { USBSerialPrintln(toolOffSet); };

      //SET_TOOL_OFFSET
      //also here we have to wait for an additional ok
      TEENSYSerialPrint(TOOL_SET_TOOL_OFFSET);
      TEENSYSerialPrintln(toolOffSet);
      
      
    }

    if (DEBUGGING_TOOL) { USBSerialPrint("Wrote in EEPROM tool number: "); };
    if (DEBUGGING_TOOL) { USBSerialPrintln(toolNumber); };
  }
}


char readFromUSB() {

  if (Serial.available())
    return Serial.read();
  else
    return NULL_CHAR;
}

char readFromTeensy() {

  if (Serial1.available())
    return Serial1.read();
  else
    return NULL_CHAR;
}

//Check inside the USBLineArray for pico commands
int checkPicoCommand() {

  char* subString = NULL;

  for (int C = 0; C < PICO_COMMAND_AMOUNT; C++) {

    subString = strstr(USBLineArray, PICO_COMMANDS[C]);

    if (subString != NULL) {

      return C;
    }
  }

  return -1;
}

void writeLineTeensy() {

  if (DEBUGGING_BASE) { USBSerialPrint("usb line: "); }
  if (DEBUGGING_BASE) { USBSerialPrintln(USBLineArray); }

  for (int C = 0; C < LINE_BUFFER_CHARACTERS; C++) {

    TEENSYSerialWrite(USBLineArray[C]);

    if (USBLineArray[C] == NEWLINE)
      break;
  }
}

void writeLineUSB() {

  for (int C = 0; C < LINE_BUFFER_CHARACTERS; C++) {

    USBSerialWrite(TEENSYLineArray[C]);

    if (TEENSYLineArray[C] == NEWLINE)
      break;
  }
}

//check for extended ASCII bytes that are used by GRBL for real time commands
//note that those may not visible or writable characters
bool checkGBRLSpecialByte(byte _byte) {

  if ((_byte >= 128 && _byte <= 254) || _byte == GRBL_CTRLX)
    return true;

  return false;
}

//check for special GRBL chars used for real time operations
bool checkGRBLSpecialChar(char _char) {

  if (_char == GRBL_INTERROGATIVE)
    return true;

  if (_char == GRBL_TILDE)
    return true;

  if (_char == GRBL_ESCLAMATIVE)
    return true;

  return false;
}

void askGRBLStatus(int pollingInterval) {

  if (startPollingTime == 0) {

    startPollingTime = millis();
    return;
  }
  
  //here we also need to consider the waitForOk, sending a command only if we clear of waiting for ok, regardless the polling interval
  //WARNING, this maybe be better to be put in the loop? because sometimes this may not be asked because of waiting for ok!!
  if ((millis() - startPollingTime) > pollingInterval && waitForOk <= 0) {
    startPollingTime = 0;
    TEENSYSerialWrite(GRBL_INTERROGATIVE);
    TEENSYSerialWrite(NEWLINE);
    ++waitForOk;
  }
}


void takeTool(int toolNumber) {

  int currentTool = handleReadSpindleTool(false);

  switch (toolNumber) {

    case 0:

      returnTool(currentTool);
      break;

    case 1:
      takeTool1(currentTool);

      break;

    case 2:
      takeTool2(currentTool);

      break;

    default:
      //here we notifiy the server if the tool is out of range
      USBSerialPrintln(TOOL_SYNTAX_ERROR);
      break;
  }
}

void returnTool(int toolToReturn) {

  switch (toolToReturn) {

    case 0:
      break;

    case 1:
      returnTool1();
      break;

    case 2:
      returnTool2();
      break;

    default:
      break;
  }
}

void returnTool1() {

  char* subString = NULL;
  int syncActionIndex = -1;

  for (int C = 0; C < TOOL_MACRO_LINES; C++) {

    if (MACRO_RETURN_T1[C][0] == NULL_CHAR)
      return;

    subString == NULL;

    //SET_TOOL
    subString = strstr(MACRO_RETURN_T1[C], tools[0].toolSetAction);

    if (subString != NULL) {

      //find the first free action slot/index
      syncActionIndex = firstEmptyAction();


      //WARNING here we need to match the position according to MACRO_TAKE_T1
      strcpy(syncActions[syncActionIndex].type, tools[0].toolSetAction);
      syncActions[syncActionIndex].positionX = -211.2;
      syncActions[syncActionIndex].positionY = -85.0;
      //syncActions[syncActionIndex].positionZ = -2;

      syncActions[syncActionIndex].positionRange = 2.5;
      syncActions[syncActionIndex].pollingInterval = 100;
      continue;
    }

    //if no special commands are found then we sent the injected macro to TEENSY
    writeMACROLine(MACRO_RETURN_T1[C]);
  }
}

void returnTool2() {

  char* subString = NULL;
  int syncActionIndex = -1;

  for (int C = 0; C < TOOL_MACRO_LINES; C++) {

    if (MACRO_RETURN_T2[C][0] == NULL_CHAR)
      return;

    subString == NULL;

    //SET_TOOL
    subString = strstr(MACRO_RETURN_T2[C], tools[0].toolSetAction);

    if (subString != NULL) {

      //find the first free action slot/index
      syncActionIndex = firstEmptyAction();


      //WARNING here we need to match the position according to MACRO_TAKE_T1
      strcpy(syncActions[syncActionIndex].type, tools[0].toolSetAction);
      syncActions[syncActionIndex].positionX = -34.8;
      syncActions[syncActionIndex].positionY = -90.0;
      //syncActions[syncActionIndex].positionZ = -2;

      syncActions[syncActionIndex].positionRange = 2.5;
      syncActions[syncActionIndex].pollingInterval = 100;
      continue;
    }

    //if no special commands are found then we sent the injected macro to TEENSY
    writeMACROLine(MACRO_RETURN_T2[C]);
  }
}



void takeTool1(int currentTool) {

  char* subString = NULL;
  int syncActionIndex = -1;

  //if we already have the TX in spindle we do nothing
  if (currentTool == 1) {

    //here we notify the server the tool change is successfull becuase already in spindle
    USBSerialPrintln(TOOL_CHANGER_SUCCESS);
    return;
  }

  //first read what tool is in spindle, if T0 directly take the tool, otherwise bring back the current tool first
  returnTool(currentTool);

  for (int C = 0; C < TOOL_MACRO_LINES; C++) {

    if (MACRO_TAKE_T1[C][0] == NULL_CHAR)
      return;

    subString == NULL;

    //SET_TOOL
    subString = strstr(MACRO_TAKE_T1[C], tools[1].toolSetAction);

    if (subString != NULL) {

      //find the first free action slot/index
      syncActionIndex = firstEmptyAction();


      //WARNING here we need to match the position according to MACRO_TAKE_T1
      strcpy(syncActions[syncActionIndex].type, tools[1].toolSetAction);
      syncActions[syncActionIndex].positionX = -252.2;
      syncActions[syncActionIndex].positionY = -75.0;
      //syncActions[syncActionIndex].positionZ = -2;

      syncActions[syncActionIndex].positionRange = 2.5;
      syncActions[syncActionIndex].pollingInterval = 100;
      continue;
    }

    //if no special commands are found then we sent the injected macro to TEENSY
    writeMACROLine(MACRO_TAKE_T1[C]);
  }
}

void takeTool2(int currentTool) {

  char* subString = NULL;
  int syncActionIndex = -1;

  //if we already have the TX in spindle we do nothing
  if (currentTool == 2) {

    //here we notify the server the tool change is successfull becuase already in spindle
    USBSerialPrintln(TOOL_CHANGER_SUCCESS);
    return;
  }


  //first read what tool is in spindle, if T0 directly take the tool, otherwise bring back the current tool first
  returnTool(currentTool);

  for (int C = 0; C < TOOL_MACRO_LINES; C++) {

    if (MACRO_TAKE_T2[C][0] == NULL_CHAR)
      return;

    subString == NULL;

    //SET_TOOL
    subString = strstr(MACRO_TAKE_T2[C], tools[2].toolSetAction);

    if (subString != NULL) {

      //find the first free action slot/index
      syncActionIndex = firstEmptyAction();


      //WARNING here we need to match the position according to MACRO_TAKE_T1
      strcpy(syncActions[syncActionIndex].type, tools[2].toolSetAction);
      syncActions[syncActionIndex].positionX = -88.8;
      syncActions[syncActionIndex].positionY = -80.0;
      //syncActions[syncActionIndex].positionZ = -2;

      syncActions[syncActionIndex].positionRange = 2.5;
      syncActions[syncActionIndex].pollingInterval = 100;
      continue;
    }

    //if no special commands are found then we sent the injected macro to TEENSY
    writeMACROLine(MACRO_TAKE_T2[C]);
  }
}

////////////////////////////////////////////////////////HANDLE METHODS////////////////////////////////////////////////////////////
void handleUSBLine() {

  if (DEBUGGING_BASE) { USBSerialPrintln("line read from USB"); }

  int commandIndex = -1;

  commandIndex = checkPicoCommand();

  if (DEBUGGING_BASE) { USBSerialPrint("commandIndex: "); }
  if (DEBUGGING_BASE) { USBSerialPrintln(commandIndex); }

  //check is there is GCODE command of the ones that the PICO has to use, otherwise send it to TEENSY
  if (commandIndex != -1) {

    if (DEBUGGING_TOOL) { USBSerialPrint("PICO command detected:"); }
    //if (DEBUGGING_TOOL) { USBSerialPrintln(PICO_COMMANDS[commandIndex]); }
    if (DEBUGGING_TOOL) { USBSerialPrintln(commandIndex); }

    switch (commandIndex) {

      case 0:  //M6 case 0 tool change
        handleM6();
        break;

      case 1:  //AIR_ON case 1 activate tool change air
        handleAirOn();
        break;

      case 2:  //AIR_OFF case 2 de-activate tool change air
        handleAirOff();
        break;

      case 3:  // CLEAR_EEPROM case 3 clear EEPROM
        handleClearEEPROM();
        break;

      case 4:  //SET_TOOL case 4 force tool, see the define for warning
        handleForceSetTool(USBLineArray, false);
        break;

      case 5:  //READ_TOOL case 5 read tool
        handleReadSpindleTool(true);
        break;

      case 6:  //IS_AIR check if air is enabled or not
        handleIsAirOn(true);
        break;

      case 7:  //case 7 print tool info from the tool struct current in memory, which in turn is loaded from EEPROM
        handlePrintToolInfo(USBLineArray);
        break;

      case 8:
        //SET_TOOL_DESCRIPTION, //case 8 set tool description
        handleSetToolDescription();
        break;

      case 9:
        //SET_TOOL_DIAMETER,  //case 9 set tool diameter
        handleSetToolDiameter();
        break;

      case 10:
        //SET_TOOL_OFFSET,    //case 10 set tool offset, this tool offset is for now the tool body length
        handleSetToolOffset();
        break;

      case 11:
        //SET_TOOL_CLOCKWISE, //case 11 set tool rotation, clockwise, counterclockwise
        handleSetToolRotation();
        break;

      case 12:
        //SET_TOOL_LENGTH,   //case 12 set tool length
        handleSetToolLength();
        break;

      case 13:
        //PRINT_TOOLS_INFO, //case 13 print infos about all the tools
        handlePrintToolsInfo();
        break;
      
      case 14:
        handleEnableStatus();
        break;
      case 15:
        handleDisableStatus();
        break;

      default:
        break;
    }

  } else {

    writeLineTeensy();
  }
}

void handleTEENSYLine() {

  if (DEBUGGING_BASE) { USBSerialPrintln("line read from TEENSY"); }

  //here is important to distinguish between a pass trough command and when we are during a tool change
  //during tool change trackingPosition is active and also we maybe waiting for ok from GRBL
  //in both situation, during the tool change, we avoid data going to the server
  //we need to remember that an ok must be sent to the server after each successful tool change action set tool

  //check for MPos and update positions in case is there and trackPosition is true
  if (trackingPosition) {
    //check if MPOS is in the line to detect report lines
    char* subString = strstr(TEENSYLineArray, GRBL_MPOS);
    int bufferPositionX = 0.0;
    int bufferPositionY = 0.0;
    int bufferPositionZ = 0.0;

    if (subString != NULL) {

      //extract the positions from the TEENSYLine
      subString = subString + 5;  //here we are at the end of MPos
      bufferPositionX = atof(subString);

      //now go on until you encounter a comma
      while (subString[0] != ',')
        ++subString;

      ++subString;

      bufferPositionY = atof(subString);

      while (subString[0] != ',')
        ++subString;

      ++subString;

      bufferPositionZ = atof(subString);

      if (bufferPositionX != 0 && bufferPositionY != 0 && bufferPositionZ != 0) {

        lastPositionX = bufferPositionX;
        lastPositionY = bufferPositionY;
        lastPositionZ = bufferPositionZ;

        writeLineUSB();
        return;

        //if (DEBUGGING_TOOL) { USBSerialPrint("Last position X,Y,Z: "); }
        //if (DEBUGGING_TOOL) { USBSerialPrint(lastPositionX); }
        //if (DEBUGGING_TOOL) { USBSerialPrint(","); }
        //if (DEBUGGING_TOOL) { USBSerialPrint(lastPositionY); }
        //if (DEBUGGING_TOOL) { USBSerialPrint(","); }
        //if (DEBUGGING_TOOL) { USBSerialPrintln(lastPositionZ); }
      }
    }

    //also here consider the case of other reporting and avoid to send it to the server
    subString = strstr(TEENSYLineArray, GRBL_STATUS_START_STRING);

    if (subString != NULL)
      return;

    subString = strstr(TEENSYLineArray, GRBL_STATUS_END_STRING);

    if (subString != NULL)
      return;

    //here return also if there is an ok
    subString = strstr(TEENSYLineArray, GRBL_OK);

    if (subString != NULL) {

      if (waitForOk > 0)
        --waitForOk;
      return;
    }
  }


  //in case we are waiting for "ok" from grbl here we check if we have received one
  //additionally from when tracking position is false, just to clear the oks waiting
  if (waitForOk > 0) {

    //check if ok is in the line
    char* subString = strstr(TEENSYLineArray, GRBL_OK);

    if (subString != NULL) {

      --waitForOk;
      return;
    }
  }
  
  char* endMachineStatus = strchr(TEENSYLineArray, '>');

  if (endMachineStatus != NULL) {

     // check the machine tool
    int toolNumber = handleReadSpindleTool(false);
    
    // Calculate the length up to the '>'
    int length = endMachineStatus - TEENSYLineArray;
    
    // Copy the substring excluding the '>'
    TEENSYLineArray[length] = NULL_CHAR;
    
    // Append the tool number
    sprintf(TEENSYLineArray + length, "|T:%d>\n", toolNumber);
    //USBSerialPrintln(TEENSYLineArray);

  }

  //if not during a tool changer or for other lines, we send them to the server
  writeLineUSB();

}

void handleSetToolLength() {

  char* subString = NULL;
  double toolLength = 0;

  int toolNumber = extractToolNumber(USBLineArray);

  if (DEBUGGING_TOOL) { USBSerialPrint("Tool detected: "); }
  if (DEBUGGING_TOOL) { USBSerialPrintln(toolNumber); }

  if (toolNumber > 0) {

    subString = strchr(USBLineArray, TOOL_DATA_START_CHAR);

    if (subString != NULL && subString[1] != NULL_CHAR) {

      ++subString;
      toolLength = atof(subString);

      if (toolLength != 0 && toolLength < TOOL_MAX_LENGTH) {

        tools[toolNumber].length = toolLength;
        writeToolEEPROM(toolNumber);
      }
    }
  }
}

void handleSetToolRotation() {

  char* subString = NULL;
  char* subBoolString = NULL;
  bool rotation;

  int toolNumber = extractToolNumber(USBLineArray);

  if (DEBUGGING_TOOL) { USBSerialPrint("Tool detected: "); }
  if (DEBUGGING_TOOL) { USBSerialPrintln(toolNumber); }

  if (toolNumber > 0) {

    subString = strchr(USBLineArray, TOOL_DATA_START_CHAR);

    if (subString != NULL && subString[1] != NULL_CHAR) {

      ++subString;

      subBoolString = strstr(subString, TRUE);

      if (subBoolString != NULL) {

        tools[toolNumber].clockwise = true;
        writeToolEEPROM(toolNumber);
        return;
      }

      subBoolString = NULL;
      subBoolString = strstr(subString, FALSE);

      if (subBoolString != NULL) {

        tools[toolNumber].clockwise = false;
        writeToolEEPROM(toolNumber);
        return;
      }
    }
  }
}

void handleSetToolOffset() {

  char* subString = NULL;
  double toolOffSet = 0;

  int toolNumber = extractToolNumber(USBLineArray);

  if (DEBUGGING_TOOL) { USBSerialPrint("Tool detected: "); }
  if (DEBUGGING_TOOL) { USBSerialPrintln(toolNumber); }

  if (toolNumber > 0) {

    subString = strchr(USBLineArray, TOOL_DATA_START_CHAR);

    if (subString != NULL && subString[1] != NULL_CHAR) {

      ++subString;
      toolOffSet = atof(subString);

      if (toolOffSet != 0 && toolOffSet < TOOL_MAX_OFFSET) {

        tools[toolNumber].toolOffSet = toolOffSet;
        writeToolEEPROM(toolNumber);
      }
    }
  }
}

void handleSetToolDiameter() {

  char* subString = NULL;
  double toolDiameter = 0;

  int toolNumber = extractToolNumber(USBLineArray);

  if (DEBUGGING_TOOL) { USBSerialPrint("Tool detected: "); }
  if (DEBUGGING_TOOL) { USBSerialPrintln(toolNumber); }

  if (toolNumber > 0) {

    subString = strchr(USBLineArray, TOOL_DATA_START_CHAR);

    if (subString != NULL && subString[1] != NULL_CHAR) {

      ++subString;
      toolDiameter = atof(subString);

      if (toolDiameter > 0 && toolDiameter < TOOL_MAX_DIAMETER) {

        tools[toolNumber].toolDiameter = toolDiameter;

        writeToolEEPROM(toolNumber);
      }
    }
  }
}

void handleSetToolDescription() {

  char* subString = NULL;
  int toolNumber = extractToolNumber(USBLineArray);

  if (toolNumber > 0) {  //force setting data only for tool number 1 or more

    subString = strchr(USBLineArray, TOOL_DATA_START_CHAR);

    if (subString != NULL && subString[1] != NULL_CHAR && sizeof(subString) <= TOOL_DESCRIPTION_CHARS) {

      ++subString;
      strcpy(tools[toolNumber].toolDescription, subString);

      replaceReturnAndNewlines(tools[toolNumber].toolDescription, ' ');
      writeToolEEPROM(toolNumber);
    }
  }
}

void handlePrintToolsInfo() {

  for (int C = 0; C < TOOL_AMOUNT; C++)
    handlePrintToolInfo(tools[C].toolName);
}

void handlePrintToolInfo(char* line) {

  //find which tool it is

  int toolNumber = extractToolNumber(line);

  /*
  char toolName[5];
  char toolDescription[TOOL_DESCRIPTION_CHARS];
  char toolSetAction[10];
  double toolDiameter;
  int toolNumber;
  float toolOffSet;
  bool clockwise;
  double length;
  */

  if (toolNumber > 0) {  //do not print T0 stuff, as it is reserved

    USBSerialPrint("Printing data of tool number ");
    USBSerialPrintln(toolNumber);

    USBSerialPrint("Tool name: ");
    USBSerialPrintln(tools[toolNumber].toolName);
    USBSerialPrint("Tool description: ");
    USBSerialPrintln(tools[toolNumber].toolDescription);
    USBSerialPrint("Tool set action: ");
    USBSerialPrintln(tools[toolNumber].toolSetAction);
    USBSerialPrint("Tool number: ");
    USBSerialPrintln(tools[toolNumber].toolNumber);
    USBSerialPrint("Tool OffSet: ");
    USBSerialPrintln(tools[toolNumber].toolOffSet);
    USBSerialPrint("Tool rotation: ");


    if (tools[toolNumber].clockwise)
      USBSerialPrintln("true");
    else
      USBSerialPrintln("false");

    USBSerialPrint("Tool length: ");
    USBSerialPrintln(tools[toolNumber].length);
    USBSerialPrint("Tool diameter: ");
    USBSerialPrintln(tools[toolNumber].toolDiameter);



    USBSerialPrintln(" ");
  }
}


void handleClearEEPROM() {

  EEPROM.begin(EEPROM_BYTES);

  for (int C = 0; C < EEPROM_BYTES; C++)
    EEPROM.write(C, EEPROM_EMPTY_BYTE);

  EEPROM.commit();
  EEPROM.end();

  EEPROM.begin(EEPROM_BYTES);
  //by default put tool 0 in spindle
  EEPROM.write(CURRENT_TOOL_NUMBER_ADDRESS, 0);
  EEPROM.commit();
  EEPROM.end();

  //also the tools in memory should be erased otherwise we need to have reboot
  initTools();
}

void handleAirOn() {

  if (DEBUGGING_TOOL) { USBSerialPrintln("Air is on"); }
  airOn = true;
}

bool handleIsAirOn(bool print) {

  if (print) {

    USBSerialPrint("Air status is: ");
    USBSerialPrintln(airOn);
  }

  return airOn;
}

void handleAirOff() {

  if (DEBUGGING_TOOL) { USBSerialPrintln("Air is off"); }
  airOn = false;
}

void handleM6() {

  //find which tool it is
  int toolNumber = extractToolNumber(USBLineArray);

  if (DEBUGGING_TOOL) { USBSerialPrint("detected tool number: "); };
  if (DEBUGGING_TOOL) { USBSerialPrintln(toolNumber); };

  if (toolNumber > -1) {

    takeTool(toolNumber);

  }
  //if a tool number is not detected we notice the server of the syntax mistake
  else {

    USBSerialPrintln(TOOL_SYNTAX_ERROR);
  }
}

int handleReadSpindleTool(bool print) {

  int toolNumber = -1;

  EEPROM.begin(EEPROM_BYTES);

  toolNumber = EEPROM.read(CURRENT_TOOL_NUMBER_ADDRESS);

  EEPROM.end();

  if (DEBUGGING_TOOL || print) {

    USBSerialPrint("Tool in spindle: ");
    USBSerialPrintln(toolNumber);
  }

  return toolNumber;
}

void handleEnableStatus() {
  getStatus = true;
  USBSerialPrintln("Get machine status during tool change: Enabled");
}

void handleDisableStatus() {
  getStatus = false;
  USBSerialPrintln("Get machine status during tool change: Disabled");
}

////////////////////////////////////////////////////////UTILITY METHODS////////////////////////////////////////////////////////////
void writeToolEEPROM(int toolNumber) {

  EEPROM.begin(EEPROM_BYTES);

  EEPROM.put(TOOL_STRUCTS_INITIAL_ADDRESS + (sizeof(tools[toolNumber]) * toolNumber), tools[toolNumber]);

  EEPROM.commit();
  EEPROM.end();
}

void replaceReturnAndNewlines(char* line, char replace) {

  char* subString = strchr(line, NEWLINE);

  while (subString != NULL) {

    subString[0] = replace;
    subString = strchr(line, NEWLINE);
  }

  subString = strchr(line, RETURN);

  while (subString != NULL) {

    subString[0] = replace;
    subString = strchr(line, RETURN);
  }
}

int extractToolNumber(char* line) {

  char* subString = NULL;
  char* numberSubString = NULL;
  int toolNumber = -1;

  for (int C = 0; C < TOOL_AMOUNT; C++) {

    subString = strstr(line, tools[C].toolName);

    if (subString != NULL) {

      numberSubString = subString + 1;
      toolNumber = atoi(numberSubString);

      if (toolNumber == C)
        break;
      else
        toolNumber = -1;
    }
  }

  return toolNumber;
}


void initTools() {

  //try to read the data deom the EEPROM if any is present
  //if not just use default values
  //toolName, toolNumber, toolSetAction are not taken from EEPROM but fixed in define/const chars above

  EEPROM.begin(EEPROM_BYTES);
  byte bufferByte;
  int startAddress;
  Tool eepromTool;

  for (int C = 0; C < TOOL_AMOUNT; C++) {

    //fixed data from constants
    strcpy(tools[C].toolName, TOOL_NAMES[C]);
    tools[C].toolNumber = C;
    strcpy(tools[C].toolSetAction, SET_TOOL_COMMANDS[C]);

    //here data that can be read from EEPROM if not empty
    startAddress = TOOL_STRUCTS_INITIAL_ADDRESS + (sizeof(tools[C]) * C);
    EEPROM.get(startAddress, eepromTool);

    bufferByte = byte(eepromTool.toolDescription[0]);

    if (bufferByte != EEPROM_EMPTY_BYTE)
      strcpy(tools[C].toolDescription, eepromTool.toolDescription);
    else
      clearCharArray(tools[C].toolDescription, TOOL_DESCRIPTION_CHARS);

    bufferByte = byte(eepromTool.toolDiameter);

    if (bufferByte != EEPROM_EMPTY_BYTE && eepromTool.toolDiameter < TOOL_MAX_OFFSET)
      tools[C].toolDiameter = eepromTool.toolDiameter;
    else
      tools[C].toolDiameter = 0;

    bufferByte = byte(eepromTool.toolOffSet);

    if (bufferByte != EEPROM_EMPTY_BYTE && eepromTool.toolOffSet < TOOL_MAX_OFFSET)
      tools[C].toolOffSet = eepromTool.toolOffSet;
    else
      tools[C].toolOffSet = 0;

    bufferByte = byte(eepromTool.clockwise);

    if (bufferByte != EEPROM_EMPTY_BYTE)
      tools[C].clockwise = eepromTool.clockwise;
    else
      tools[C].clockwise = true;

    bufferByte = byte(eepromTool.length);

    if (bufferByte != EEPROM_EMPTY_BYTE && eepromTool.length < TOOL_MAX_LENGTH)
      tools[C].length = eepromTool.length;
    else
      tools[C].length = 0;
  }

  EEPROM.end();
}


char* copyCharArray(const char* _array) {

  char* ret = new char[strlen(_array) + 1];
  strcpy(ret, _array);
  return ret;
}

void resetLastPostions() {

  lastPositionX = 0.0;
  lastPositionY = 0.0;
  lastPositionZ = 0.0;
}

int firstSyncAction() {

  for (int C = 0; C < SYNC_ACTION_AMOUNT; C++)
    if (syncActions[C].type[0] != NULL_CHAR)
      return C;

  return -1;
}

int lastSyncAction() {

  for (int C = SYNC_ACTION_AMOUNT - 1; C > -1; C--)
    if (syncActions[C].type[0] != NULL_CHAR)
      return C;

  return -1;
}

int firstMacroBufferLine() {

  for (int C = 0; C < TOOL_MACRO_BUFFER_LINES; C++)
    if (bufferMacroLines[C][0] != NULL_CHAR)
      return C;

  return -1;
}



int firstEmptyAction() {

  for (int C = 0; C < SYNC_ACTION_AMOUNT; C++)
    if (syncActions[C].type[0] == NULL_CHAR)
      return C;

  return -1;
}


void writeMACROLine(const char _array[]) {

  //check first empty element in the bufferMacroLines
  //add the current macro line to that
  //the loop will take care of writing those to teensy waiting for the ok
  for (int C = 0; C < TOOL_MACRO_BUFFER_LINES; C++) {
    
    if (bufferMacroLines[C][0] == NULL_CHAR) {
      strcpy(bufferMacroLines[C], _array);
      return;
    }

    //if there is no space in the buffer we skip the macro line
    //we absolutely avoid that because other wise some commands for the tool changer will not be executed
  }


  /*
//OLD CODE BELOW
//////////

  for (int C = 0; C < TOOL_MACRO_CHARS; C++) {

    if (_array[C] == NULL_CHAR) {

      //USBSerialWrite(NEWLINE);
      TEENSYSerialWrite(NEWLINE);
      break;
    
    }

    //USBSerialWrite(_array[C]);
    TEENSYSerialWrite(_array[C]);
  
  }*/
}

int findCharPos(char _array[], int length, char toFind) {

  for (int C = 0; C < length; C++) {

    if (_array[C] == toFind || _array[C] != NULL_CHAR)
      return C;
  }

  return -1;
}

void resetTEENSYLine() {

  clearCharArray(TEENSYLineArray, LINE_BUFFER_CHARACTERS);
  TEENSYLinePos = 0;
  bufferCharTEENSY = NULL_CHAR;
}

void resetUSBLine() {

  clearCharArray(USBLineArray, LINE_BUFFER_CHARACTERS);
  USBLinePos = 0;
  bufferCharUSB = NULL_CHAR;
}

void resetBufferMacroLines() {

  for (int C = 0; C < TOOL_MACRO_BUFFER_LINES; C++)
    clearCharArray(bufferMacroLines[C], TOOL_MACRO_BUFFER_CHARS);
}

void resetSyncActions() {

  for (int C = 0; C < SYNC_ACTION_AMOUNT; C++) {

    clearCharArray(syncActions[C].type, SYNC_ACTION_CHARS);
    syncActions[C].positionX = 0;
    syncActions[C].positionY = 0;
    syncActions[C].positionZ = 0;
    syncActions[C].positionRange = 0;
    syncActions[C].pollingInterval = 0;
  }
}

void resetSyncAction(int index) {

  clearCharArray(syncActions[index].type, SYNC_ACTION_CHARS);
  syncActions[index].positionX = 0;
  syncActions[index].positionY = 0;
  syncActions[index].positionZ = 0;
  syncActions[index].positionRange = 0;
  syncActions[index].pollingInterval = 0;
}

void clearCharArray(char _array[], int pos) {

  for (int C = 0; C < pos; C++) {

    if (_array[C] == NULL_CHAR)
      break;

    _array[C] = NULL_CHAR;
  }
}

bool isEEPROMByteUsed(int index) {

  EEPROM.begin(EEPROM_BYTES);

  if (EEPROM.read(index) == EEPROM_EMPTY_BYTE) {

    EEPROM.end();
    return false;
  }

  return true;
}

void TEENSYSerialWrite(byte _byte) {

  Serial1.write(_byte);
  Serial1.flush();
}

void TEENSYSerialWrite(char _char) {

  Serial1.write(_char);
  Serial1.flush();
}

void TEENSYSerialPrintln(char* _char) {

  Serial1.print(_char);
  Serial1.println();
  Serial1.flush();
}

void TEENSYSerialPrint(char* _char) {

  Serial1.print(_char);
  Serial1.flush();
}


void TEENSYSerialPrintln(int _int) {

  Serial1.print(_int);
  Serial1.println();
  Serial1.flush();
}

void TEENSYSerialPrint(int _int) {

  Serial1.print(_int);
  Serial1.flush();
}


void USBSerialPrintln() {

  Serial.println();
  Serial.flush();
}

void USBSerialPrintln(char* _string) {

  Serial.print(_string);
  Serial.println();
  Serial.flush();
}

void USBSerialPrintln(String _string) {

  Serial.print(_string);
  Serial.println();
  Serial.flush();
}

void USBSerialPrint(char* _string) {

  Serial.print(_string);
  Serial.flush();
}

void USBSerialPrint(String _string) {

  Serial.print(_string);
  Serial.flush();
}

void USBSerialPrintln(const char* _string) {

  Serial.print(_string);
  Serial.println();
  Serial.flush();
}

void USBSerialPrintln(int _int) {

  Serial.print(_int);
  Serial.println();
  Serial.flush();
}

void USBSerialPrint(double _double) {

  Serial.print(_double, 3);
  Serial.flush();
}

void USBSerialPrintln(double _double) {

  Serial.print(_double, 3);
  Serial.println();
  Serial.flush();
}

void USBSerialPrint(unsigned long _long) {

  Serial.print(_long);
  Serial.flush();
}

void USBSerialPrintln(unsigned long _long) {

  Serial.print(_long);
  Serial.println();
  Serial.flush();
}

void USBSerialWrite(byte _byte) {

  Serial.write(_byte);
  Serial.flush();
}

void USBSerialWrite(char _char) {

  Serial.write(_char);
  Serial.flush();
}
