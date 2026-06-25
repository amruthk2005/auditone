import mysql.connector
import sys

def get_connection():
    try:
        return mysql.connector.connect(
            host="localhost",
            port=3306,
            user="root",
            password="",
            database="auditone"
        )
    except mysql.connector.Error as err:
        print(f"Error: Could not connect to the database. {err}")
        sys.exit(1)

def list_tables(conn):
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    
    if not tables:
        print("\nNo tables found in database 'auditone'.")
        return
        
    print("\n" + "="*50)
    print(f"{'Table Name':<30} | {'Row Count':<15}")
    print("="*50)
    
    for (table_name,) in tables:
        cursor.execute(f"SELECT COUNT(*) FROM `{table_name}`")
        count = cursor.fetchone()[0]
        print(f"{table_name:<30} | {count:<15}")
    print("="*50 + "\n")
    cursor.close()

def query_table(conn, table_name, limit=10):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(f"SELECT * FROM `{table_name}` LIMIT {limit}")
        rows = cursor.fetchall()
        
        if not rows:
            print(f"\nNo records found in table '{table_name}'.\n")
            return
            
        print(f"\nShowing up to {limit} records from table '{table_name}':")
        print("="*80)
        # print headers
        headers = rows[0].keys()
        print(" | ".join(headers))
        print("-"*80)
        for row in rows:
            print(" | ".join(str(val) for val in row.values()))
        print("="*80 + "\n")
    except mysql.connector.Error as err:
        print(f"Error querying table '{table_name}': {err}")
    finally:
        cursor.close()

def run_query(conn, query):
    cursor = conn.cursor()
    try:
        cursor.execute(query)
        if query.strip().upper().startswith("SELECT") or query.strip().upper().startswith("SHOW"):
            rows = cursor.fetchall()
            headers = [desc[0] for desc in cursor.description]
            print("\nQuery Results:")
            print("="*80)
            print(" | ".join(headers))
            print("-"*80)
            for row in rows:
                print(" | ".join(str(val) for val in row))
            print("="*80 + f"\nTotal rows: {len(rows)}\n")
        else:
            conn.commit()
            print(f"\nQuery executed successfully. Affected rows: {cursor.rowcount}\n")
    except mysql.connector.Error as err:
        print(f"Error executing query: {err}")
    finally:
        cursor.close()

def main():
    conn = get_connection()
    
    while True:
        print("--- Auditone Database Helper ---")
        print("1. List all tables and row counts")
        print("2. Preview a table (first 10 rows)")
        print("3. Execute a custom SQL query")
        print("4. Exit")
        
        choice = input("Enter choice (1-4): ").strip()
        
        if choice == "1":
            list_tables(conn)
        elif choice == "2":
            table_name = input("Enter table name: ").strip()
            query_table(conn, table_name)
        elif choice == "3":
            query = input("Enter SQL query: ").strip()
            if query:
                run_query(conn, query)
        elif choice == "4" or not choice:
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please choose 1, 2, 3, or 4.\n")
            
    conn.close()

if __name__ == "__main__":
    main()
