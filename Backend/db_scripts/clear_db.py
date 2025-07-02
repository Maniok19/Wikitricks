from flask import Flask 
from flask_sqlalchemy import SQLAlchemy
from models import db
import os
import sys
import time
from sqlalchemy import text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
database_url = os.environ.get('DATABASE_URL')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def attempt_connection():
    try:
        with app.app_context():
            db.session.execute(text('SELECT 1'))
        return True
    except Exception:
        return False

def clear_database():
    print("WARNING: This will delete all data in the database!")
    print("Are you sure you want to continue? (yes/no)")
    
    if input().lower() != 'yes':
        print("Operation cancelled.")
        return False

    retries = 3
    for attempt in range(retries):
        try:
            with app.app_context():
                if not attempt_connection():
                    raise Exception("Database connection failed")
                
                db.drop_all()
                print("Tables dropped successfully")
                
                db.create_all()
                print("Tables recreated successfully")
                
                db.session.commit()
                print("Database cleared successfully!")
                return True
                
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt < retries - 1:
                print(f"Retrying in 5 seconds...")
                time.sleep(5)
    
    print("Failed to clear database after multiple attempts")
    return False

if __name__ == "__main__":
    success = clear_database()
    sys.exit(0 if success else 1)