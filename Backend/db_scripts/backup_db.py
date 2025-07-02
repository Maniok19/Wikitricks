import subprocess
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def parse_db_url(url):
    # Remove postgresql:// prefix
    url = url.replace('postgresql://', '')
    # Split credentials and host/database
    credentials, rest = url.split('@')
    username, password = credentials.split(':')
    # Split host and database
    host_port, database = rest.split('/')
    # Split host and port if port exists
    if ':' in host_port:
        host, port = host_port.split(':')
    else:
        host = host_port
        port = '5432'  # default PostgreSQL port
    
    return {
        'username': username,
        'password': password,
        'host': host,
        'port': port,
        'database': database
    }

def create_backup():
    try:
        # Get database URL from environment
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise Exception("DATABASE_URL not found in environment variables")

        # Parse database URL
        db_info = parse_db_url(database_url)
        
        # Create backups directory if it doesn't exist
        backup_dir = 'backups'
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)

        # Create backup filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = os.path.join(backup_dir, f'backup_{timestamp}.sql')

        # Set PostgreSQL environment variables
        env = os.environ.copy()
        env['PGPASSWORD'] = db_info['password']

        # Construct pg_dump command
        command = [
            'pg_dump',
            '-h', db_info['host'],
            '-U', db_info['username'],
            '-d', db_info['database'],
            '-f', backup_file
        ]

        # Execute pg_dump
        result = subprocess.run(command, env=env, capture_output=True, text=True)

        if result.returncode == 0:
            print(f"Backup created successfully: {backup_file}")
            return True
        else:
            print("Backup failed!")
            print("Error:", result.stderr)
            return False

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return False

if __name__ == "__main__":
    create_backup()