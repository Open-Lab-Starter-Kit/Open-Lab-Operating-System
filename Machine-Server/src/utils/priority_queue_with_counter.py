from queue import PriorityQueue

# This module is used to create priority queue with counter
# the reason is to guarantee order stability for items with equal priorities


class PriorityQueueWithCounter:
    def __init__(self):
        self.priority_queue = PriorityQueue()

        # country to check the order of the items that have the same priority
        self.entry_counter = 0

    def put(self, priority, item):
        entry = [priority, self.entry_counter, item]
        self.priority_queue.put(entry)
        self.entry_counter += 1

    def get(self):
        return self.priority_queue.get()[-1]

    def empty(self):
        return self.priority_queue.empty()
