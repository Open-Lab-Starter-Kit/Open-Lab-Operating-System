import asyncio
import time
import websockets
from decouple import config
from multiprocessing import Process

from .constants import WebsocketConstants as constants


class WebSocketServer(Process):
    def __init__(self, websocket_server_data):
        super(WebSocketServer, self).__init__()
        self._websocket_connection = None
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
                config("HOST_NAME"),
                config("PORT"),
                max_size=constants.MAX_FRAME_SIZE
            )

            if config("ENV") == "development":
                print("Websocket settings:")
                print("-> HostName:", config('HOST_NAME'))
                print("-> Port:", config("PORT"))

            print('Websocket connection started')

            self._is_connected = True
            # keep the event loop running
            await server.wait_closed()

        # error the port is busy
        except OSError as e:
            if e.errno == 10048:
                print(
                    f'Error: Port {config("PORT")} is already in use. Choose a different port.')
                await self.reconnect_to_websocket()
            else:
                print(f"Error: {e}")

    async def handle_client(self, websocket, path):
        self._websocket_connection = websocket
        try:
            while True:
                # Delay to not consume the CPU
                await asyncio.sleep(constants.TIMEOUT)
                await asyncio.gather(
                    self.send_data_to_user(),
                    self.receive_data_from_user()
                )

        except websockets.exceptions.ConnectionClosedOK:
            print("WebSocket connection closed by the client")
            self._websocket_connection = None
            self._is_connected = False

        except websockets.exceptions.ConnectionClosedError:
            print("WebSocket connection closed unexpectedly")
            self._websocket_connection = None
            self._is_connected = False

    # add new command to the websocket read queue
    def add_to_websocket_read_queue(self, priority, command):
        self.websocket_server_data.websocket_read_queue.put(
            priority, command)

    # add new command to the websocket write queue
    def add_to_websocket_write_queue(self, priority, command):
        self.websocket_server_data.websocket_write_queue.put(
            priority, command)

    # Handle data that the server wants to send to the user
    async def send_data_to_user(self):
        # wait in case the user refresh the browser and we lose the websocket connection

        async with self._send_lock:
            # there is data need to be shown to the user
            # and there is connection
            if (not self.websocket_server_data.websocket_write_queue.empty() and
                    self._websocket_connection):
                data = self.websocket_server_data.websocket_write_queue.get(
                )
                await self._websocket_connection.send(data)

    # Handle sent data from the user
    async def receive_data_from_user(self):
        async with self._recv_lock:
            try:
                if self._websocket_connection:
                    # Receive data if possible every 10 ms
                    data = await asyncio.wait_for(self._websocket_connection.recv(), timeout=constants.TIMEOUT)

                    if data:
                        if config("ENV") == 'development':
                            print("Data received from user: ", data)

                        # Process the received data
                        self.add_to_websocket_read_queue(constants.HIGH_PRIORITY_COMMAND,
                                                         data)

            except asyncio.TimeoutError:
                pass  # Continue the loop if no data received within the timeout

            except Exception as e:
                print(f"An error occurred: {e}")

    async def disconnect_websocket(self):
        if self._websocket_connection:
            await self._websocket_connection.close()
            self._websocket_connection = None
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
