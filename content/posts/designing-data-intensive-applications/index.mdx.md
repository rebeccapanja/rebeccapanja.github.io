---
title: Book Notes for Designing Data Intensive Applications
date: 2022-01-03
tags:
  - Book
  - Educational
  - Notes
---

## ✅ Chapter 1 - Reliable, scalable, and maintainable applications

- Standard building blocks
  - Store data → databases
  - Speed up reads → caches
  - Search data → search indexes
  - Async messages → stream processing
  - Periodically crunch data → batch processing
- Three main concerns
  - Reliability - to work correctly (at the desired level of performance) even in the face of _adversity_
  - Scalability - reasonable ways of dealing with growth (data, traffic, complexity)
  - Maintainability - to be able to work on it productively

#### 1. Reliability

- Fault tolerant or resilient: System that can anticipate fault
  - fault = system deviating from spec
  - vs failure = whole system stops providing service
- Impossible to prevent faults (i.e. with 0% probability)
- Design to prefer tolerating faults over preventing faults

1. Hardware faults

- Before: hardware redundancy
  - With more data, more machines, higher rate of hardware faults
- Newer: software fault tolerant systems
  - Pros: for system that can tolerate machine failure, can be patched one node at a time without downtime of entire system (rolling upgrade)

2. Software errors

- more co-related than hardware failures ie. one failed node is likely to cause many more system fails
  - un co-related hardware faults are unlikely i.e. large number of unrelated hardware components won’t fail at the same time
- Fixes: testing, process isolation, measure and monitor system behavior in prod

3. Human errors

- Humans are unreliable, design for that
- Minimize scope for error (admin interface, APIs)
- Full featured non prod sandbox environment to test/experiment
- Testing thoroughly - unit tests, integration tests, automated tests
- Quick/easy recovery from human failure to minimize impact of failure ie. easy rollback config changes, roll out new changes gradually
- Clear and detailed monitoring, like error rates

#### 2. Scalability

- Scalability → ability to cope with increased load
- Need to describe load on system to discuss growth questions

**Describing Load**

- Load parameters like
  - requests per second to web server
  - ratio of read writes in DB
  - number of active users in chat at once
  - hit rate on cache

**Describing Performance**

- **Once load is described, what happens when load increases?**

  - How is performance affected? (keeping same CPU, bandwidth, memory etc.)
  - How much do you need to increases resources to keep performance unchanged?

- **Metric for batch processing systems (Hadoop) → Throughput**
  - Number of records we can process per second
  - or total time to run job on dataset of certain size
- **Metric for online systems → Response Time**
  - Response time = service time + network delays + queueing delays
    - Why is it important to measure this on client side?
      - queuing delays ie. slow requests on the server-side can hold up the processing of subsequent requests
      - called "_Head-of-Line blocking”_
      - what client sees is slow (time between sending a request and receiving response)
  - Latency = duration request is waiting to be handled
    - latent = awaiting service
    - NOT same as response time
  - Average response time is common metric
    - **Con:** Doesn’t tell us how many users experience that delay
    - **Solution:** Use percentiles eg: p50, p99

#### Percentiles

- Median p50
  - 50th percentile
  - 1/2 user requests served < median time
- Tail latencies p95, p99
  - eg: if the 95th percentile response time is 1.5 seconds, 95 out of 100 requests take less than 1.5 seconds, and 5 take 1.5 seconds or more.
  - Good to figure out how bad outliers are
  - For Amazon, these are the ones with most data aka most valuable customers
  - Optimizing for p99.99 is too expensive
- **Percentiles used in contracts that define expected performance and availability of a service**
  - SLO = Service Level Objective
  - SLA = Service Level Agreement
  - eg: median response time of less than 200ms and a 99th percentile under 1s

#### Approaches for Coping with Load

1. Scaling up vertically
2. Scaling out horizontally
   1. complex for stateful systems like DB
3. Elastic systems
   - Auto add computing resources when load increase detected

#### Maintainability

**Three design principles**

1. Operability
   - easy to keep system running
   - making routine tasks easy
2. Simplicity
   - easy for new eng
   - _abstractions_ that hide implementation details behind clean APIs and facades
3. Evolvability
   - easy to make changes

## ✅ Chapter 2 - Data Models and Query Languages

- Most apps built by layering data models
- Each layer hides complexity below it providing a clean data model
- Data model has a big effect on what the software above it can do

#### Why NoSQL? (Not Only SQL)

(Think _JSON-based_ databases)

**Goal**

    - Greater scalability than relational databases can easily achieve: large datasets or high write throughput
        - Example use cases: high frequency reads and writes like Twitter, real-time sports app, massive multi-player games
    - Specialized query optimizations over commercial DB products
    - Desire for a more dynamic and expressive data model (Schema-on-read/schemaless)
    - Preference for free and open source software

- Examples: Cassandra, MongoDB, Redis, Neo4j

**Two forms**

1. **Document databases**
   - **Use case**: where data is in self-contained documents and relationships between documents are rare
   - Example db: Firebase Firestore, CouchDB, Google Cloud Datastore
   - Example scenario:
     - analytics applications that uses documents to record which events occurred at which time
     - resumes portal
2. **Graph databases**
   - **Use case**: opposite of above, where potentially everything is related
   - Example db: MongoDB, Neo4j
   - Example scenario:
     - social network

Some more forms: Key value, time series, wide column

#### Relational model vs NoSQL model

|                                    | **Relational**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | **NoSQL**                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use case                           | - Anything with _money or numbers_ where data consistency and transactions are key<br />- Used in business data, transaction and batch processing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | - When large number of read-write operations and dealing with large amount of data                                                                                                                                                                                                                                                                                                                                                                          |
| Supports one-to-many, many-to-many | - For one-to-many or many-to-many relationships                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | - For one-to-many (document based) or many-to-many (graph) relationships                                                                                                                                                                                                                                                                                                                                                                                    |
| ID to relate items                 | Foreign key                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Document reference                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Pros**                           | - ACID transactions<br /> - Operation will complete fully or entirely rollback ie. no mid way states<br /> - ie. both states are consistent and durable<br />- Better support for joins<br />- Data consistency<br /> - If UI has text fields for city, can be stored as string or standardized lists (IDs) of cities for<br /> - consistent spelling, avoid ambiguity<br /> - localization support eg translation<br /> - easy search and update (eg: name change)<br /> - Whether you store ID for city or text string is a question of duplication. With ID, only ever have to update name of city in one spot.<br />- Normalization<br /> - removing duplication is the key idea behind _normalization_ in databases<br /> - process of organizing the data in database to avoid data redundancy, insertion anomaly, update anomaly & deletion anomaly<br />- Hides implementation details behind clean interface | - Schema flexibility (_schema-on-read_): The structure of the data is implicit, and only interpreted when the data is read and not enforced by DB<br />- JSON models reduces impedance mismatch<br />- Scalability/High availability<br /> - with eventual consistency, new nodes can be added on the fly without the need to block any of them, the nodes are available to the end-users to make an update at all times                                    |
| **Cons**                           | - **Impedance Mismatch**<br /> - disconnect/awkward transition layer required between DB and object oriented application layer<br />- **Scalability**<br /> - sharding and replication are not trivial because of strong consistency requirements<br /> -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | - Eventual consistency over Strongly Consistent<br /> - example: youtube says 10 views but 15 likes (since views hasn’t updated yet)<br />- Not ACID transactions since it scales horizontally over a cluster and across data center<br />- Weak support for joins<br /> - If the database itself does not support joins, you have to emulate a join in application code by making multiple queries<br />- Risk of inconsistency because of flexible schema |
| **Examples**                       | PostgresSQL<br />MySQL<br />IBM DB2<br />(some have added support for JSON docs now)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Cassandra<br />MongoDB<br />Redis<br />Neo4j<br />(some are supporting relation-like joins)                                                                                                                                                                                                                                                                                                                                                                 |

- What is **Impedance Mismatch**?
  - Mismatch between database and application layer
  - Most application is **object oriented** so **relational** database needs to be transformed
  - With awkward translation layer between the objects in the application code and the db model of rows, tables and columns
- Relational and document databases are becoming more similar over time (see Examples row)

#### Document vs Graph

|                 | **Document based**                                                                                                                                                                                                                                                                                                            | **Graph**                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Best suited for | - For application that have document-like structure ie. a tree of one-to-many relationships, where typically the entire tree is loaded at once<br />- where all we need is quick persistence and retrival of data, not much relational logic involved                                                                         | - For applications with lots of many-to-many relationships                                       |
| Use case        | - data analytics use cases since massive amounts of data<br />- real-time feeds<br />- live sports app or multiplayer games<br />- inventory management<br />- storing user comments                                                                                                                                          | - social network<br />- google maps (nodes → cities, edges → roads)<br />- recommendation engine |
| Pros            | - Better performance due to locality: All the relevant information is in one place, one query is sufficient, less need for disk seeks and it takes less time                                                                                                                                                                  | - Low latency<br /> - relationships are not calculated via joins, can just fetch edges           |
| Cons            | - If application often needs to access a document, keep documents small<br /> - Database usually loads entire document for read and on update, entire doc needs to be rewritten<br /> - Locality helps as performance advantage though<br />- Cannot directly refer to nested item within document<br /> - avoid deep nesting |                                                                                                  |
| Examples        | MongoDB<br />Google Cloud Datastore<br />CouchDB                                                                                                                                                                                                                                                                              | Neo4j                                                                                            |

#### Document Database

- Best for semi-structured data, where there isn’t much relational logic involved & all we need is just quick persistence & retrieval of data
- Real life implementation
  - [SEGA uses Mongo-DB to improve the experience for millions of mobile gamers](https://www.mongodb.com/blog/post/sega-hardlight-migrates-to-mongodb-atlas-simplify-ops-improve-experience-mobile-gamers)
  - [Coinbase scaled from 15k requests per min to 1.2 million requests per minute with MongoDB](https://www.mongodb.com/customers/coinbase)

#### Graph Database

- Best for applications with lots of many-to-many relationships
- Best for flexibility in data modeling, for evolvability
- Components 1. Vertices (nodes or entities) - consists of - Unique identifier - Outgoing edges - Incoming edges - Collection of properties (key-value pairs) - people, location, events, checkins, comments made by users 2. Edges (relationships or arcs) - consists of - Unique identifier - Vertex at which the edge starts (_tail vertex_) - Vertex at which the edge ends (_head vertex_) - Label to describe the kind of relationship between the two vertices - A collection of properties (key-value pairs) - which people are friends with each other, which checkin happened in which location, who commented on what, who attended which event
- Algorithms: shortest path between two points, or popularity of web page
- **Ways to structure graphs**
  - Property graph model
    - Neo4j, Titan and InfiniteGraph
  - Triple-store model
    - Datomic, AllegroGraph
    - All information is stored in the form of very simple three-part statements: _subject_, _predicate_, _object_ (peg: _Jim_, _likes_, _bananas_). A triple is equivalent to a vertex in graph.
- **Ways to query graphs**
  - Declarative query languages: Cypher (by Neo4j), SPARQL, and Datalog
- Real life implementations
  - [Walmart shows product recommendations to its customers in real-time using Neo4J graph database](https://neo4j.com/case-studies/walmart/)
  - [NASA uses Neo4J to store “lessons learned” data from their previous missions to educate the scientists & engineers.](https://neo4j.com/blog/david-meza-chief-knowledge-architect-nasa/)

#### Key Value Database

- Primarily to implement caching
- Use case
  - need to fetch data real fast with minimum backend processing
  - caching
  - implementing queues
  - implementing pub sub
  - persisting user state, user sessions
  - leaderboards in online games/web apps
- Pro
  - minimum latency
- Examples: Memcache, Redis, Riak, Voldemort
- Real life implementations
  - [Inovonics uses Redis to drive real-time analytics on millions of sensor data](https://redislabs.com/customers/inovonics/)
  - [Microsoft uses Redis to handle the traffic spike on its platforms](https://redislabs.com/docs/microsoft-relies-redis-labs/)
  - [Google Cloud uses Memcache to implement caching on their cloud platform](https://cloud.google.com/appengine/docs/standard/python/memcache/)

#### Time Series Database

- optimized for tracking & persisting time series data
  - data containing data points with occurrence of an event with respect to time
  - data points are tracked, monitored and then finally aggregated based on certain business logic
- Use case
  - Running analytics on data ingested from IoT devices
    - self-driving vehicles
    - industry sensors
    - social networks
    - stock market financial data
- Examples: Prometheus, TimeScale DB, Influx DB
- Real life implementation
  - [IBM uses Influx DB to run analytics for real-time cognitive fraud detection](https://www.influxdata.com/customer/ibm/)
  - [Spiio uses Influx DB to remotely monitor vertical lining green walls & plant installations](https://www.influxdata.com/customer/customer_case_study_spiio/)

#### Wide Column Database

(_also called column-oriented databases)_

- Primarily for Big Data ie. massive amounts of data, with scalability, performance and high availability
- Store data in a record with dynamic number of columns (can hold billions of columns)
- Cassandra or key-value stores in general, always maintain a certain number of replicas to offer reliability. Deletes don’t get applied instantly, data is retained for certain days (to support undeleting) before getting removed from the system permanently.
  - eg in Instagram, list of users with photos can have key=UserId and value = list of PhotoIds user owns, stored in different columns
  - similar for storing list of ppl user follows
- Use case
  - For analytics on big data
- Examples: Cassandra, HBase, Scylla DB, Google BigTable
- Real life implementations
  - [Netflix uses Cassandra as the backend database for the streaming service](https://medium.com/netflix-techblog/tagged/cassandra)
  - [Adobe uses HBase for processing large amounts of data](https://hbase.apache.org/poweredbyhbase.html)

#### Polyglot Persistance

- relational databases used alongside non-relational databases
- using different persistence technologies to fulfill different persistence requirements in an application

Example: social network like Facebook

- Relational db, MySQL
  - For persisting friends of users, friends of friends, food and music choices in common
  - For ads, based on Payment system (for strong consistency)
- Cache using Key-value store, Redis or Memcache
  - For low latency access of frequently accessed data and for user sessions
- Wide column database, Cassandra
  - For analytics on data generated by users
- Graph database
  - Recommendations engine
- Document oriented datastore, Elastisearch - search for other users, groups - scalable search feature
  ![](https://paper-attachments.dropbox.com/s_87BAAC0E0FAC2F43AB1156B087D35198F57DFB08DCB3AEE45913AA6CD286C46D_1609013850593_Screen+Shot+2020-12-26+at+12.17.20+PM.png)

Cons of this approach

- complexity
  - Fix: multi-model databases
    - different data models in single database system
    - examples: _Cosmos DB_, _Orient DB_, _Couchbase_

#### Query Languages for Data

**Imperative vs Declarative query languages**

1. **Imperative query languages**

- tells the computer to perform certain operations in a certain order
- Cons
  - hard to parallelise across multiple cores because it specifies instructions that must be performed in a particular order
- Examples: manipulating styles imperatively in JavaScript, imperative query APIs

2. **Declarative query languages**

- specifies the pattern of the result data wanted, and how the data should be transformed, but not _how_ to achieve that goal
- eg: specify only the pattern of the results, not the algorithm that is used to determine results
- Pro:
  - hides the implementation details of the database engine, thus can have performance improvements in DB without requiring any changes to query
  - possibly parallel execution
- Examples: SQL, HTML and CSS are declarative languages

**MapReduce querying**

- MapReduce is a programming model for processing large amounts of data in bulk across many machines
- **Map jobs are run on all the machines in parallel, and then the results are reduced**
- Somewhere in between declarative query language and fully imperative query API
- Map and reduce must be **pure functions** ie.
  - Only use data passed to them as input
  - No side effects
  - No additional db queries
  - These restrictions allow the database to run the functions anywhere, in any order, and rerun them on failure.
- Cons: A usability problem with MapReduce is that you have to write two carefully coordinated functions.
- A declarative language offers more opportunities for a query optimiser to improve the performance of a query. For there reasons, MongoDB added support for a declarative query language called _aggregation pipeline_ which is similar to MapReduce.

## Chapter 3 - Storage and Retrieval

- **Job of storage engines:** Write things to disk on a single node
- Storage engines can be optimized for transactional workloads (store data) or analytics (read data)

**Data structures to power databases:**

1. Log-structured storage engines
   - Log structured merge trees
2. Page oriented storage engines
   - B-trees

#### Log-Structured Storage Engines (append-only)

- Many databases internally use a log
- Log is **append-only** series of records/data file
- Each line in the log contains a key-value pair, separated by a comma
- Log does not have to be internally-readable, it might be binary and intended only for other programs to read

#### Hash Indexes

- Indexes for key-value data, to efficiently find the value of a particular key
- Well-chosen indexes speed up read queries, but every index slows down writes.

#### Indexing strategy for Append-only Data Storage

- Keep an in-memory hash map where every key is mapped to a byte offset in data file
  - On appending new key-value pair to file, update hash map to reflect offset of new data added
  - Space:
    - Keys should fit in RAM
    - Values can be loaded from disk
- Writes are appended to the log in a strictly sequential order (ie. disk location), a common implementation is to have a single writer thread. Segments are immutable, so they can be read concurrently by multiple threads.
- Writes to segments are on disk while hash table index is in memory
- Best suited when value for each key is updated frequently ie. lots of writes, but not too many distinct keys
- Example: Bitcask (the default storage engine in Riak)

**How to avoid running out of disk space with append only?**

1. Break log into segments of certain size ie. close segment file at some size + make next writes to a new segment file
2. Merge and Compact together
   1. Compaction: throw away duplicate keys in log, and keep most recent update for each key
   2. Merge multiple segments together to a new file (segments are immutable ie. don’t modify original)
   - Can happen as background process. Old segment files can still serve read and write requests, until the merging process is complete.

- Each segment will have its own in-memory hash table
- To find value for key, check **most recent segment**, then second-most-recent etc.
- Merging process keeps number of segments small, so lookups don't need to check many hash maps.

#### Pros and cons

**Pros**

    - **Fast**: Append and segment merging are sequential write operations, much faster than random writes, especially on magnetic spinning-disks
    - **Simple crash recovery and concurrency**
    - Merging old segments avoids files getting fragmented over time

**Cons**

    - Hash table must fit in memory so not ideal for large ## of keys
        - Difficult to make on-disk hash map perform well due to random access I/O, expensive to grow when full, expensive hash collisions
    - Range queries are not efficient
        - Have to look up each key individually in the map

#### Real implementation considerations

- **File format**
  - simpler+faster to use binary format vs CSV format
  - binary format: encodes length of string in bytes + raw string
- **Concurrency control**
  - Single writer thread since writes are appended to the log in a strictly sequential order
  - Segments are immutable, so they can be read concurrently by multiple threads
- **Crash recovery**
  - If restarted, in-memory hash maps are lost
  - Can recover from reading each segment but time consuming and slow
  - Bitcask speeds up recovery with **snapshot** of each segment hash map on disk, which can be loaded into memory more quickly
- **Deleting records**
  - Append special deletion record to the data file (_tombstone_) that tells the merging process to discard previous values.
- **Partially written records**
  - Since DB may crash any time, Bitcask includes checksums allowing corrupted parts of the log to be detected and ignored

#### SSTables and LSM-Trees

**SSTables = Sorted String Table**

- require sequence of key-value pairs to be sorted by key (unlike segments with hash index where it appears in order of write)
- require that each key only appears once within each merged segment file (compaction already ensures that)
- Data structure for SSTables: red-black trees or AVL trees, where keys can be inserted in any order and read back in sorted order

**Pros (over hash indexes)**

- Merging segments is simple and efficient
  - use mergesort
  - when same key in multiple segments, keep recent segment value and discard older (same as with hash index)
- No longer need to keep index of all keys in memory
  - Only need in memory index with offset for some of the keys and then can look for any key between that eg: “apple” between “ant” and “art”
    - One key every few kilobytes is sufficient, because that can be scanned very quickly
- Since read requests need to scan over several key-value pairs in the requested range anyway, it is **possible to group those records into a block and compress** it before writing it to disk (save disk space + I/O bandwidth)
  - Each entry of the sparse index then points at the start of a compressed block. This has the advantage of saving disk space and reducing the IO bandwidth.
  - SSTables store their keys in blocks, and have an internal index, so even though a single SSTable may be very large (gigabytes in size), only the index and the relevant block needs to be loaded into memory.

**Constructing and maintaining SSTables → LSM storage engines**

- **Storage engines that are based on this principle of merging and compacting sorted files are often called LSM structure engines (Log Structure Merge-Tree)**
- Data structure for SSTables: red-black trees or AVL trees, where keys can be inserted in any order and read back in sorted order
- **Writes** → When write comes in, add to in-memory balanced tree structure (memtable)
- When memtable gets bigger than some threshold (megabytes), write it out to disk as SSTable file. This operation is efficient because the tree already maintains the key-value pairs sorted by key. Writes can continue to new memtable instance.
- **Reads** → try to find key in memtable, then in most recent on-disk segment, then in next-recent etc
- From time to time, run merging + compaction process in background to combine segment files and discard overwritten or deleted values

**Cons:** If database crashes, most recent writes are lost.
**Solution:**

    - Keep separate log on disk where each write is appended
    - Log in unsorted order but can be used to rebuild memtable
    - Every time the memtable is written out to an SSTable, the log can be discarded

**Performance Optimizations**

- LSM-tree algorithm can be slow when looking up keys that don't exist in the database: you first have to check the memtable, then all the segments all the way up to the oldest (possibly having to read from disk for each one) to be certain that the key does not exist
- Use Bloom filters to optimize this. _Bloom filters_ (a memory-efficient data structure for approximating the contents of a set) can tell you if a key does not appear in a database, thus saving you from unnecessary disk reads for nonexistent keys.
- 2 common strategies to determine order and timing of how SSTables are compacted+merged
  - Size tiered
    - newer smaller SSTables are successively merged into older larger SSTables
  - Leveled compaction
    - Key range split into smaller SSTables and older data moved into separate “levels”
    - Allows compaction to be more incremental and use less disk space
    - Each level has many SSTables
    - New keys arrive at highest layer
    - Levels are roughly 10x as large as level above it
  - Both supported in Cassandra, LevelDB used leveled compaction

**B-Trees**

- Most widely used indexing structure
- Keep key-value pairs sorted by key (like SSTables), making key-value lookups and range queries efficient
- B-trees break database down into **fixed-size blocks or pages,** ~4kb and each page can be identified with address or disk location
- One page is designated as the _root_ and pages contains several keys and references to child pages. Each child is responsible for a continuous range of keys, and the keys between the references indicate where the boundaries between those ranges lie.
- _Branching factor:_ The number of references to child pages in one page the B-tree.
- Update value of key →
  - Search for leaf page with that key, change value in that page, write page back to disk (any references to that page remain valid)
  - Basic underlying write operation of B tree is to overwrite page on disk with new data whereas in LSMtrees, data is never modified and only appended
- Add new key →
  - Find page whose range includes new key and add it to that page
  - If that page doesn’t have free space, split the page into two half-full pages and update parent page to account for new subdivision of key ranges
- Trees remain _balanced_. A B-tree with _n_ keys always has a depth of _O_(log _n_).

**Making B-trees reliable**

- What if database crashes midway of write that is split across pages and needs to update parent page with reference to two child pages? Can lead to corrupted index
  - Solution: WAL (write ahead log) on disk
    - Append only file with every modification before it is applied to pages of tree
    - Used to restore DB where it comes back from crash
- Concurrency issues with updating in place
  - Careful concurrency control is required if multiple threads are going to access, typically done protecting the tree internal data structures with _latches_ (lightweight locks).
  - This is not an issue with log structured approaches since all the merging happens in the background without interfering with incoming queries.

**B-tree optimizations**

- Additional pointers like leaf page with references to left and right sibling pages
- Some databases use copy-on-write scheme instead of overwriting pages + maintaining WAL. ie. modified page is written to diff location, and new version of parent pages in tree is created, pointing at new location

#### B-Trees vs LSM Trees

- LSM-trees are typically **faster for writes**, whereas B-trees are thought to be faster for reads.
- Reads are typically slower on LSM-tress as they have to check several different data structures and SSTables at different stages of compaction.
  | Pros of LSM trees | Cons of LSM trees |
  | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | - LSM-trees are typically able to sustain higher write throughput than B-trees, party because they sometimes have lower write amplification: a write to the database results in multiple writes to disk. The more a storage engine writes to disk, the fewer writes per second it can handle. | - Compaction process can sometimes interfere with the performance of ongoing reads and writes. B-trees can be more predictable. The bigger the database, the the more disk bandwidth is required for compaction. Compaction cannot keep up with the rate of incoming writes, if not configured properly you can run out of disk space. |
  | - LSM-trees can be compressed better, and thus often produce smaller files on disk than B-trees. B-trees tend to leave disk space unused due to fragmentation. | - On B-trees, each key exists in exactly one place in the index. This offers strong transactional semantics. Transaction isolation is implemented using locks on ranges of keys, and in a B-tree index, those locks can be directly attached to the tree. |

TBC

## ✅ Chapter 4 - Encoding and Evolution

- Evolvability
  - we should aim to build systems that make it easy to adapt to change
- Relation schemas
  - conforms to one schema
  - Schema can be changed but there is one schema in force at any point of time
- Schema-less (schema-on-read)
  - does not conform
  - contains mixture of older and newer data formats
- Format changes usually need change in application code. These changes don’t go out instantaneously since large applications do “rolling upgrades”
  - **Rolling upgrade**: Deploying a new version to few nodes at a time to check if its running smoothly, gradually working your way up to all nodes without service downtime
  - Thus need to maintain **compatibility** in both directions
    - Backward compatibility
      - newer code can read data written by older code
      - not hard to achieve since format is known
    - Forward compatibility
      - older code can read data written by newer code
      - harder to achieve, requires older code to ignore addition made by newer version

#### Formats for encoding data

- Programs usually work with two representations

  - In memory data structures (eg objects, list arrays), optimized for efficient access and CPU manipulation
  - Sequence of bytes (eg JSON) for transmitting over the network

- **Encoding**
  - translation between representations
  - also known as serialization, marhshalling
- **Decoding**
  - also known as deserialization, parsing, unmarshalling

**Why not use built-in language-specific formats?**

- Programming languages come with built in support for encoding in-memory objects into byte sequences
- Problems with them:
  - Encoding tied to particular language
    - reading data in another lang is difficult
    - if you store or transmit the data, committing yourself to that language for long time
  - Big security risk
    - decoding process needs to be instantiate arbitrary class in order to restore data in the same types
  - Poor versioning
    - often neglect problems of backward/forward compatibility since they’re intended for quick and easy use
  - Inefficient
    - poor performance times and bloated encoding

**When is it on to use them?**

- For transient purposes, quick and easy use

#### JSON, XML, CSV

- These are textual formats, and thus relatively human-readable
- Widely known, supported but have some subtle problems
- **Cons**
  - **ambiguity** around encoding of numbers and dealing with large numbers (>2^53)
    - XML and CSV cannot distinguish between number and string with digits
    - JSON distinguishes these, but not int and floats, or precision
  - No support for binary strings (they do support unicode char strings)
    - workaround: encode binary data as base64 → increases data size by 33%
  - CSV has no schema
    - up to application to define row and column, and handle changes manually
  - Optional schema support for XML and JSON
    - powerful but complicated langs
    - many JSON based tools don’t bother using schemas

#### Binary encoding - protobuf and Apache Thrift

- Binary formats use way less space compared to JSON, XML
- There are binary encodings for JSON (BSON, MessagePack) and XML (WBXML)
- **Pros of Schemas**
  - Much more compact than JSON/CSV since they omit field names from encoded data
  - Schema is valuable form of documentation
    - Required for decoding, so will stay up to date
  - Database of schemas allows you to check forward and backward compatibility changes
  - For statically typed languages, the generate code from schemas is useful since it allows type checking at compile time.

**Protocol Buffers (protobuf) and Apache Thrift**

- These are binary encoding libraries
- Require scheme for data that is encoded

  message Person {
  required string user_name = 1;
  optional int64 favourite_number = 2;
  repeated string interests = 3;
  }

- They come with code generation tool that takes a definition, and produces classes that implement the schema in various languages. Your application code uses these to encode or decode records of the schema.
- Thrift offers two protocols
  - BinaryProtocol
    - data contains **field tags** (eg: 1,2) instead of field names (eg: userId)
  - CompactProtocol
    - similar to above but packs same info in less space
    - packs field type and tag number into same byte
- Protocol Buffers are very similar to CompactProtocol
- **How do they handle schema changes while keeping backward + forward compatibility?**
  - Forward: old code trying to read new code can ignore not recognized field tags
  - Backward: Since each field has unique tag number, new code can always read old data. Every field after initial schema deployment must be optional or have default value.
- Removing field
  - can only remove optional fields
  - cannot use same tag again
- Changing data type of field

  - risk that values will lose precision or get truncated

- Apache Avro is another binary encoding format, started by Hadoop. [Link](https://github.com/keyvanakbary/learning-notes/blob/master/books/designing-data-intensive-applications.md##avro)
  - has two schema languages, one intended for human editing (Avro IDL), and one (based on JSON) that is more easily machine-readable
  - By contrast with Thrift and Protocol Buffers, every time the database schema changes, you would have to manually update the mappings from database column names to field tags.

#### Modes of Dataflow

- Dataflow though databases
- Dataflow though services: REST and RPC
- Dataflow through asynchronous message passing

#### Dataflow though databases

- Process that writes to the database encodes the data
- Process that reads from the database decodes it
- Needs forward+backward compatibility
  - DB value may be written by a _newer_ version of the code, and subsequently read by _older_ version of the code that is still running.
- _Data outlives code_
  - Old application can be replaced with new version within minutes, but the underlying data is still years old.
- Migrating (rewriting) is expensive
  - most relational dbs allow simple schema changes like adding new column with default value null without rewriting existing data, so old rows return null for this column

#### Dataflow though service calls: REST and RPC

- For processes that need to communicate across network, with clients and servers
- Similar to dbs, can expect old and new versions of clients and servers to be running at the same time
- Microservice or service-oriented architecture
  - Server itself is likely a client to another service, in microservice architecture
  - Key design goal: make the application easier to upgrade and maintain by making services independently deployable and evolvable

**Web Services**

- Web service is a service communicated with using HTTP as the underlying protocol
- Two approaches: REST and SOAP (simple obj access protocol)
- Use case: REST predominant style for public APIs, good for experimentation and debugging

**RPC**

- Tries to make request to remote network service look same as calling a method within the same process
- Use case: requests between services owned by the same organization, typically within the same datacenter.
- **Problems**
  - Network request is unpredictable (request/response packets can get lost, remote machine might be slow)
  - Network request may return without result, due to timeout
  - Retrying will cause action to be performed multiple times, unless there is mechanism built for idempotence/deduplication
  - Network calls are much slower than function call, and latency is wildly variable
  - Parameters need to be encoded into sequence of bytes to send over network which can be problematic with larger objects
  - RPC framework must translate datatypes from one language to another, not all languages have the same types
- No point trying to make a remote service look too much like a local object in your programming language, because it's a fundamentally different thing. Newer RPC frameworks are explicit about this
- gRPC supports streams, where one call does not necessarily return one response, but a series of responses over time

#### Dataflow through asynchronous message passing: Message brokers

- Somewhere between RPC and databases
- Similar to RPC because client’s request is delivered to another process with low latency
- Similar to database because message is not sent via direct network connection but via an intermediary called **message broker/message queue**/message oriented middleware which stores the message temporarily

**Message Brokers**

- Examples: RabbitMQ, Kafka
- General process of message broker
  - One process sends a message to a named queue or topic
  - Broker ensures that message is delivered to one or more consumers/subscribers to that queue/topic. Many-to-many relationship.
  - Usually one way and asynchronous. Sender does not wait for or expect response
  - Don’t enforce particular data model, can use any encoding format
- Advantages of message brokers compared to direct RPC
  - Improve reliability: can act as buffer if recipient is unavailable or overloaded
  - Prevent messages from getting lost: automatically re-delivers messages to a process that has crashed
  - Logically decouples sender from recipient
  - Avoids sender needed to know IP address and port number of recipient (useful in cloud environment where VMs come and go)
  - One message can be sent to several recipients

**Distributed actor frameworks**

- What is Actor model?
  - Programming model for concurrency in single process
  - Each actor represents one client or entity, and communicated with other actors by sending and receiving async messages
    - Message delivery not guaranteed
  - Logic is encapsulated in **actors**, rather than dealing with threads (race conditions, deadlock, locking)
    - Since each actor processes only one message at a time, it doesn’t need to worry about threads
- **Use case for distributed actor frameworks**: scaling application across multiple nodes
  - same message-passing mechanism is used, regardless of whether sender and recipient are on same or diff nodes
  - basically integrates message broker and actor model into single framework
- Examples: Akka, Erland OTP

## Chapter 5 - Replication

**Why do we need to replicate data?**

- Increase availability
- Increase read throughput
- Keep data geographically close to your users

**Reasons for wanting replication:**

- Tolerate node failures
- Scalability (process more requests)
- Latency

**Difficulty with replication**

- Handling changes to replicated data
- Popular algorithms for this: single-leader, multi-leader, leaderless replications

**Trade-offs to consider while replicating**

- Synchronous or asynchronous replication?
- How to handle failed replicas?

**Leaders and Followers**

- Replica = node that stores copy of database
- Every write must be processed by every replica to ensure all data ends up on replicas

#### Leader based replication (also called read-scaling architecture, master-slave, active/passive)

- Good fit where workload is mostly reads (hence, called read-scaling architecture) and with **async replication.**
- Built-in feature for many relational DBs like MySQL, MongoDB, Espresso, Kafka and RabbitMQ

1. One replica is designated as the leader. Clients must send requests to the leader, which writes data to its local storage.
2. Leader then sends the data change to the _followers_ as part of a _replication log_ or _change stream_. Applies changes in same order as the leader.
3. Clients can then query any node with read. Writes are only accepted by the leader.

#### Synchronous vs Asynchronous Replication

- Synchronous: leader waits for confirmation from followers before notifying client of success
  - Pros: The follower is guaranteed to have an up-to-date copy of the data that is consistent with the leader
  - Cons:
    - It the follower doesn't respond, the write cannot be processed.
    - **One node outage can bring down entire system**
- Semi-synchronous: Impractical for all followers to be synchronous, in practice usually one is synchronous. If it becomes unresponsive, an asynchronous follower then becomes synchronous.
- Asynchronous: leader sends data change but does not wait for confirmation before notifying client
  - Pros: Leaders can continue processing writes even if all of the followers have fallen behind
  - Cons:
    - Writes are not guaranteed to be durable even if confirmed to client, if leader fails and is not recoverable with unreplicated data
    - _Eventual consistency_ ie. can see outdated info

**Setting up New Followers**

- Copying data files from one node to another is typically not sufficient - data is always in flux unless DB locked but then not high-availability
- Setting up a follower can usually be done without downtime
  1. Take a consistent snapshot of the leader's database, without taking a lock on the entire database.
  2. Copy the snapshot to the follower node
  3. Follower connects to leader and requests all changes since snapshot
  4. When follower is caught up, it can continue to process data changes from the leader as they happen.

#### Handling Node Outages

- How to achieve high availability with leader-based replication? ie keep system running despite individual node failure
- Node can go down for fault, maintenance etc
- Issues of node failures; unreliable networks; and trade-offs around replica consistency, durability, availability, and latency are fundamental problems in distributed systems.

1. **Follower failure: Catch-up recovery**
   - Follower keeps log of data changes received from leader. Can request all data changes since failure/last transaction processed before failure
2. **Leader failure: Failover**
   - Steps
     1. Determine that the leader has failed
        - Nodes often chatter to determine what has gone wrong, use timeouts to assume a node is dead
     2. Choose new leader
        - Best candidate is the replica with the most up-to-date changes from the old leader (minimize data loss)
     3. Reconfiguring the system to use the new leader
        - Reconfigure clients to send writes to new leader, followers to consume data from new leader and old leader to become a follower
   - **What can do wrong?**
     - If async, new leader may not have received all writes from old leader before failure
       - These are commonly discarded, but a hit to durability
     - Discarding writes is especially dangerous, if other storage systems outside the database need to be coordinated with the contents.
     - “Split brain situation”: two nodes believe they are leaders
       - Data is likely to be lost or corrupt
     - What is the right timeout before leader declared dead?
       - Longer time → longer time to recover
       - Shorter time → unnecessary failovers, eg. due to temporary load spike and then failover makes situation worse/slower
     - For these reasons, some operation teams prefer to perform failovers manually, even if the software supports automatic failover

#### Implementation of Replication Logs

1. Statement-based replication

   - Cons
     - Statements that depend on existing data, or auto-increments must be executed in same order on replicas
       - Limiting when there are multiple concurrently executing transactions
     - Non-deterministic functions like Now() and Rand() can’t be used or will generate different values on replicas
     - Statements with side effects (triggers, stored procs, user-defined functions) may result differently on replicas

2. Write-ahead log (WAL) shipping
   - Log is append-only sequence of bytes containing all writes to the database
   - Used in PostgresSql and Oracle
   - Cons:
     - Closely couples to storage engine: Log describes data at very low level. WAL contains details of which bytes were changed in which disk blocks.
     - Big operational impact (downtime): If DB changes storage format, not possible to run different versions of the database on leader and followers. Thus, zero-downtime upgrade isn’t feasible.
3. Logical (row-based) log replication

   - Different log formats for replication and storage engines
   - Logical log is a sequence of records describing writes to tables:
     - INSERTed row with new values of all columns.
     - DELETEd row with information that uniquely identifies deleted log, like PK
     - UPDATEd row with unique identifiable info + new values of columns
   - Pros:
     - Log is decoupled from storage engine internals
       - Can be backward compatible
     - Easier for external applications to parse, useful for data warehouses, custom indexes and caches (change data capture)

4. Trigger-based replication
   - When? Only want to replicate subset of data, then may need to move replication up to application layer
   - _Triggers_ let us register custom application code that is automatically executed when a data change occurs in db.
   - Good opportunity to log this change into a separate table, from which it can be read by an external process.
   - Pros:
     - Flexibility: can replicate subset of data
   - Cons:
     - Greater overhead, more prone to bugs

#### Problems with Replication Lag

Replication time = time for a read on the leader reflected in the follower

1. **Reading your own writes**

   - Scenario: User submits data and views submission
   - With eventual consistency, read might be outdated
   - **Read-after-write consistency** (or read-your-writes) required

   **Implementation Approaches** (for same-device consistency)

   - Is data only editable by user? eg: profile data, then read from leader
   - Track time of last update and if < 1 min, read from leader
   - Client remembers timestamp of most recent write, then query replica updated since that timestamp

   **Complexities**

   - Request needs to route to data center with leader if replicas are distributed across data centers
   - Cross-device consistency
     - No guarantee device requests are routes to same data center
       - Fix: route users’ devices to same data center
     - Timestamp of user’s last update harder to track
       - Fix: metadata needs to be centralized

2. **Monotonic Reads**

   - Monotonic reads guarantees that if user makes several reads in sequence, they will not see time go backward ie. same query to two different replicas, and one is lagging behind the other
   - Strong consistency > Monotonic read guarantee > Eventual consistency
   - Fix: Make user reads from same replica, take hash of userId

3. **Consistent Prefix Reads**

- Consistent prefix reads guarantees that if a sequence of writes happens in a specific order, then anyone reading those writes will see them appear in the same order
- Problem in **partitioned (shared) databases** since no global ordering of writes. Unlike when DB always writes in same order, and reads see consistent prefix.
- Fix: Ensure writes related to one another are written to same partition, but can’t be done efficiently in some applications

#### Multi-Leader Replication

- To address major downside of leader-based replication ie. only one leader and if unavailable, can’t write to DB
- M*ulti-leader*, _master-master_ or _active/active_ replication where each leader simultaneously acts as a follower to the other leaders
- Often considered tricky to do and avoided if possible
- Makes more sense with multi-data center (DC)
  - With a single data center, complexity of multi-leader outweighs benefit
  - Within each datacenter, regular leader-follower replication
  - Between datacenters, each leader replicates changes to other datacenter leaders
- Cons:
  - Big downside is need to resolve same data that may be modified concurrently in diff DC
- Pros:
  | | Multi-leader | Single-leader |
  | --------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Performance | - Better performance<br />- Each write is processed in local DC so shorter network delay | - All writes must go to DC with leader adding significant latency |
  | Datacenter outage tolerance | - Each DC independent of others<br />- Replication catches up when failed DC is back online | - If leader DC failed, new leader has to be picked from another DC and do failover process |
  | Network (between DC) problems tolerance | - **Async** replication tolerates better ie. network interruption does not prevent write processing | - Public internet less reliable than local network within datacenter, and single-leader sensitive to these problems since writes are made **synchronously** over this link |

**Client with offline operation** (eg: Calendar, Notes)

- Every device has local DB that can act as leader
- Along with some async multi-leader replication process
- Replication lag can by hours or even days
- Architecturally, same as multi-leader with each device as datacenter and unreliable network between them (ie. offline)
- CouchDB designed for this mode of operation

**Collaborative editing** (eg: Google Docs)

- Real-time editing
- Changes instantly applied to local replica
- Asynchronously replicated to server + other users
- To avoid editing conflicts, lock document before user can edit
  - not different from single-leader then
  - subpar experience
- To avoid locking, make unit of change very small (like a keystroke)
  - challenge is conflict resolution

**Handling Write Conflicts**

- Largest con of multi-leader is conflict resolution
- Conflicts are only detected async later in time after both writes are successful

1. **Conflict Avoidance**
   - Simplest way to deal with conflicts is to avoid them
   - All writes for a record go to same leader, then conflicts cannot occur
   - For record/user, route to same datacenter every time and use leader for write+read
   - **When does this approach break down?** If data center fails or user moves location, need to change the designated leader for a record and need to reroute traffic to another datacenter. Here, we have the situation of concurrent writes on different leaders.
2. **Converging towards consistent state**

   - Big question is what should final value be with multiple unordered writes?
   - DB must resolve conflicts in **convergent way** - all replicas must arrive at same value when all changes are replicated
   - Ways of achieving convergent conflict resolution:
     - Give each write a unique ID (timestamp, UUID etc.), pick the write with the highest ID as the _winner_, and throw away other writes. If ID is a timestamp, this is known as _last write wins_, although a popular approach, it is dangerously prone to data loss.
     - Give each replica a unique ID, let writes from higher-ID replica take priority. Also involves data loss.
     - Merge the values together e.g. order them alphabetically and concatenate them. Not always possible.

3. Custom conflict resolution
   - Application code to customize behavior for app
     - On Write: When DB detects conflict of replicated changes, call conflict handler
     - On Read: All conflicting writes stores. On read, multiple version of data are returned to application. App may prompt user of automatically resolve conflict. (CouchDB does this)

**Multi-leader Replication Topologies**

- Replication topology: path through which writes propagate from one node to another
- **all-to-all (most common)**: each leader sends its writes to every other leader
  - Pro: Higher fault tolerance than next two since no single point of failure
  - To order events correctly, use version vectors
- circular topology: each node receives writes from one node, and forwards those writes to other nodes
- star topology: one root node forwards writes to all other nodes, can be generalized into tree
  - Con: In these two, one failing node can interrupt flow of replication messages ie. single point of failure
  - To prevent infinite replication loops, each node is given a unique identifier and the replication log tags each write with the identifiers of the nodes it has passed through

**Leaderless Replication**

- No leader, any replica can accept writes from clients directly
- Clients can send directly to several replicas OR a coordinating node is used (without enforcing order of writes, which leader db does)
- Called Dynamo style systems
- Example: Dynamo, Cassandra

**Writing to DB when node is down**

- no concept of failover here
- clients send write to all replicas in parallel
- read requests are also sent to several replicas in parallel
  - client may get diff responses or stale data, so version numbers are used to find newer value

**Catching up when node is back online: Read repair and anti-entropy**
Two mechanisms to catch up after unavailable node comes back up

- **Read repair**
  - When client detects stale responses, write the newer value back to that replica
  - Repair is only performed when a value is read
  - Pros: Works for frequently read values
  - Cons: Values rarely read may be missing from some replicas, thus reduced durability
- **Anti-entropy**
  - There can be background process that
    - constantly looks for differences in data between replicas and
    - copies any missing data (writes are not copies in any particular order)

**Quorums for reading and writing**

- quorum = minimum number of votes for a read or a write to be valid (r and w here)
- How many replicas is enough to consider that a write was successful?
- _n_ replicas, every write must be confirmed by _w_ nodes to be considered successful, and we must query _r_ nodes for each read.
- As long as _w_ + _r_ > _n_, we expect to get an up-to-date value when reading because at least 1 of the _r_ nodes is up to data.
- A common choice is to make _n_ and odd number (typically 3 or 5) and to set _w_ = _r_ = (_n_ + 1)/2 (rounded up).

**Limitations of Quorum Consistency**

- Sloppy quorum: w writes and r reads may end up on different nodes, so there is no longer a guaranteed overlap
- If two writes occur concurrently, and unclear which came first, the only safe solution is to merge them. Writes can be lost due to clock skew.
- If write and read happen concurrently, write may only be reflected on only some of replicas
- If write fails on some replicas, it is not rolled back on replicas where it succeeded. Reads may or may not return value from that write.
- If node carrying new value fails, and its data is restored from replica carrying old value, the number of replicas storing the new value may break the quorum condition.

For these reasons, **Dynamo-style databases are generally optimized for use cases that can tolerate eventual consistency\*\***.\*\* Stronger guarantees require transactions or consensus.

**Sloppy quorums and hinted handoff**

- Network interruptions may cut off a client from multiple database nodes, s.t. quorum for reads and writes cannot be reached
- Sloppy quorum: writes and reads still require w and r successful responses, but can include nodes not among the n “home” nodes for a value
- Hinted handoff: when network interruption fixed, any writes that nodes temporarily accepted are sent to appropriate “home” nodes
- Sloppy quorums are useful for increasing write availability: as long as any _w_ nodes are available, the database can accept writes. This also means that you cannot be sure to read the latest value for a key, because it may have been temporarily written to some nodes outside of _n_. Suited for high availability, low latency and can tolerate occasional stale reads

**Multi-datacenter operation**
TBC

## Chapter 7 - Transactions

- Implementing fault tolerant mechanisms is a lot of work
- Transactions have been chosen mechanism for simplifying these issues
- All reads and writes in a transaction are executed as one operation: either entire transaction succeeds (commit) or fails (abort, rollback)
- Transactions make error handling simpler for application since no partial failure, and concurrency issues handled by database
- As distributed databases started to emerge, the belief that transactions oppose scalability became popular; that a system would have to abandon transactions in order to maintain good performance and high availability. This is not true though.
- Not every application needs transactions - sometimes there are advantages to weakening transactional guarantees or abandoning them entirely. Some safety properties can be achieved without transactions.

#### ACID

Atomicity, Consistency, Isolation, Durability
(opposite of BASE: Basically Available, Soft State, Eventual Consistency)

- **Atomicity**
  - think of abortability
  - ability to abort transaction on error and have all writes from the transaction discarded (including processed writes)
- **Consistency**
  - **property of application**, whereas rest are property of DB
  - consistency means the database being in **“good state”** in this context
  - certain statements about your data (_invariants_) must always be true
    - Example - in accounting system, credits and debits across all accounts must always be balanced. If a transaction starts with a database that is valid according to invariants, any writes during the transaction preserve the validity, then you can be sure the invariants are always satisfied.
  - Application defined invariants so transaction can preserve them correctly. If application writes bad data violating invariants, database can’t stop you
- **Isolation**
  - Concurrently executing transactions are isolated from each other ie. no race condition style issues
  - _serializability:_ each transaction can pretend that it is the only transaction running on the entire database, and the result is the same as if they had run _serially,_ even though they may have run concurrently.
    - Cons: performance penalty (thus rarely used)
- **Durability**
  - Once a transaction has committed successfully, any data it has written will not be forgotten, even if there is a hardware fault or the database crashes
  - In a single-node database this means the data has been written to non-volatile storage like hard drive/SSD + write-ahead log for crash recovery
  - In a replicated database it means the data has been successfully copied to some number of nodes
  - perfect durability does not exist
    - all hard disks/backups can be destroyed at the same time, and for replicated systems, faults can be correlated (bug/power outage)
  - Different databases have different implementations of ACID

#### Single-Object and Multi-Object Operations

**Single Object**

- Atomicity can be implemented using a log for crash recovery
- Isolation can be implemented using a lock on each object, allowing only one thread to access an object at any one time

**Multi-object transaction**

- when you want to modify several objects (rows, documents, records) at once
- needed if several pieces of data must be kept in sync (eg foreign keys)
- Abandoned by many distributed databases because
  - difficult to implement across partitions
  - can get in the way of very high availability or performance scenarios

**Handling errors and aborts**

- Key idea of transactions: retrying failed transaction is safe
  - “when in danger of not being ACID, abandon transaction rather than finish half”
- Contrast: In leaderless replication datastore, application's responsibility to recover from errors
  - “do as much as possible, and if error, won’t undo things already done”
- Not straightforward scenarios
  - What if the transaction actually succeeded but the network failed while the server tried to acknowledge the successful commit to the client (so the client thinks it failed), retrying the transaction will cause it to be performed twice - unless there's a de-duplication mechanism in place.
  - If the error is due to overload, retrying the transaction will only compound the problem.
  - It is only worth retrying after transient errors (deadlock, isolation violation, network interruptions); after a permanent error - retry would be pointless.
  - If a transaction has side effects outside of the database, those side effects may happen even if the transaction is aborted. E.g. Sending an email

#### Weak Isolation Levels

- Serializable isolation has a performance cost. Thus, common for systems to use weaker levels of isolation, which protect against _some_ concurrency issues, but not all.

Weak isolation levels used in practice:

#### 1. Read Committed Isolation Level

Core idea → Two guarantees to prevents dirty read and write

- No dirty reads: For DB reads, only see data that has been committed
- No dirty writes: For DB writes, only overwrite data that has been committed
  - Done by delaying second write until first transaction has committed or aborted. Row-level locks, only one transaction can hold lock for any given object.

**Cons**

- Plenty of concurrency bugs possible with Read Committed isolation level
- **Non-repeatable read** or **read skew**: when you read at the same time you committed a change, might see temporal and inconsistent results.

Situations where temporal inconsistencies **cannot** be tolerated:

1. **Backups**
   - Backup process of database can take hours
   - Writes are made to database during that time
   - Parts of backup will contain older version of data, and parts newer version
   - If you need to restore from such a backup, inconsistencies become permanent
2. **Analytic queries and integrity checks**
   - Long running analytics queries could end up returning incorrect data if the data in the db has changed over the course of the run

**Solution: Snapshot Isolation**

#### 2. Snapshot Isolation

- Popular feature supported by PostgresSQL (named “repeatable read”), Oracle (named “serializable”), SQL Server
- Each transaction reads from a _consistent snapshot_ of the database
- Implementation of snapshots typically use write locks to prevent dirty writes
- The database must potentially keep several different committed versions of an object (_multi-version concurrency control_ or MVCC)
- Read committed uses a separate snapshot for each query, while snapshot isolation uses the same snapshot for an entire transaction
- **How do indexes work in multi-version database?**
  - One option is to have the index simply point to all versions of an object and require an index query to filter out any object versions that are not visible to the current transaction.
  - When garbage collection removes old object versions no longer visible to any transaction, corresponding index entries can also be removed

**Preventing Lost Updates**

TBC

## Chapter 8 - The Trouble with Distributed System

**Faults and partial failures**

- Partial failures are nondeterministic ie. unpredictable, unlike software on single computer where it either works or doesn’t
- Build fault-tolerant, reliable system from unreliable components

#### Unreliable networks

- Asynchronous packet networks (eg: internet, most internal networks)

  - no guarantee when message will arrive and if it will
  - things that can go wrong → request lost, in queue, remote note failed, response lost on network or delayed
  - Solution: Issue handled via **timeout** - after some time, assume response isn’t going to arrive
    - No correct value for timeouts, need to be determined experimentally/by observing response time distribution

- **Timeouts and unbounded delays**

  - Long timeout = long wait before node declared dead
  - Short timeout
    - Pros: detects fault faster
    - Cons:
      - risk of premature dead declaration
      - additional load on network to promote new node

- **Network congestion and queueing**
  - Different nodes try to send packets simultaneously to the same destination, the network switch must queue them and feed them to the destination one by one. The switch will discard packets when filled up.
  - If CPU cores are busy, the request is queued by the operative system, until applications are ready to handle it.
  - In virtual environments, the operative system is often paused while another virtual machine uses a CPU core. The VM queues the incoming data.
  - TCP performs _flow control_, in which a node limits its own rate of sending in order to avoid overloading a network link or the receiving node. This means additional queuing at the sender.
- Systems can continually measure response times and their variability (_jitter_), and automatically adjust timeouts according to the observed response time distribution.

- **Unreliable clocks**

  - Are all machines on the network on the same clock?
  - Possible to synchronize with Network Time Protocol (NTP)
    1. Time of day clocks: Return current date time acc to calendar
    2. Monotonic clocks: Absolute value of clock meaningless, but diff says how much time has elapsed/timeouts
  - Unreliable clock issues likely to be silent or subtle loss of data

  - **Timestamps for ordering events**
    - Dangerous to rely on clock for ordering events across multiple nodes
      - Clock may be inconsistent across machines
      - **Implies Last write wins**
      - Often used in multi-leader replication and leaderless DB (Cassandra, Riak)
      - data loss may happen
    - **Logical clocks:** measure relative ordering of events, not time of day or elapsed time like monotonic

- **Process Pauses**
  - How does a node know that is it still leader?
    - Lease: Obtain lease from other nodes, and then periodically renew it. If node fails, another one takes over when lease expired.
    - Many reasons why node might pause apart from failure: GC (garbage collector), suspended VM, OS context switches etc.
  - Response time guarantees
    - Some systems require software to respond by certain deadline (Real time OS)
    - Treat GC as planned outage - warn application that node soon requires GC pause, so app can send new requests to other nodes for the time being
- **Node’s knowledge**

  - Node cannot trust its judgement, so system rely on **quorum**
  - Quorum is voting almost the nodes, often absolute majority of more than half of nodes

- Fencing tokens
  - Number that increments each time server grant lock
  - When client sends write request incl. it’s fencing token, server can compare if a higher number token was processed already and rejects request
  - Byzantine faults
    - Fencing tokens can detect and block a node that is _inadvertently_ acting in error
    - Byzantine faults = risk that nodes may “lie”
    - Byzantine fault tolerant = continues to operate correctly even if some nodes malfunction
      - Examples: Aerospace environments, org situations where participants may cheat

#### **Consistency and consensus**

TBC

## Chapter 10 - Batch Processing

**Three types of systems**

- Services (online systems)
  - important metric: response time and availability
- Batch processing (offline systems)
  - important metric: throughput ie. time taken to process certain data size
  - job processes large amount of input data to create output data
- Steam processing (near-realtime systems)
  - important metric: low latency??
  - stream job operates on events shortly after they happen

#### Batch processing with Unix tools

- Unix tools: awk, grep, uniq, sort etc
- Powerful: can process gigabytes of log files in seconds
  - The `sort` utility handles larger-than-memory datasets by
    - spilling to disk
    - automatically parallelizes sorting across multiple CPU cores
- **Unix philosophy**
  - Make each program do one thing well
  - expect output of every program to be input to another, and so on
- How to enable this philosophy?
  - **Uniform interface**
    - all programs use file descriptor as input/output interface
  - **Separation of logic and writing**
    - attach stdout of one process to stdin of another with pipes and in-memory buffer (without writing all intermediate data to disk)
    - separating I/O wiring from program logic makes it easier to compose small tools into bigger systems
  - **Transparency and experimentation**
    - immutable input files - can run commands repeatedly
    - pipe output into file to restart only part of process without re-running entire pipeline
    - pipe output into `less` to see expected form at any point

#### MapReduce and Distributed Filesystems

- single MapReduce job is comparable to single Unix process i.e.
  - does not modify input
  - takes >=1 input and process >=1 output
- MapReduce job read/write on distributed filesystem instead of stdin/stdout
- (HDFS) Hadoop Distributed File System
  - filesystem in Hadoop
  - shared-nothing principle
    - requires no special hardware, only computers connected by conventional datacenter network
    - coordination is done at the software level
  - consists of a daemon process running on each machine for I/O, and a central server called NameNode to track which file blocks are stored on which machine
  - To tolerate machine and disk failures, file blocks are replicated on multiple machines

#### MapReduce Job Execution

- MapReduce is programming framework to write code to process large datasets in distributed filesystem like HDFS

**Steps**

1. Read set of input files, break it up into records
   - handled by input format parser
2. [Map] Call mapper function to extract key and value from each input record
   - custom code
   - eg: print $7, key: 7, value: empty
3. Sort all of key-value pairs by key
   - implicit in MapReduce, we don’t have to write it. Output from map is sorted before giving to reducer
4. [Reduce] Call reducer function to iterate over sorted key-value pairs
   - custom code
   - for multiple occurrences of same key, combine values

- Mapper
  - Called once for every input record
  - It’s job is to extract the key and value
  - For each input, it may generate between 0 to many key-value pairs
- Reducer
  - Takes key-value pairs produced by mappers
  - collects all values belonging to same key
  - calls reducer with an iterator over that collection of values

#### Distributed Execution of MapReduce

- Key difference from pipelines of Unix commands: MapReduce can parallelize computation across many machines, without us having to explicitly handle it
- _putting the computation near data_
  - MapReduce scheduler tries to run each mapper on one of the machines that stores a replica of input file
    - reduces network load and increases locality by not having to copy input file over the network
    - “tries” because this is possible only if machine has enough spare RAM and CPU resources
- Each map task partitions its output by reducer, based on the hash of the key. Each of these partitions is written to a sorted file on the mapper's local disk.
- The reducers download the files of sorted key-value pairs for their partition. The process of partitioning by reducer, sorting, and copying data partitions from mappers to reducers is known as the _shuffle_.
- When the reduce task merges the files from the mapper it preserves their sorted order, and so the values are iterated over in sorted order.

**MapReduce Workflows**

- It's common for MapReduce jobs to be chained together into _workflows_, where the output of one job becomes the input to the next job.
- Chained MapReduce jobs are less like pipelines of Unix commands and more like a sequence of commands where each command's output is written to a temporary file, which the next command reads from.

**Reduce-Side Joins and Grouping**

- Associations between records include a _foreign key_ in a relational model, _document reference_ in a document model, or an _edge_ in a graph model.
- A join is necessary whenever you have some code that needs to access records on both sides of that association.
- In the context of batch processing, a join means resolving **_all_** **occurrences of some association** within a data set, and is not limited to a subset of records.

Example: analysis of user activity events

- To achieve good throughput in a batch process, computation must be (as much as possible) local to one machine. Requests over the network on a per-record basis is too slow.
- When data must be joined together, it should be co-located on the same machine.

**Sort-merge joins**

- A _secondary sort_ ensures that a reducer first processes all records on one side of the association first (eg. records from user database), and then all records on the other side (eg. activity events in timestamp order)
- A sort-merge join has its name because mapper output is sorted by key, and the reducers then merge together the sorted lists of records from both sides of the join.

**Bringing related data together in the same place**

- Having lined up all the data in advance, the reducer can be a simple, single-threaded piece of code that churns through records with high throughput and low memory overhead.
- Because MapReduce separates the physical network communication aspects of computation from the application logic, it can transparently retry failed tasks without affecting the application logic.

**GROUP BY**

- Common functionality is to perform some kind of aggregation within each group
- The simplest way of implementing `GROUP BY` in MapReduce is to configure the mappers so that all produced key-value pairs use the desired grouping key, and then aggregate them in the reducer.
- The partitioning and sorting process brings together all the records with the same key in the same reducer

**Handling Skew**

- For hot keys ie. keys with disproportionate number of values for single key, can lead to skew or hot spots where one reducer would process significantly more records than others
- MapReduce completes when all jobs are complete - thus can be made very slow
- Solutions
  - Run sampling jobs first to determine which keys are hot, and then records related to hot key need to be replicated to all reducers handling that key (shared join method)
  - First stage of aggregation can be distributed across multiple reducers, and then second stage combines those values to create single value for key
- Google’s original use of MapReduce was to build indexes for search engine
- Hadoop MapReduce remains a good way to building indexes for Lucene/Solr
- For full-text search, batch process is very effective way to building indexes
  - mappers partition set of documents as needed
  - each reducer builds the index for its partition
  - index files are written to distributed filesystem
  - parallelizes very well
- Common use of batch processing: ML systems like classifiers and recommendation systems

[TBC Some more join like Map-Side Join, Broadcast hash join etc.]

#### Output of Batch Workflows

- Batch processing is closer to analytics in that it typically scans over large portions of an input data set, but its output is often not a report but some other structure like database.
- Key-value stores as batch process output
  - The obvious choice of getting MapReduce output into database is to use the client library for your database directly in a mapper or reducer. Bad for several reasons
  - Cons
    - Making network request for every single record is orders of magnitude slower than normal throughput of batch task
    - If all mappers or reducers concurrently write to the same database, then that database can become overwhelmed
    - Partially completed jobs may be visible to other systems, while MapReduce provides a clean all-or-nothing guarantee for job output
  - Better solution: create new database inside batch job and write it as files to the job’s output directory in the distributed filesystem

**Philosophy of batch process outputs**

- By treating inputs as immutable and avoiding side-effects, batch jobs achieve good performance and become easier to maintain.
- Automatic retry of a map or reduce task is safe only because inputs are immutable and outputs from failed tasks are discarded by MapReduce framework
- If output is corrupted, can roll back to previous version of code and rerun the job, or keep previous output in a different directory and switch back to it

**Comparing Hadoop to Distributed Databases**

- Hadoop is somewhat like distributed version of Unix, where HDFS is the filesystem and MapReduce is a quirky implementation of Unix process

**Diversity of storage**

-

## Chapter 11 - Stream Processing

#### Transmitting Event Streams

- Key idea: process every event as it happens
- Stream = data incrementally made available over time
- Event (or record) = small, self-contained, immutable object with details of something that happened, contains timestamp
  - Generated once by **\***producer\*\*\*
  - Potentially processed by **\***multiple consumers\*\*\*
  - Related events are grouped together into stream or topic
- Why do we need special tools to deliver event notifications?
  - File or DB can connect producers and consumers, but consumers continually polling becomes expensive
  - Better for consumers to be notified when new events appear

#### Messaging Systems

#### 1. Direct messaging from producers to consumers ie. no broker

- Connects exactly one sender to one recipient
- Publish/subscribe model
- Approaches 1. **What happens if producers send messages faster than consumers can process them?** - Three options - system can drop messages, buffer messages in queue, apply back pressure (flow control, block producer from sending more) - Unix pipes and TCP use control, small fixed-size buffer and blocks sender if full - If messages are buffered, what happens as this grows? Write to disk? How does the disk access affect performance of messaging system? 2. What happens if nodes crash or temp offline, are any messages lost? - Durability may require some combination of writing to disk and/or replication.
- Examples

  - Broker-less messaging libs - ZeroMQ
  - If consumer exposes a service on network, producer can make direct HTTP/RPC request to push messages to consumer.
    - ^ idea behind webhooks, callback URL of one service from another service, make request to URL whenever event occurs
  - UDP multicast - where low latency is important, application-level protocols can recover lost packets
  - StatsD and Brubeck use unreliable UDP messaging for collecting metrics

- **Cons**
  - Possibility of message loss
    - Limited fault tolerance as they assume producers/consumers constantly online
      - Offline consumer will miss messages
    - Failed deliveries may not be retried. Some protocols allow producer to retry but if producer also crashes, these messages are lost.

#### 2. Message Brokers (Message Queue)

- Examples: RabbitMQ, IBM MQ, Google Cloud Pub/Sub (Standards: JMS and AMQP)
- Message broker/queue = database optimized for handling message streams
- Best use case:
  - Messages may be expensive to process
  - Want to parallelize processing on message-by-message basis
  - Messaging order not so important
- Runs as server, and data is centralized here from producers/to consumers
- Pros:

  - Durability is moved to broker by centralizing data
    - System can tolerate clients that come and go
  - Asynchronous consumers (consequence of queuing)
    - Producer only only waits for the broker to confirm it has buffered the message

- Cons/Message brokers (MB) vs Databases

  - **MB not suitable for long term storage.** They delete data when delivered to consumers.
  - Performance can degrade if messages take long to process. MB assumes small working set as they quickly delete messages.
  - MB does not support arbitrary queries, but do notify clients when data changes

- **Two main patterns for Multiple Consumers** (reading messages in same topic)

  - Load Balancing
    - Each messages delivered to one consumer (possibly arbitrarily)
    - Helpful if messages are expensive to process
  - Fan out
    - Each message is delivered to all consumers

- MB use _acknowledgements_ to ensure messages aren’t lost. Client explicitly tells broker when it has finished processing message so broker can remove it from queue
- Load balancing + redelivery means messages can be reordered
  - Fix: Use separate queue per consumer (not use load balancing feature)

#### 3. Partitioned Logs

- Examples: Apache Kafka, Amazon Kinesis Streams, Twitter DistributedLog
- **Best use case:**
  - High message throughput
  - Each message is fast to process
  - Message ordering is important
- Log-based message brokers: Idea is to combine durability of databases with low-latency notification facilities of messaging
- **Append only log on disk**: Producer appends to end of log, consumers read log sequentially
- **Why partition?** To scale to higher throughput than single disk can offer
  - Partitions can be hosted on different machines
  - Topic = group of partitions to carry messages of same type
  - Within each partition, broker assigns increasing sequence number, or _offset_, to every message
    - Number used to tell if consumer has already processed it or not
    - Offset under consumer control so can replay old messages if needed
    - Similar to single-leader DB replication
    - Broker = leader database, consumers = follower
- **Differences between Message Broker and Log**
  - Throughput of log remains ~ constant, since every message written to disk (unlike queue that writes to memory first)
  - Consumer reading from log does not delete messages like on broker. From time to time, old segments are deleted/archived.

#### Databases and Streams

- Change Data Capture (CDC): mechanism for ensuring all changes made to system of record are also reflected in derived data systems
  - One DB is leader, rest are followers
  - Ex: Capture changes in DB and continually apply same changes to search index
  - Parsing replication log is more robust/performant than DB triggers
  - Examples: Kafka Connect integrates CDC tools
- Similar idea to event sourcing
  - Event sourcing helps debugging with replay capability, guards against application bugs, makes it easier to evolve application over time
  - Command: When request from user arrives. This need to be validated synchronously to reject if needed (or tentative confirmation followed up with actual eg ticket booking)
  - Event: Once command is validated, it is an event - durable and immutable
- CQRS = Command query responsibility segregation = separate the form in which data is written from the form it is read ie. they can be different formats
- Cons:
  - Immutable history - not suitable for high rate of updates and deletes because of
    - fragmentation
    - performance compaction
    - garbage collection
  - Async consumers - user read may not reflect their latest write if change hasn’t propagated yet

#### Processing Streams

- **What can we do with streams?** 1. Push event to users eg: send email, push notifications, real-time dashboard 2. Process multiple input streams to produce one or more output streams 3. Write data in events to DB (or similar storage), cache, search index from where other clients can query it
- Operator job: process stream to produce other, derived streams eg email
- Complex event processing (CEP): approach for analyzing event streams where you can specify rules to search for certain patterns of events and emit _complex event_ for matches
  - Examples: SQLstream, IBM InfoSphere
- Stream Analytics: similar but less about query and more about aggregation and statistical metrics
  - Examples: Apache Storm, Kafka Streams

#### Joins

- Since new events can appear anytime, joins are hard
- **Stream-stream joins**
  - Example: detect recent trends in searched URLs
  - Stream processor needs to maintain **state** (all event in last hour indexed by sessionID)
- **Stream-table joins**
  - known as “_enriching_” activity event with DB info
  - example: read time event + isMember info from db
  - Querying remote db can be slow so can load copy of db in stream processor for local queries without network round-trip
    - local copy of DB can stay up-to-date with change-data-capture (CDC)
- **Table-table join**
  - Stream process needs to maintain db with set of followers per user to determine which timelines to update for new tweets
- **Time-dependence join**
  - Which state to use when joining? If ordering across streams is undetermined, join becomes nondeterministic. Issue called _slowly changing dimension_ (SCD)
  - Fix: use unique id for each version of record to distinguish
    - Con: makes log compaction impossible

#### Fault Tolerance

- Stream is infinite, so unlike batch processing, cannot wait until a task is finished before making its output
- Approaches 1. Micro-batch - break stream into small block, and treat each like mini batch process - Example: Spark Streaming, batch size ~ 1 second 2. Periodically generate rolling checkpoints of state and write them to durable storage - If stream operator crashes, can restart from recent checkpoint - Example: Apache Flint
- Both approaches achieve exactly-once-semantics ie. even if event records are processed multiple times, output view is as if processed only once
  - Cons: output of failed batch cannot be discarded once it leaves stream processor
  - For exactly-once appearance, things either need to happen atomically or not happen at all
  - Goal is to discard partial output of failed tasks
  - Fix:
    - Distributed transactions and two-phase commit
      - Example: Google Cloud Dataflow, maybe Apache Kafka
    - Idempotent operations: apply multiple times but look like applied once
      - operation can be made idempotent with extra metadata
      - effective solution with only small overhead
  -
  -

---

## Chapter 11 - Stream Processing

[merge into prev section]

- Stream refers to data that is incrementally made available over time, process every event as it happens

#### Transmitting Event Streams

- Event generated by one producer, processed by multiple consumers
- Related events grouped into topic or stream
- File or DB is sufficient BUT
  - polling for updates since last check can be expensive if datastore not designed for this usage (pull)
  - better for consumers to be notified when new events appear (push)
  - DBs offer _triggers_ but limited, so other tools better for delivering event notifications

#### Messaging Systems

**Direct messaging from producers to consumers**

- With direct messaging between producers and consumers (ie. no intermediary nodes), **limited fault tolerance** because
  - they assume producers/consumers constantly online
  - if consumer offline, producer could retry failed message deliveries but may break down if producer crashes losing buffer or messages
- Within this publish-subscribe model, different systems take a wide range of approaches

1. What happens if producers send messages faster than consumers can process them?
   - System can drop messages
   - or buffer them in queue
   - or apply backpressure (flow control, blocking producer from sending more)
2. What happens if nodes crash or temporarily go offline, are any messages lost?
   - Durability may required writing to disk and/or replication

#### Message Brokers (Message Queue)

- Broker is essentially a database optimized for handling message streams
- Runs as a server, with producers and consumers connecting to it as clients
- By centralizing data in broker,
  - durability is moved to broker
    - some only keep messages in memory, some write to disk to prevent loss in case broker crashes
  - systems can tolerate clients that come and go
- **Consequence of queuing** is that consumers generally asynchronous
  - producer only waits for broker to confirm it has buffered message

**Message brokers versus databases**

- Some brokers can participate in two-phase commit protocols similar to database
- Traditional view of message brokers, encapsulated in standards like JMS and AMQP
- Best suited for 1) messages expensive to process 2) want to parallelize processing 3) message ordering not important
- Examples: RabbitMQ, IBM MQ, Google Cloud Pub/Sub
  | **Message Brokers** | **Databases** |
  | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
  | Delete date when delivered to consumers. Not suitable for long term storage | Keep data until deleted |
  | Assume small working set as they delete messages quickly. Performance (throughput) can degrade if messages take longer to process | Assume large working set |
  | Message brokers often support some way of subscribing to a subset of topics matching some pattern | |
  | Message brokers do not support arbitrary queries, but they do notify clients when data changes. | Database query result is based on a point in time snapshot. New writes don’t show up in old results |
  | Consumers can get notified new data | Have to poll for new data |

**Multiple consumers**

- Two main patterns when multiple consumers read messages in same topic:
  - Load balancing
    - Each message delivered to **one of the consumers**
    - Broker may assign to consumer arbitrarily
    - Helpful if messages are expensive to process
  - Fan out
    - Each message delivered to **all consumers**
- **Acknowledgements:** to ensure message is not lost, client must explicitly tell broker when it has finished processing message so broker can remove it from queue
- **Messages reordered** due to load balancing + redelivery
  - Fix: separate queue per consumer (not use load balancing feature)??????

#### Log Based Message Brokers + Partitioned Logs

- Example: Apache Kafka, Amazon Kinesis Streams, and Twitter's DistributedLog
- Best suited for where message ordering is important, and situations with high message throughput
- Why?
  - Unlike batch processing where input isn’t damaged by re running, stream processing (AMQP/JMS) is destructive ie acknowledgement causes it to be deleted from broker
  - When new consumer added, prior messages already gone and cannot be recovered
- Fix with Log based message brokers: Hybrid of durable storage (databases) and low-latency notifications (message broker)
- Broker acts similar to single-leader database in replication
- Log is **append-only sequence of records on disk**
  - producer sends message by appending to end of log
  - consumer receives messages by reading log sequentially (does not delete it, since log is append only)
  - once consumer reaches end of log, waits for notification that new message has been added
  - from time to time old segments are deleted or moved to archive (else run out of disk space)
- Partitioned Logs
  - **Scale to higher throughput than a single disk that offer**
  - Diff partitions can be hosted on diff machines
  - **Topic** can be then defined as **group of partitions** that all carry messages of same type
  - Within each partition, the broker assigns monotonically increasing sequence number, or _offset_, to every message
  - Log based approach supports **fan-out messaging** since multiple consumers can read log without affecting each other (append only log)
  - To achieve load balancing the broker can assign entire partitions to nodes in the consumer group. Each client then consumes _all_ the messages in the partition it has been assigned. Downsides:
    - Number of nodes sharing work of consuming topic can be at most the number of log partitions in that topic
    - If a message is slow to process, it holds up the processing of subsequent messages in that partition
  - If a slow consumer cannot keep with the rate of messages, and it falls so far behind that its consumer offset points to a deleted segment, it will miss some of the messages.
  - The throughput of a log remains more or less constant, since every message is written to disk anyway. This is in contrast to messaging systems that keep messages in memory by default and only write them to disk if the queue grows too large: systems are fast when queues are short and become much slower when they start writing to disk, throughput depends on the amount of history retained.

#### Event Sourcing

- Store all changes to application state as a log of change events
- Replay event log to apply change to database, search index, cache
- Pros
  - helps with debugging, makes it easier to understand why something happened
  - guards against application bugs
  - easier to evolve applications over time
- Specialized databases such as Event Store have been developed to support applications using event sourcing
- **Event vs command**: when user request arrives, it is a command. If validation is successful (ie. no integrity condition violated, this is done synchronously), it becomes an event - durable and immutable
- Immutable events capture more information than just the current state
  - If you persisted a cart into a regular database, deleting an item would effectively loose that event
- Mutable state and append-only are not contradictions
  - Think of book keeping error fixed with amendments instead of changing the original record
  - If buggy code writes bad data to a database, recovery is much harder if the code is able to destructively overwrite data
- **Command query responsibility segregation (CQRS)**: Lot of flexibility by separating the form of writes vs form of reads
  - Storing data is straightforward if you don't have to worry about how it is going to be queried and accessed

#### Cons of event sourcing + change data capture

- Consumer are usually async → eventual consistency meaning user read may not reflect latest user write
- Limitations on immutable event history depend on the amount of churn in dataset ie. rate of updates/deletes
  - High rate of updates/deleted on somewhat small dataset → issues of fragmentation, performance compaction, garbage collection

#### Processing Streams

**Processing Possibilities**

- Take data in the events and write it to database, cache, search index, or similar storage system
- Push events to users, by sending email alerts, push notifications, real-time dashboard
- Process one or more input streams to produce one or more output streams

- Operator job: processing stream to produce other, derived streams
- **CEP (Complex event processing)**: analyze event streams with specific rules to search for patterns of events. When match found, emit complex event
  - Examples: StreamBase, SQLStream
- Analytics use case more about aggregations and statistical metrics, over specific event sequences
  - Examples: Kafka Streams, Apache Storm, Spark Streaming
  - Examples of hosted services: Google Cloud Dataflow

#### Challenges of stream

- Can’t tell when all events have been received to declare current window complete
- Confusing event time and processing time leads to bad data
  - Processing time unreliable as the stream processor may queue events, restart, so use original event time to count rates.
- Joins on stream are hard since new events can appear anytime

**Handling Challenges**

- Handle straggler events (delayed due to network interruption), since can’t tell when all events have been received to declare current window complete
  - Can ignore straggler events and track count as metric
  - Publish correction, an updated value for window with stragglers included
- **Types of windows**

  - Tumbling window: fixed length, 1min tumbling window
  - Hopping window: fixed length, allow overlap of between window for smoothing eg 1 min overlap
  - Sliding window: events within some interval of each other, eg 5 min sliding window
  - Session window: no fixed duration, all events for same user. Window ends when user is inactive for some time eg 30 mins. Common in website analytics

- Many frameworks use the local system clock on the processing machine (_processing time_) to determine windowing. It is a simple approach that breaks down if there is any significant processing lag.
- To adjust for incorrect device clocks, one approach is to log three timestamps. You can estimate the offset between the device clock and the server clock, then apply that offset to the event timestamp, and thus estimate the true time at which the event actually occurred.
  - The time at which the event occurred, according to the device clock
  - The time at which the event was sent to the server, according to the device clock
  - The time at which the event was received by the server, according to the server clock.

#### Stream Joins

**First three maintain some state**, which mean order of processing is important eg unfollow before follow or vice versa

1. Stream-stream join (window join)
   - Use case: detect recent trends in searched URLs and clicked results
   - Stream processor needs to maintain state: all event in last hour, indexed by session ID. If matching session IDs for search index and clicked video index, emit event saying search result was clicked
2. Stream-table join (stream enrichment)
   - Use case: Add user profile from DB to user activity stream
   - Remote DB: cons are network round trip and risk overloading database
   - Local copy of DB on stream processor: cons is keeping it up to date, can use Change Data Capture
3. Table-table join (materialized view maintenance)
   - Use case: Stream process needs to maintain database with followers per user to know which timelines to update for new tweet
4. Time-dependence join
   - Use case: Calculating tax for user by country for historical data and tax rate
   - S*lowly changing dimension* (SCD)
     - If ordering of events across streams is undetermined, join becomes nondeterministic ie. cannot rerun same job on same input and necessarily get the same result.
     - Address by using unique identifier for version of joined record. Example: ID for tax rate changes, and include tax rate ID in invoice at time of sale

#### Fault Tolerance

With stream processing, can’t wait until task is finished to make output visible since stream is infinite. Unlike batch, this makes fault tolerance harder since job can’t just be rerun in case of fault.

1. Micro-batch
   - Break stream into small blocks, treat each block like mini batch process
   - Used in Spark Streaming, batch size ~1s
2. Checkpointing
   - Periodically generate rolling checkpoints of state and write to durable storage. If stream operator crashes, restart from recent checkpoint.
   - Used in Apache Flint

**Goal**: discard partial output of failed tasks so they can retire without taking effect twice. Means to goal:

1. distributed transactions
2. idempotence

**Atomic commit**

- In order to give appearance of exactly-once processing
- Use distributed transactions and two-phase commit
- Used in Google Cloud Dataflow, soon in Kafka

**Idempotence**

- An idempotent operation is one that you can perform multiple times, and it has the same effect as if you performed it only once.
- Operation can be made idempotent with a bit of extra metadata to tell whether update has already been applied

**Rebuilding state after failure**
To recover state maintained by stream processor

- Remote datastore ready to replicate, but slow
- Keep local state to stream processor, replicate periodically
