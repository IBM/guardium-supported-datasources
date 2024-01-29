"""
Just a Flow Network

"""
class FlowNetwork:
    """
    Represents a flow network.
    """

    def __init__(self):
        """
        Initialize an empty flow network.
        """
        self.adjacency_list = {}

    def add_edge(self, u, v, capacity):
        """
        Add an edge with capacity between nodes u and v.

        Args:
            u: Source node.
            v: Destination node.
            capacity: Capacity of the edge.

        Returns:
            None
        """
        if u not in self.adjacency_list:
            self.adjacency_list[u] = []
        if v not in self.adjacency_list:
            self.adjacency_list[v] = []
        self.adjacency_list[u].append({'v': v, 'capacity': capacity, 'flow': 0})
        self.adjacency_list[v].append({'v': u, 'capacity': 0, 'flow': 0})  # Back edge for residual graph

    def get_neighbors(self, node):
        """
        Get neighbors of a node in the flow network.

        Args:
            node: The node whose neighbors are to be retrieved.

        Returns:
            List: List of neighbors of the node.
        """
        return self.adjacency_list.get(node, [])

    def update_flow(self, u, v, delta):
        """
        Update the flow on an edge between nodes u and v.

        Args:
            u: Source node.
            v: Destination node.
            delta: Change in flow.

        Returns:
            None
        """
        for edge in self.adjacency_list[u]:
            if edge['v'] == v:
                edge['flow'] += delta
                return
