<div align="center"><h1 style=align="center">Open Lab Operating System</h1></div>
<div align="center"><img src="" width="100%"></div>
<div align="center"><i>Open Source Operating System for Open Source Digital Fabrication Machines

</i></div>

## 1. Controller Code

The controller code is responsible for managing the CNC tool changer. It handles machine logic to facilitate seamless tool changes between different types of tools (drilling headers 1-12). The code is written in C and can be modified using the Arduino IDE. After modifications, it can be flashed into the controller for execution.

## 2. Machine Interface

The Machine Interface is a web-based platform that allows users to interact with the machines in real-time. It is built using JavaScript and JQuery, providing a WebSocket connection for efficient communication with the Machine Server. Key functionalities of the interface include:

- Upload Gcode Files
- Jog the machine in different directions and speeds
- Display the status of the machine
- File management system for executing, implementing, and deleting files
- Command Line Input

To run the Machine Interface, use a live server (e.g., VSCode Live Server extension) to serve the main folder.

## 3. Machine Server

The Machine Server acts as the brain of the machine, handling communication and calculations. The server is written in Python, utilizing multiprocessing and shared memory technologies where each service operates as a separate process, communicating with the Core using shared memory objects. It consists of four main services or modules:

- **Core:** Orchestrates communication between all services in the server, synchronizing processes between the user interface, machine controller, and file manager.

- **Machine Connector:** Manages the serial connection with the machine controller, facilitating communication with the core to handle server connection with the machine.

- **WebSocket Server:** Initiates a WebSocket server to establish real-time communication with the interface. Handles reading and writing from the WebSocket connection and forwards data to the core for analysis.

- **File Management:** Allows the server to create, open, close, and delete files. It also contains a directory for storing user-uploaded files. The code is written in Python, utilizing multiprocessing and shared memory technology to run each service as a separate process.

#### Running the Server:

- Navigate to the server directory: `cd path/to/server`
- Create a virtual environment (if not already created): `python -m venv venv`
- Activate the environment:
  - **Mac/Linux:** `source venv/bin/activate`
  - **Windows:** `venv\Scripts\activate`
- Install dependencies from requirements.txt: `pip install -r requirements.txt`
- Run the application: `python src/main.py`
- Configure server settings in the .env file (development/production mode, server metrics, etc.).

## Running the Whole System:

- Flush the C code into the controller (if needed).
- Run the Machine Server and ensure WebSocket connection channels match with the interface.
- Run the Machine Interface.

Getting started
--

Author
--

Open Lab Operating System has been developed by **[InMachines Ingrassia GmbH](https://www.inmachines.net/)**.

<img src="https://irp.cdn-website.com/2b5ccdcd/dms3rep/multi/InMachines_Logo_positive_white.png" width="50%">

<br>

Software Development:
- **[Daniele Ingrassia](https://www.linkedin.com/in/danieleingrassia/)**
- **[Sulaiman Tanbari](https://www.linkedin.com/in/mohammad-sulaiman-tanbari/)**
  
The software is part of the **[Open Lab Starter Kit (OLSK)](https://www.inmachines.net/open-lab-starter-kit)** group of open source digital fabrication machines.

OLSK is developed by **[InMachines Ingrassia GmbH](https://www.inmachines.net/)** for the **[Dtec project](https://dtecbw.de/home/forschung/hsu/projekt-fabcity)** at **[Fab City Hamburg](https://www.fabcity.hamburg/en/)**.

OLSK Partners:
<br><br>
<img src="https://irp.cdn-website.com/2b5ccdcd/dms3rep/multi/OLSK_partners.png" width="80%">


Contact
--

- daniele@inmachines.net
- [https://www.inmachines.net/](https://www.inmachines.net/)


License
--
This software is licensed under **[GNU General Public License v3.0](LICENSE.txt)**.
