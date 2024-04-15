import asyncio
import json
import time
import websockets
from decouple import config
from multiprocessing import Process

from .constants import WebsocketConstants as constants


class WebSocketConnector(Process):
    def __init__(self, websocket_server_data):
        super(WebSocketConnector, self).__init__()
        self._websocket_connections = set()
        self._is_connected = False

        # shared objects with the core
        self.websocket_server_data = websocket_server_data

        # Lockers to make sure not to allow opening multiple connections during refresh
        self._recv_lock = asyncio.Lock()
        self._send_lock = asyncio.Lock()

    # start websocket connection
    def run(self):
        try:
            asyncio.run(self.start_websocket_server())

        except websockets.WebSocketException as error:
            print("Websocket Connection Error:", error)

        finally:
            asyncio.run(self.disconnect_websocket())

    # Start the WebSocket server

    async def start_websocket_server(self):
        try:
            server = await websockets.serve(
                self.handle_client,
                config("HOST"),
                config("WEBSOCKET_PORT"),
                max_size=constants.MAX_FRAME_SIZE
            )

            if config("ENV") == "development":
                print("Websocket settings:")
                print("-> HostName:", config('HOST'))
                print("-> Port:", config("WEBSOCKET_PORT"))
                print('Websocket connection started')

            self._is_connected = True
            # keep the event loop running
            await server.wait_closed()

        # error the port is busy
        except OSError as e:
            if e.errno == 10048:
                print(
                    f'Error: Port {config("WEBSOCKET_PORT")} is already in use. Choose a different port.')
                await self.reconnect_to_websocket()
            else:
                print(f"Error: {e}")

    async def handle_client(self, websocket, path):
        self._websocket_connections.add(websocket)
        try:
            while True:
                # Delay to not consume the CPU
                await asyncio.sleep(constants.TIMEOUT)
                await asyncio.gather(
                    self.send_data_to_users(),
                    self.receive_data_from_users()
                )

        except websockets.exceptions.ConnectionClosedOK:
            print("WebSocket connection closed by the client")
            self._websocket_connections.discard(
                websocket)  # Remove closed connection
            if not self._websocket_connections:  # Check if there are no connections left
                self._is_connected = False

        except websockets.exceptions.ConnectionClosedError:
            print("WebSocket connection closed unexpectedly")
            self._websocket_connections = set()
            self._is_connected = False

    # add new command to the websocket read queue
    def add_to_websocket_read_queue(self, type, priority, command):
        self.websocket_server_data.websocket_read_queue.put(
            type, priority, command)

    # add new command to the websocket write queue
    def add_to_websocket_write_queue(self, type, priority, command):
        self.websocket_server_data.websocket_write_queue.put(
            type, priority, command)

    # Handle data that the server wants to send to the user
    async def send_data_to_users(self):
        # wait in case the user refresh the browser and we lose the websocket connection

        async with self._send_lock:
            # there is data need to be shown to the user
            # and there is connection
            if (not self.websocket_server_data.websocket_write_queue.empty() and
                    self._websocket_connections):
                type, data = self.websocket_server_data.websocket_write_queue.get(
                )

                # Send to all the clients connected to server
                await asyncio.gather(*(ws_connection.send(data) for ws_connection in self._websocket_connections))

    # Handle sent data from the user
    async def receive_data_from_users(self):
        async with self._recv_lock:
            if len(self._websocket_connections):
                await asyncio.gather(*(self.analyze_user_message(ws_connection) for ws_connection in self._websocket_connections))

    async def analyze_user_message(self, ws_connection):
        try:

            # Receive data if possible every 10 ms
            json_data = await asyncio.wait_for(ws_connection.recv(), timeout=constants.TIMEOUT)
            if json_data:

                # Extract type and data from the dictionary
                data_dict = json.loads(json_data)
                type = data_dict.get('type')
                data = data_dict.get('data')

                if config("ENV") == 'development':
                    print("Data received from user: ", data_dict)

                # Process the received data
                self.add_to_websocket_read_queue(type,
                                                 constants.HIGH_PRIORITY_COMMAND,
                                                 data)

        except asyncio.TimeoutError:
            pass  # Continue the loop if no data received within the timeout

        except Exception as e:
            print(f"An error occurred: {e}")

    async def disconnect_websocket(self):
        if self._websocket_connections:
            await self._websocket_connections.close()
            self._websocket_connections = None
            self._is_connected = False
            print("Websocket connection closed")

        else:
            print("Websocket connection is already closed")

        await self.reconnect_to_websocket()

    async def reconnect_to_websocket(self):
        while not self._is_connected:
            print('Wait 5 seconds.Trying to connect to Websocket server...')
            await asyncio.sleep(5)

            # rerun the server
            await self.start_websocket_server()
