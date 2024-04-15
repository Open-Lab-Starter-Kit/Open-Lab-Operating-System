from multiprocessing import freeze_support
from core.server_core import ServerCore

if __name__ == "__main__":
    freeze_support()
    server_core = ServerCore()
    server_core.start()
