# QUERYING WITH CYPHER

Cypher is a vendor-neutral open graph query language employed across the graph ecosystem. Cypher’s ASCII-art style syntax provides a familiar, readable way to match patterns of nodes and relationships within graph datasets.

Like SQL, Cypher is a declarative query language that allows users to state what actions they want performed (such as insert, select, update or delete) upon their graph data without requiring them to describe (or program) exactly how to do it.

## Basic CRUD

>Cypher provides language constructs for performing common database tasks.

### Creating a node

```
CREATE (
    node:Person{ 
        name: 'John Doe', 
        age: 42
    }
) 
RETURN node`
```
Here `node` is a variable name refering to the node we wil create and `Location` is a label(think of it as a custom datatype)

the `{}` allows us to specify properties that the node will have.

This query will create and return a node with the specified data.

### Fetching nodes

> Querying in Cypher is centered around the `MATCH` keyword. It allows us to provide an expression that nodes will be compared against. The `RETURN` keyword returns any matching nodes. Cypher supports the `WHERE` keyword for expressions

```
MATCH (node: Person) WHERE
    node.name = 'John Doe'
RETURN node;
```
This query would fetch a Person with the name 'John Doe'

### Updating nodes

> Updating builds on querying by using the `SET` keyword to change the value of a node

```
MATCH (node: Person) WHERE
    node.name = 'John Doe'
SET node.name = 'Jane Doe'
RETURN node;
```

### Deleting nodes

> Deleting also build on querying by using two keywords `DETACH` and `DELETE`. `DELETE` deletes a node while `DETACH` disconnects it from any nodes it may be related to. We can use both together to disconnect and delete a node.

```
MATCH (node: Person) WHERE
    node.name = 'John Doe'
DETACH DELETE node
```

## Relationships

>Cypher allows us to relate one node to another. This creates a graph that can be traversed to find related nodes.

### Creating a related node
> Once again we build on the `MATCH` expression to find a node and insert another node connected to it via a relationship

```
 MATCH (node: Person) WHERE node.name = 'John Doe'
    CREATE (node)-[:MARRIED_TO]->(
        wife:Person{ 
            name: 'Jane Doe',
            age: 41
        }
)
RETURN wife
```

This creates a new node (wife) related to our original node by the `[:MARRIED_TO]` relationship

### Deleting related nodes

>On deleting a node we can choose to remove nodes that are related to it. We do this by `MATCH`ing the node against its relate node using the relationship. `(node)-[:RELATIONSHIP]-(relatedNode)` matches the node and all nodes connected to it by the relationship.

```
MATCH (node)
OPTIONAL MATCH (node)-[:MARRIED_TO]->(wife) 
    WHERE node.name = 'John Doe' 
DETACH DELETE node, wife
```

This query would delete 'John Doe' and his wife 'Jane Doe'. the `OPTIONAL MATCH` means that 'John Doe' would still get deleted if he didn't have a wife.

## More Information

For more information about the Cypher Query Language refer to: [Cypher Docs](https://neo4j.com/developer/cypher/?ref=cypher)

