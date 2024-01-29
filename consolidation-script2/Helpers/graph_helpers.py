def get_edges_for_given_node(given_node,edges):
    ans = []
    for edge in edges:
        if given_node in edge:
            ans.append(edge)
    return ans
        