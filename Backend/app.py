# ═══════════════════════════════════════════════════════════════════════════════════════
# WikiTricks Backend API
# A Flask-based REST API for skateboarding tricks sharing platform
# ═══════════════════════════════════════════════════════════════════════════════════════

import os
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import jwt
import datetime
from functools import wraps
from models import db, User, Trick, Comment, ForumTopic, ForumReply, Skatepark, TrickUpvote, ReplyUpvote
from dotenv import load_dotenv
from urllib.parse import urlparse
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer
from google.oauth2 import id_token
from google.auth.transport import requests
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import redis

# ═══════════════════════════════════════════════════════════════════════════════════════
# Environment Configuration & Validation
# ═══════════════════════════════════════════════════════════════════════════════════════

load_dotenv()

# Critical environment variables validation
required_env_vars = [
    'DATABASE_URL',
    'SECRET_KEY',
    'MAIL_USERNAME',
    'MAIL_PASSWORD',
    'FRONTEND_URL',
    'GOOGLE_CLIENT_ID'
]

missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
if missing_vars:
    raise RuntimeError(f"Missing required environment variables: {', '.join(missing_vars)}")

print("✓ Environment variables validated successfully")

# ═══════════════════════════════════════════════════════════════════════════════════════
# Application Setup & Configuration
# ═══════════════════════════════════════════════════════════════════════════════════════

app = Flask(__name__)

# CORS configuration for development and production
CORS(app, 
    origins=[
        'https://wikitricks.netlify.app',
        'http://localhost:3000'
    ] if os.environ.get('FLASK_ENV') == 'development' else [
        'https://wikitricks.netlify.app'
    ],
    supports_credentials=True,
    methods=['GET', 'POST', 'PUT', 'DELETE'],
    allow_headers=['Content-Type', 'Authorization']
)

bcrypt = Bcrypt(app)

# Database configuration with PostgreSQL support
database_url = os.environ.get('DATABASE_URL')
if database_url:
    print(f"✓ Connecting to database: {database_url}")
    # Handle legacy postgres:// URLs
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
else:
    raise RuntimeError("DATABASE_URL is not set in environment variables")

app.config.update(
    SQLALCHEMY_DATABASE_URI=database_url,
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SECRET_KEY=os.environ.get('SECRET_KEY', 'dev-secret-key')
)

# Email configuration for Gmail SMTP
app.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USERNAME=os.environ.get('MAIL_USERNAME'),
    MAIL_PASSWORD=os.environ.get('MAIL_PASSWORD'),
    MAIL_DEFAULT_SENDER=os.environ.get('MAIL_USERNAME')
)

# Initialize extensions
mail = Mail(app)
serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
db.init_app(app)

# Database connection verification
with app.app_context():
    try:
        from sqlalchemy import text
        db.session.execute(text('SELECT 1'))
        print("✓ Database connection successful!")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")

# Rate limiting configuration
redis_url = os.environ.get('REDIS_URL', 'memory://')
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri=redis_url
)

# Google OAuth configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')

# ═══════════════════════════════════════════════════════════════════════════════════════
# Authentication & Authorization Decorators
# ═══════════════════════════════════════════════════════════════════════════════════════

def token_required(f):
    """Decorator to require valid JWT token for protected routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            return f(*args, **kwargs)
        except:
            return jsonify({'error': 'Invalid token'}), 401
    return decorated

def admin_required(f):
    """Decorator to require admin privileges for admin-only routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            
            user = User.query.get(data['user_id'])
            if not user or not user.is_admin:
                return jsonify({'error': 'Admin access required'}), 403
                
            return f(*args, **kwargs)
        except:
            return jsonify({'error': 'Invalid token'}), 401
    return decorated

# ═══════════════════════════════════════════════════════════════════════════════════════
# Email Utility Functions
# ═══════════════════════════════════════════════════════════════════════════════════════

def send_verification_email(email, token):
    """Send email verification link to new users"""
    try:
        verification_url = f"{os.environ.get('FRONTEND_URL')}/verify-email/{token}"
        msg = Message('Vérification de votre compte WikiTricks',
                    sender=app.config['MAIL_DEFAULT_SENDER'],
                    recipients=[email])
        msg.body = f'''Pour vérifier votre compte, veuillez cliquer sur le lien suivant:
{verification_url}

Ce lien expire dans 24 heures.
'''
        mail.send(msg)
        print(f"✓ Verification email sent to {email}")
        return True
    except Exception as e:
        print(f"✗ Failed to send verification email: {str(e)}")
        return False

def send_password_reset_email(email, token):
    """Send password reset link to users"""
    try:
        reset_url = f"{os.environ.get('FRONTEND_URL')}/reset-password/{token}"
        msg = Message('WikiTricks Password Reset',
                    sender=app.config['MAIL_DEFAULT_SENDER'],
                    recipients=[email])
        msg.body = f'''To reset your WikiTricks password, click the link below:

{reset_url}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.
'''
        mail.send(msg)
        print(f"✓ Password reset email sent to {email}")
        return True
    except Exception as e:
        print(f"✗ Failed to send password reset email: {str(e)}")
        return False

# ═══════════════════════════════════════════════════════════════════════════════════════
# Trick Management Routes
# ═══════════════════════════════════════════════════════════════════════════════════════

@app.route('/create-trick', methods=['POST'])
@token_required
def create_trick():
    """Create a new skateboarding trick with video and details"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.json
    required_fields = ['name', 'description', 'videoUrl', 'difficulty']

    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        token = request.headers.get('Authorization').split()[1]
        user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])

        new_trick = Trick(
            title=data['name'],
            description=data['description'],
            video_url=data['videoUrl'],
            difficulty=data['difficulty'],
            user_id=user_data['user_id']
        )
        db.session.add(new_trick)
        db.session.commit()

        return jsonify({
            "message": "Trick created successfully",
            "id": new_trick.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/tricks', methods=['GET'])
def get_tricks():
    """Retrieve all tricks with YouTube embed URL processing"""
    try:
        tricks = Trick.query.order_by(Trick.created.desc()).all()
        trick_list = []
        
        for trick in tricks:
            trick_data = trick.to_dict()
            video_url = trick.video_url
            
            # Convert YouTube URLs to embed format
            if 'youtube.com' in video_url or 'youtu.be' in video_url:
                if 'v=' in video_url:
                    video_id = video_url.split('v=')[1].split('&')[0]
                else:
                    video_id = video_url.split('/')[-1]
                trick_data['video_url'] = f'https://www.youtube.com/embed/{video_id}'
                
            trick_list.append(trick_data)
            
        return jsonify(trick_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/tricks/<int:trick_id>', methods=['GET'])
def get_trick(trick_id):
    """Retrieve a specific trick by ID"""
    try:
        trick = Trick.query.get_or_404(trick_id)
        trick_data = trick.to_dict()
        
        video_url = trick.video_url
        if 'youtube.com' in video_url or 'youtu.be' in video_url:
            if 'v=' in video_url:
                video_id = video_url.split('v=')[1].split('&')[0]
            else:
                video_id = video_url.split('/')[-1]
            trick_data['video_url'] = f'https://www.youtube.com/embed/{video_id}'
            
        return jsonify(trick_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/tricks/<int:trick_id>', methods=['DELETE'])
@token_required
def delete_own_trick(trick_id):
    """Allow users to delete their own tricks or admins to delete any trick"""
    try:
        token = request.headers.get('Authorization').split()[1]
        user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user_data['user_id']
        
        trick = Trick.query.get_or_404(trick_id)
        
        # Verify ownership or admin privileges
        user = User.query.get(user_id)
        if trick.user_id != user_id and not user.is_admin:
            return jsonify({'error': 'Permission denied'}), 403
        
        # Clean up related data before deletion
        Comment.query.filter_by(trick_id=trick_id).delete()
        TrickUpvote.query.filter_by(trick_id=trick_id).delete()
        
        db.session.delete(trick)
        db.session.commit()
        
        return jsonify({'message': 'Trick deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/tricks/search', methods=['GET'])
def search_tricks():
    """Search tricks by title with YouTube URL processing"""
    query = request.args.get('q', '')
    try:
        search_filter = f"%{query}%"
        tricks = Trick.query.filter(
            Trick.title.ilike(search_filter)
        ).order_by(Trick.created.desc()).all()
        
        trick_list = []
        for trick in tricks:
            trick_data = trick.to_dict()
            video_url = trick.video_url
            
            # Process YouTube URLs for embedding
            if 'youtube.com' in video_url or 'youtu.be' in video_url:
                if 'v=' in video_url:
                    video_id = video_url.split('v=')[1].split('&')[0]
                else:
                    video_id = video_url.split('/')[-1]
                trick_data['video_url'] = f'https://www.youtube.com/embed/{video_id}'
            
            trick_list.append(trick_data)
            
        return jsonify(trick_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ═══════════════════════════════════════════════════════════════════════════════════════
# User Authentication & Account Management
# ═══════════════════════════════════════════════════════════════════════════════════════

@app.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    """Register new user with email verification"""
    data = request.json
    if not data or not all(k in data for k in ['email', 'username', 'password']):
        return jsonify({'error': 'Missing required data'}), 400
    
    try:
        # Check for existing email
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 409
            
        # Check for existing username
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 409

        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        verification_token = serializer.dumps(data['email'], salt='email-verify')
        
        new_user = User(
            email=data['email'],
            username=data['username'],
            region=data.get('region', ''),
            password=hashed_password,
            verification_token=verification_token
        )
        db.session.add(new_user)
        db.session.commit()
        
        send_verification_email(data['email'], verification_token)
        
        return jsonify({
            'message': 'User created successfully. Please check your email to verify your account.'
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    """Verify user email with token"""
    try:
        email = serializer.loads(token, salt='email-verify', max_age=86400)  # 24 hours
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'error': 'Invalid verification link'}), 404
            
        user.is_verified = True
        user.verification_token = None
        db.session.commit()
        
        return jsonify({'message': 'Email verified successfully'})
    except:
        return jsonify({'error': 'Invalid or expired verification link'}), 400

@app.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    """Authenticate user and return JWT token"""
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing credentials'}), 400

    try:
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401

        if not user.is_verified:
            return jsonify({'error': 'Please verify your email before logging in'}), 403
            
        if bcrypt.check_password_hash(user.password, data['password']):
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'token': token,
                'user': user.to_dict()
            })
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/google', methods=['POST'])
def google_auth():
    """Authenticate user with Google OAuth"""
    try:
        data = request.json
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token is required'}), 400
        
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), GOOGLE_CLIENT_ID
        )
        
        email = idinfo.get('email')
        name = idinfo.get('name')
        google_id = idinfo.get('sub')
        
        if not email:
            return jsonify({'error': 'Email not provided by Google'}), 400
        
        # Find or create user
        user = User.query.filter_by(email=email).first()
        
        if user:
            # Update existing user with Google ID
            if not user.google_id:
                user.google_id = google_id
                db.session.commit()
        else:
            # Create new Google user
            import secrets
            dummy_password = bcrypt.generate_password_hash(secrets.token_urlsafe(32)).decode('utf-8')
            
            user = User(
                email=email,
                username=name or email.split('@')[0],
                google_id=google_id,
                password=dummy_password,
                is_verified=True  # Google users are pre-verified
            )
            db.session.add(user)
            db.session.commit()
        
        # Generate JWT token
        jwt_token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': jwt_token,
            'user': user.to_dict()
        })
        
    except ValueError as e:
        return jsonify({'error': 'Invalid Google token'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/user/profile', methods=['PUT'])
@token_required
def update_profile():
    """Update user profile information"""
    try:
        token = request.headers.get('Authorization').split()[1]
        user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(user_data['user_id'])

        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.json

        # Require password check for non-Google users
        if not user.google_id:
            if not bcrypt.check_password_hash(user.password, data.get('currentPassword', '')):
                return jsonify({'error': 'Mot de passe actuel incorrect'}), 401
        else:
            # For Google users, require Google ID token verification for profile changes
            google_token = data.get('googleToken')
            if not google_token:
                return jsonify({'error': 'Google authentication required for profile update'}), 401
            try:
                idinfo = id_token.verify_oauth2_token(
                    google_token, requests.Request(), GOOGLE_CLIENT_ID
                )
                if idinfo.get('sub') != user.google_id or idinfo.get('email') != user.email:
                    return jsonify({'error': 'Google authentication failed'}), 401
            except Exception:
                return jsonify({'error': 'Invalid Google token'}), 401

        # Update username if provided and different
        if data.get('username') and data['username'] != user.username:
            if User.query.filter_by(username=data['username']).first():
                return jsonify({'error': 'Ce pseudo est déjà utilisé'}), 409
            user.username = data['username']

        # Update region if provided
        if 'region' in data:
            user.region = data['region']

        # Update password if provided (only for non-Google users)
        if data.get('newPassword') and not user.google_id:
            user.password = bcrypt.generate_password_hash(data['newPassword']).decode('utf-8')

        db.session.commit()
        return jsonify(user.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/user/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current authenticated user information"""
    try:
        token = request.headers.get('Authorization').split()[1]
        user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(user_data['user_id'])
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/forgot-password', methods=['POST'])
@limiter.limit("3 per minute")
def forgot_password():
    """Send password reset email"""
    data = request.json
    if not data or not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400
    
    try:
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            # Don't reveal if email exists for security
            return jsonify({'message': 'If this email exists, you will receive a password reset link'}), 200
        
        reset_token = serializer.dumps(user.email, salt='password-reset')
        send_password_reset_email(user.email, reset_token)
        
        return jsonify({'message': 'If this email exists, you will receive a password reset link'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    """Reset user password with token"""
    data = request.json
    if not data or not data.get('password'):
        return jsonify({'error': 'Password is required'}), 400
    
    try:
        # Verify token (valid for 1 hour)
        email = serializer.loads(token, salt='password-reset', max_age=3600)
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'error': 'Invalid reset link'}), 404
        
        user.password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        db.session.commit()
        
        return jsonify({'message': 'Password reset successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Invalid or expired reset link'}), 400

# ═══════════════════════════════════════════════════════════════════════════════════════
# Comment System
# ═══════════════════════════════════════════════════════════════════════════════════════

@app.route('/tricks/<int:trick_id>/comments', methods=['GET'])
def get_comments(trick_id):
    """Get all comments for a specific trick"""
    try:
        comments = Comment.query.filter_by(trick_id=trick_id).order_by(Comment.created.desc()).all()
        return jsonify([comment.to_dict() for comment in comments])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/tricks/<int:trick_id>/comments', methods=['POST'])
@token_required
def create_comment(trick_id):
    """Create a new comment on a trick"""
    data = request.json
    if not data or 'content' not in data:
        return jsonify({'error': 'Missing content'}), 400
        
    try:
        token = request.headers.get('Authorization').split()[1]
        user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        
        comment = Comment(
            content=data['content'],
            trick_id=trick_id,
            user_id=user_data['user_id']
        )
        db.session.add(comment)
        db.session.commit()
        
        return jsonify(comment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ═══════════════════════════════════════════════════════════════════════════════════════
# Forum System
# ═══════════════════════════════════════════════════════════════════════════════════════

@app.route('/forum/topics', methods=['GET'])
def get_forum_topics():
    """Get all forum topics with pinned topics first"""
    try:
        topics = ForumTopic.query.order_by(ForumTopic.is_pinned.desc(), ForumTopic.created.desc()).all()
        return jsonify([topic.to_dict() for topic in topics])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/forum/topics', methods=['POST'])
@token_required
def create_forum_topic():
    """Create a new forum topic"""
    data = request.json
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
        
    try:
        token = request.headers.get('Authorization').split()[1]
        user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        
        topic = ForumTopic(
            title=data['title'],
            description=data.get('description', ''),
            user_id=user_data['user_id']
        )
        db.session.add(topic)
        db.session.commit()
        
        return jsonify(topic.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/forum/topics/<int:topic_id>', methods=['GET'])
def get_forum_topic(topic_id):
    """Get a specific forum topic"""
    try:
        topic = ForumTopic.query.get_or_404(topic_id)
        return jsonify(topic.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/forum/topics/<int:topic_id>/replies', methods=['GET'])
def get_forum_replies(topic_id):
    """Get all replies for a forum topic"""
    try:
        replies = ForumReply.query.filter_by(topic_id=topic_id).order_by(ForumReply.created.asc()).all()
        return jsonify([reply.to_dict() for reply in replies])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/forum/topics/<int:topic_id>/replies', methods=['POST'])
@token_required
def create_forum_reply(topic_id):
    """Create a new reply to a forum topic"""
    data = request.json
    if not data or not data.get('content'):
        return jsonify({'error': 'Content is required'}), 400
        
    try:
        token = request.headers.get('Authorization').split()[1]
        user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        
        # Verify topic exists
        topic = ForumTopic.query.get_or_404(topic_id)
        
        reply = ForumReply(
            content=data['content'],
            topic_id=topic_id,
            user_id=user_data['user_id']
        )
        db.session.add(reply)
        db.session.commit()
        
        return jsonify(reply.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/forum/search', methods=['GET'])
def search_forum():
    """Search forum topics by title"""
    query = request.args.get('q', '')
    try:
        search_filter = f"%{query}%"
        topics = ForumTopic.query.filter(
            ForumTopic.title.ilike(search_filter)
        ).order_by(ForumTopic.created.desc()).all()
        
        return jsonify([topic.to_dict() for topic in topics])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ═══════════════════════════════════════════════════════════════════════════════════════
# Skatepark Management
# ═══════════════════════════════════════════════════════════════════════════════════════

@app.route('/create-skatepark', methods=['POST'])
def create_skatepark():
    """Create a new skatepark location"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    
    data = request.json
    required_fields = ['name', 'address', 'description', 'lat', 'lng']
    
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
        
    try:
        new_skatepark = Skatepark(
            name=data['name'],
            address=data['address'],
            description=data['description'],
            lat=data['lat'],
            lng=data['lng']
        )
        db.session.add(new_skatepark)
        db.session.commit()
        
        return jsonify({
            "message": "Skatepark created successfully",
            "id": new_skatepark.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/skateparks', methods=['GET'])
def get_skateparks():
    """Get all skateparks"""
    try:
        skateparks = Skatepark.query.order_by(Skatepark.created_at.desc()).all()
        return jsonify([skatepark.to_dict() for skatepark in skateparks])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ═══════════════════════════════════════════════════════════════════════════════════════
# Voting System
# ═══════════════════════════════════════════════════════════════════════════════════════

@app.route('/tricks/<int:trick_id>/upvote', methods=['POST'])
@token_required
def upvote_trick(trick_id):
    """Toggle upvote on a trick"""
    try:
        token = request.headers.get('Authorization').split()[1]
        user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user_data['user_id']
        
        trick = Trick.query.get_or_404(trick_id)
        
        # Check if user already upvoted
        existing_upvote = TrickUpvote.query.filter_by(
            user_id=user_id, 
            trick_id=trick_id
        ).first()
        
        if existing_upvote:
            # Remove upvote (toggle off)
            db.session.delete(existing_upvote)
            db.session.commit()
            return jsonify({
                'message': 'Upvote removed',
                'upvoted': False,
                'upvote_count': len(trick.upvotes)
            })
        else:
            # Add upvote (toggle on)
            upvote = TrickUpvote(user_id=user_id, trick_id=trick_id)
            db.session.add(upvote)
            db.session.commit()
            return jsonify({
                'message': 'Trick upvoted',
                'upvoted': True,
                'upvote_count': len(trick.upvotes)
            })
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/tricks/<int:trick_id>/upvote-status', methods=['GET'])
@token_required
def get_trick_upvote_status(trick_id):
    """Get upvote status for a trick"""
    try:
        token = request.headers.get('Authorization').split()[1]
        user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user_data['user_id']
        
        trick = Trick.query.get_or_404(trick_id)
        upvote = TrickUpvote.query.filter_by(
            user_id=user_id, 
            trick_id=trick_id
        ).first()
        
        return jsonify({
            'upvoted': upvote is not None,
            'upvote_count': len(trick.upvotes)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/replies/<int:reply_id>/upvote', methods=['POST'])
@token_required
def upvote_reply(reply_id):
    """Toggle upvote on a forum reply"""
    try:
        token = request.headers.get('Authorization').split()[1]
        user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user_data['user_id']
        
        reply = ForumReply.query.get_or_404(reply_id)
        
        # Check if user already upvoted
        existing_upvote = ReplyUpvote.query.filter_by(
            user_id=user_id, 
            reply_id=reply_id
        ).first()
        
        if existing_upvote:
            # Remove upvote (toggle off)
            db.session.delete(existing_upvote)
            db.session.commit()
            return jsonify({
                'message': 'Upvote removed',
                'upvoted': False,
                'upvote_count': len(reply.upvotes)
            })
        else:
            # Add upvote (toggle on)
            upvote = ReplyUpvote(user_id=user_id, reply_id=reply_id)
            db.session.add(upvote)
            db.session.commit()
            return jsonify({
                'message': 'Reply upvoted',
                'upvoted': True,
                'upvote_count': len(reply.upvotes)
            })
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/replies/<int:reply_id>/upvote-status', methods=['GET'])
@token_required
def get_reply_upvote_status(reply_id):
    """Get upvote status for a forum reply"""
    try:
        token = request.headers.get('Authorization').split()[1]
        user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user_data['user_id']
        
        reply = ForumReply.query.get_or_404(reply_id)
        upvote = ReplyUpvote.query.filter_by(
            user_id=user_id, 
            reply_id=reply_id
        ).first()
        
        return jsonify({
            'upvoted': upvote is not None,
            'upvote_count': len(reply.upvotes)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ═══════════════════════════════════════════════════════════════════════════════════════
# Leaderboards & Statistics
# ═══════════════════════════════════════════════════════════════════════════════════════

@app.route('/leaderboards', methods=['GET'])
def get_leaderboards():
    """Get comprehensive leaderboards for different activities"""
    try:
        trick_contributors = []
        topic_contributors = []
        commenters = []
        forum_participants = []
        top_upvoted_tricks = []

        users = User.query.all()

        # Calculate user statistics
        for user in users:
            # Trick contributions
            trick_count = db.session.query(func.count(Trick.id)).filter(Trick.user_id == user.id).scalar() or 0
            if trick_count > 0:
                trick_contributors.append({
                    'user_id': user.id,
                    'username': user.username,
                    'region': getattr(user, 'region', None),
                    'count': trick_count
                })

            # Forum topic contributions
            topic_count = db.session.query(func.count(ForumTopic.id)).filter(ForumTopic.user_id == user.id).scalar() or 0
            if topic_count > 0:
                topic_contributors.append({
                    'user_id': user.id,
                    'username': user.username,
                    'region': getattr(user, 'region', None),
                    'count': topic_count
                })

            # Comment contributions
            comment_count = db.session.query(func.count(Comment.id)).filter(Comment.user_id == user.id).scalar() or 0
            if comment_count > 0:
                commenters.append({
                    'user_id': user.id,
                    'username': user.username,
                    'region': getattr(user, 'region', None),
                    'count': comment_count
                })

            # Forum participation (topics + replies)
            reply_count = db.session.query(func.count(ForumReply.id)).filter(ForumReply.user_id == user.id).scalar() or 0
            total_forum_activity = topic_count + reply_count
            if total_forum_activity > 0:
                forum_participants.append({
                    'user_id': user.id,
                    'username': user.username,
                    'region': getattr(user, 'region', None),
                    'count': total_forum_activity
                })

        # Get top upvoted tricks
        tricks = db.session.query(
            Trick.id,
            Trick.title,
            func.count(TrickUpvote.id).label('upvote_count')
        ).join(TrickUpvote, Trick.id == TrickUpvote.trick_id, isouter=True).group_by(Trick.id).order_by(func.count(TrickUpvote.id).desc()).limit(10).all()

        for trick in tricks:
            top_upvoted_tricks.append({
                'id': trick.id,
                'title': trick.title,
                'upvote_count': trick.upvote_count
            })

        # Sort leaderboards by count (descending)
        trick_contributors.sort(key=lambda x: x['count'], reverse=True)
        topic_contributors.sort(key=lambda x: x['count'], reverse=True)
        commenters.sort(key=lambda x: x['count'], reverse=True)
        forum_participants.sort(key=lambda x: x['count'], reverse=True)

        return jsonify({
            'trick_contributors': trick_contributors[:10],
            'topic_contributors': topic_contributors[:10],
            'commenters': commenters[:10],
            'forum_participants': forum_participants[:10],
            'top_upvoted_tricks': top_upvoted_tricks
        })

    except Exception as e:
        print(f"Leaderboards error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ═══════════════════════════════════════════════════════════════════════════════════════
# Admin Management Routes
# ═══════════════════════════════════════════════════════════════════════════════════════

@app.route('/admin/dashboard', methods=['GET'])
@admin_required
def admin_dashboard():
    """Get admin dashboard statistics and recent activity"""
    try:
        # Platform statistics
        total_users = User.query.count()
        total_tricks = Trick.query.count()
        total_topics = ForumTopic.query.count()
        total_comments = Comment.query.count()
        total_replies = ForumReply.query.count()
        
        # Recent activity
        recent_tricks = Trick.query.order_by(Trick.created.desc()).limit(5).all()
        recent_topics = ForumTopic.query.order_by(ForumTopic.created.desc()).limit(5).all()
        recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
        
        return jsonify({
            'stats': {
                'total_users': total_users,
                'total_tricks': total_tricks,
                'total_topics': total_topics,
                'total_comments': total_comments,
                'total_replies': total_replies
            },
            'recent_activity': {
                'tricks': [trick.to_dict() for trick in recent_tricks],
                'topics': [topic.to_dict() for topic in recent_topics],
                'users': [user.to_dict() for user in recent_users]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/tricks/<int:trick_id>', methods=['DELETE'])
@admin_required
def admin_delete_trick(trick_id):
    """Admin delete any trick"""
    try:
        trick = Trick.query.get_or_404(trick_id)
        
        # Clean up related data
        Comment.query.filter_by(trick_id=trick_id).delete()
        TrickUpvote.query.filter_by(trick_id=trick_id).delete()
        
        db.session.delete(trick)
        db.session.commit()
        
        return jsonify({'message': 'Trick deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/admin/comments/<int:comment_id>', methods=['DELETE'])
@admin_required
def admin_delete_comment(comment_id):
    """Admin delete any comment"""
    try:
        comment = Comment.query.get_or_404(comment_id)
        db.session.delete(comment)
        db.session.commit()
        
        return jsonify({'message': 'Comment deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/admin/forum/topics/<int:topic_id>', methods=['DELETE'])
@admin_required
def admin_delete_forum_topic(topic_id):
    """Admin delete any forum topic and its replies"""
    try:
        topic = ForumTopic.query.get_or_404(topic_id)
        
        # Clean up related data
        reply_ids = [reply.id for reply in topic.replies]
        for reply_id in reply_ids:
            ReplyUpvote.query.filter_by(reply_id=reply_id).delete()
        
        ForumReply.query.filter_by(topic_id=topic_id).delete()
        db.session.delete(topic)
        db.session.commit()
        
        return jsonify({'message': 'Forum topic deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/admin/forum/replies/<int:reply_id>', methods=['DELETE'])
@admin_required
def admin_delete_forum_reply(reply_id):
    """Admin delete any forum reply"""
    try:
        reply = ForumReply.query.get_or_404(reply_id)
        
        # Clean up related upvotes
        ReplyUpvote.query.filter_by(reply_id=reply_id).delete()
        
        db.session.delete(reply)
        db.session.commit()
        
        return jsonify({'message': 'Forum reply deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/admin/users/<int:user_id>/toggle-admin', methods=['POST'])
@admin_required
def toggle_admin_status(user_id):
    """Toggle admin status for a user"""
    try:
        user = User.query.get_or_404(user_id)
        user.is_admin = not user.is_admin
        db.session.commit()
        
        return jsonify({
            'message': f'Admin status {"granted" if user.is_admin else "revoked"} for user {user.username}',
            'is_admin': user.is_admin
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ═══════════════════════════════════════════════════════════════════════════════════════
# System Health & Utilities
# ═══════════════════════════════════════════════════════════════════════════════════════

@app.route('/health', methods=['GET'])
def health_check():
    """Application health check endpoint"""
    try:
        from sqlalchemy import text
        db.session.execute(text('SELECT 1'))
        return jsonify({
            'status': 'healthy',
            'database': 'connected'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': str(e)
        }), 500

@app.cli.command("init-db")
def init_db():
    """Initialize the database tables"""
    db.create_all()
    print('✓ Database initialized!')

# ═══════════════════════════════════════════════════════════════════════════════════════
# Application Entry Point
# ═══════════════════════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)