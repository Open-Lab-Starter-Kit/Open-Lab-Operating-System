# This module contains the shared data between the core and other services
# used to ease the use of shared memory object in multiprocessing

from multiprocessing.managers import SyncManager
from utils.priority_queue_with_counter import PriorityQueueWithCounter

'''
Use Manager module to be able to manage all the processes in the system
register in the manager a priority queue to make sure to prioritize 
specific commands based on how important they are
'''


class SharedDataManager:
    def __init__(self):
        SyncManager.register("PriorityQueueWithCounter",
                             PriorityQueueWithCounter)
        self.manager = SyncManager()
        self.manager.start()

    def get_manager(self):
        return self.manager


class SharedMachineData:
    def __init__(self):
        manager = SharedDataManager().get_manager()
        self._data = {
            'serial_read_queue': manager.PriorityQueueWithCounter(),
            'serial_write_queue': manager.PriorityQueueWithCounter(),
            'ok_messages_counter': manager.Value('i', 0),
            'is_tool_change': manager.Value('b', False),
            'is_machine_pause': manager.Value('b', False)
        }

    @property
    def serial_read_queue(self):
        return self._data['serial_read_queue']

    @property
    def serial_write_queue(self):
        return self._data['serial_write_queue']

    @property
    def ok_messages_counter(self):
        return self._data['ok_messages_counter'].value

    @ok_messages_counter.setter
    def ok_messages_counter(self, value):
        self._data['ok_messages_counter'].value = value

    @property
    def is_tool_change(self):
        return self._data['is_tool_change'].value

    @is_tool_change.setter
    def is_tool_change(self, value):
        self._data['is_tool_change'].value = value

    @property
    def is_machine_pause(self):
        return self._data['is_machine_pause'].value

    @is_machine_pause.setter
    def is_machine_pause(self, value):
        self._data['is_machine_pause'].value = value


class SharedWebsocketData:
    def __init__(self):
        manager = SharedDataManager().get_manager()
        self._data = {
            'websocket_read_queue': manager.PriorityQueueWithCounter(),
            'websocket_write_queue': manager.PriorityQueueWithCounter(),
        }

    @property
    def websocket_read_queue(self):
        return self._data['websocket_read_queue']

    @property
    def websocket_write_queue(self):
        return self._data['websocket_write_queue']


class SharedFastApiData:
    def __init__(self):
        manager = SharedDataManager().get_manager()
        self._data = {
            'fastapi_read_queue': manager.Queue(),
            'fastapi_write_queue': manager.Queue(),

        }

    @property
    def fastapi_read_queue(self):
        return self._data['fastapi_read_queue']

    @property
    def fastapi_write_queue(self):
        return self._data['fastapi_write_queue']
