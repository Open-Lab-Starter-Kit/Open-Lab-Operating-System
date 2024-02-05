from queue import PriorityQueue


class PriorityQueueWithCounter:
    def __init__(self):
        self.priority_queue = PriorityQueue()
        self.entry_counter = 0

    def put(self, type, priority, item=None):
        entry = [priority, self.entry_counter, type, item]
        self.priority_queue.put(entry)
        self.entry_counter += 1

    def get(self):
        return self.priority_queue.get()[2:]  # Return both type and item

    def empty(self):
        return self.priority_queue.empty()
