from flask import Flask
from models import db, Trick, User, Comment, ForumTopic, ForumReply, Skatepark, TrickUpvote, ReplyUpvote
import time
from sqlalchemy import text
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
print("Environment variables loaded")

app = Flask(__name__)

# Get database URL from environment
database_url = os.environ.get('DATABASE_URL')
if not database_url:
    raise RuntimeError("DATABASE_URL not found in environment variables")

# Handle potential "postgres://" format
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# Configure Flask app
app.config.update(
    SQLALCHEMY_DATABASE_URI=database_url,
    SQLALCHEMY_TRACK_MODIFICATIONS=False
)

# Initialize SQLAlchemy
db.init_app(app)

def init_db_connection():
    max_retries = 5
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            with app.app_context():
                # Verify connection first
                db.session.execute(text('SELECT 1'))
                print("Database connection successful")
                
                # Drop all existing tables
                db.drop_all()
                print("Existing tables dropped")
                
                # Create all tables from models
                db.create_all()
                print("New tables created")
                
                db.session.commit()
                print("Database initialized successfully!")
                return True
                
        except Exception as e:
            retry_count += 1
            print(f"Database connection attempt {retry_count} failed: {e}")
            if retry_count < max_retries:
                print("Retrying in 5 seconds...")
                time.sleep(5)
            else:
                print("Max retries reached. Database initialization failed.")
    return False

if __name__ == '__main__':
    if not init_db_connection():
        raise RuntimeError("Could not establish database connection after multiple attempts")