"""
DBUnderstand.py - A class to analyze and extract information about databases from nlpmodel.py
"""

class DBUnderstand:
    def __init__(self):
        """Initialize the DBUnderstand class by loading database information from nlpmodel.py"""
        from nlpmodel import db_configsystems
        self.db_systems = db_configsystems
        
        # Define NoSQL databases
        self.nosql_databases = [
            "MongoDB", "Cassandra", "Redis", "Elasticsearch", "Neo4j", "Couchbase", 
            "CouchDB", "Couch", "DynamoDB", "Amazon DynamoDB", "DocumentDB", 
            "Cassandra Apache", "Cassandra  Datastax", "Apache Cassandra", 
            "Azure Cosmos SQL", "Azure Cosmos Table", "Azure Cosmos Gremlin", 
            "Azure Cosmos", "Google Cloud Firestore", "Google Cloud Firebase",
            "ScyllaDB", "OpenSearch"
        ]
        
        # Define database aliases
        self.db_aliases = {
            "MongoDB": ["MongoDB", "MongoDB Atlas"],
            "Cassandra": ["Cassandra", "Cassandra Apache", "Cassandra  Datastax", "Apache Cassandra", "Azure Cassandra"],
            "PostgreSQL": ["PostgreSQL", "Amazon RDS for PostgreSQL", "Amazon RDS for Postgres", "Azure Database for PostgreSQL", "Google Cloud PostgreSQL", "EDB Postgres"],
            "MySQL": ["MySQL", "MariaDB", "PerconaMySQL", "Amazon RDS for MySQL", "Amazon RDS for MariaDB", "Azure MySQL", "Google Cloud MySQL"],
            "Oracle": ["Oracle", "Oracle RAC", "Oracle Exadata", "Amazon RDS for Oracle", "Oracle Autonomous Database"],
            "SQL Server": ["MS SQL Server", "MS SQL Server Always On", "MS SQL Server Cluster", "Amazon RDS for Microsoft SQL Server", "AmazonRDS for SQL Server", "Google Cloud MSSQL"],
            "DB2": ["DB2", "DB2 Purescale", "IBM DB2 for zOS", "IBM DB2 Warehouse"],
            "Redis": ["Redis", "Amazon ElastiCache for Redis"],
            "Cosmos DB": ["Azure Cosmos SQL", "Azure Cosmos Table", "Azure Cosmos Gremlin", "Azure Cosmos"],
            "Aurora": ["Amazon Aurora MySQL", "Amazon Aurora PostgreSQL", "Amazon RDS for Aurora Postgres"]
        }
        
        # Define IBM databases
        self.ibm_databases = [
            "DB2", "DB2 Purescale", "IBM DB2 for zOS", "IBM DB2 Warehouse", 
            "Netezza", "IMS for zOS", "Datasets for zOS"
        ]
    
        self.connector_keywords = {
            "uc": ["uc", "universal connector", "universal connectors"],
            "exstap": ["exstap", "ex stap", "external stap", "external s-tap"],
            "azevhub": ["azevhub", "az ev hub", "azure event hub", "event hub"],
            "amkin": ["amkin", "am kin", "amazon kinesis", "kinesis"]
        }
    def get_nosql_databases(self):
        """
        Get a list of all IBM databases
        
        Returns:
            list: List of IBM database names
        """
        return self.nosql_databases
    def isthisNoSQL(self, database_name):
        """
        Determine if a database is a NoSQL database
        
        Args:
            database_name (str): Name of the database to check
            
        Returns:
            bool: True if the database is NoSQL, False otherwise
        """
        return database_name in self.nosql_databases
    
    def get_database_aliases(self):
        """
        Get all aliases for each database type
        
        Returns:
            dict: Dictionary with database types as keys and lists of aliases as values
        """
        return self.db_aliases
    
    def get_ibm_databases(self):
        """
        Get a list of all IBM databases
        
        Returns:
            list: List of IBM database names
        """
        return self.ibm_databases
    
    def is_database_supported(self, database_name):
        """
        Check if a database is in the supported database systems list
        
        Args:
            database_name (str): Name of the database to check
            
        Returns:
            bool: True if the database is supported, False otherwise
        """
        return database_name in self.db_systems
    
    def get_all_databases(self):
        """
        Get a list of all supported databases
        
        Returns:
            list: List of all database names
        """
        return list(self.db_systems.keys())
    
    def get_cloud_databases(self):
        """
        Get databases categorized by cloud provider
        
        Returns:
            dict: Dictionary with cloud providers as keys and lists of databases as values
        """
        cloud_dbs = {
            "AWS": [],
            "Azure": [],
            "Google Cloud": [],
            "IBM Cloud": [],
            "Oracle Cloud": []
        }
        
        for db in self.db_systems:
            if db.startswith("Amazon") or db.startswith("AWS"):
                cloud_dbs["AWS"].append(db)
            elif db.startswith("Azure"):
                cloud_dbs["Azure"].append(db)
            elif db.startswith("Google Cloud"):
                cloud_dbs["Google Cloud"].append(db)
            elif db.startswith("IBM") or db in self.ibm_databases:
                cloud_dbs["IBM Cloud"].append(db)
            elif db.startswith("Oracle") and "Cloud" in db:
                cloud_dbs["Oracle Cloud"].append(db)
                
        return cloud_dbs

# Made with Bob
