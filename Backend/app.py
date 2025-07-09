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

# At the top of the file, add debug logging for environment loading
load_dotenv()
print("Environment variables loaded")
print(f"Database URL exists: {'DATABASE_URL' in os.environ}")

# Add Google Client ID constant
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')

app = Flask(__name__)
CORS(app, origins=[
    'https://wikitricks.netlify.app',  # Your Netlify domain
    'http://localhost:3000'  # Local development
], supports_credentials=True)
bcrypt = Bcrypt(app)

# Database Configuration
database_url = os.environ.get('DATABASE_URL')
if database_url:
    print(f"Attempting to connect to database with URL: {database_url}")
    # Handle potential "postgres://" format from some providers
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
else:
    print("ERROR: DATABASE_URL environment variable is not set")
    raise RuntimeError("DATABASE_URL is not set in environment variables")

app.config.update(
    SQLALCHEMY_DATABASE_URI=database_url,
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SECRET_KEY=os.environ.get('SECRET_KEY', 'dev-secret-key')
)

# Configuration email
app.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USERNAME=os.environ.get('MAIL_USERNAME'),
    MAIL_PASSWORD=os.environ.get('MAIL_PASSWORD'),
    MAIL_DEFAULT_SENDER=os.environ.get('MAIL_USERNAME')
)

mail = Mail(app)
serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])

# Initialize SQLAlchemy with app
db.init_app(app)

# Add this after db initialization
with app.app_context():
    try:
        from sqlalchemy import text
        db.session.execute(text('SELECT 1'))
        print("Database connection successful!")
    except Exception as e:
        print(f"Database connection failed: {e}")

def token_required(f):
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

def send_verification_email(email, token):
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
        print(f"Verification email sent successfully to {email}")
        return True
    except Exception as e:
        print(f"Failed to send verification email: {str(e)}")
        return False

@app.route('/create-trick', methods=['POST'])
@token_required
def create_trick():
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
            user_id=user_data['user_id']  # Add user_id here
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
    try:
        tricks = Trick.query.order_by(Trick.created.desc()).all()
        trick_list = []
        
        for trick in tricks:
            trick_data = trick.to_dict()
            video_url = trick.video_url
            
            # Extract YouTube video ID
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

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data or not all(k in data for k in ['email', 'username', 'password']):
        return jsonify({'error': 'Missing required data'}), 400
    
    try:
        # Vérifier si l'email existe déjà
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 409
            
        # Vérifier si le username existe déjà
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 409

        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        verification_token = serializer.dumps(data['email'], salt='email-verify')
        
        new_user = User(
            email=data['email'],
            username=data['username'],
            region=data.get('region', ''),  # Optionnel
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
    try:
        email = serializer.loads(token, salt='email-verify', max_age=86400)  # 24 heures
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
def login():
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
    
@app.route('/health', methods=['GET'])
def health_check():
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
    
# Add these new routes

@app.route('/tricks/<int:trick_id>/comments', methods=['GET'])
def get_comments(trick_id):
    try:
        comments = Comment.query.filter_by(trick_id=trick_id).order_by(Comment.created.desc()).all()
        return jsonify([comment.to_dict() for comment in comments])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/tricks/<int:trick_id>/comments', methods=['POST'])
@token_required
def create_comment(trick_id):
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

@app.route('/tricks/search', methods=['GET'])
def search_tricks():
    query = request.args.get('q', '')
    try:
        search_filter = f"%{query}%"
        tricks = Trick.query.filter(
            Trick.title.ilike(search_filter)  # Remove the db.or_ and keep only title search
        ).order_by(Trick.created.desc()).all()
        
        trick_list = []
        for trick in tricks:
            trick_data = trick.to_dict()
            video_url = trick.video_url
            
            # Process YouTube URL
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

@app.route('/user/profile', methods=['PUT'])
@token_required
def update_profile():
    try:
        token = request.headers.get('Authorization').split()[1]
        user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(user_data['user_id'])

        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.json
        
        # Verify current password
        if not bcrypt.check_password_hash(user.password, data['currentPassword']):
            return jsonify({'error': 'Mot de passe actuel incorrect'}), 401

        # Update username if provided and different
        if data.get('username') and data['username'] != user.username:
            # Check if username is already taken
            if User.query.filter_by(username=data['username']).first():
                return jsonify({'error': 'Ce pseudo est déjà utilisé'}), 409
            user.username = data['username']

        # Update region if provided
        if 'region' in data:
            user.region = data['region']

        # Update password if provided
        if data.get('newPassword'):
            user.password = bcrypt.generate_password_hash(data['newPassword']).decode('utf-8')

        db.session.commit()

        return jsonify(user.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.cli.command("init-db")
def init_db():
    """Initialize the database."""
    db.create_all()
    print('Database initialized!')

# Forum routes
@app.route('/forum/topics', methods=['GET'])
def get_forum_topics():
    try:
        topics = ForumTopic.query.order_by(ForumTopic.is_pinned.desc(), ForumTopic.created.desc()).all()
        return jsonify([topic.to_dict() for topic in topics])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/forum/topics', methods=['POST'])
@token_required
def create_forum_topic():
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
    try:
        topic = ForumTopic.query.get_or_404(topic_id)
        return jsonify(topic.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/forum/topics/<int:topic_id>/replies', methods=['GET'])
def get_forum_replies(topic_id):
    try:
        replies = ForumReply.query.filter_by(topic_id=topic_id).order_by(ForumReply.created.asc()).all()
        return jsonify([reply.to_dict() for reply in replies])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/forum/topics/<int:topic_id>/replies', methods=['POST'])
@token_required
def create_forum_reply(topic_id):
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
    query = request.args.get('q', '')
    try:
        search_filter = f"%{query}%"
        topics = ForumTopic.query.filter(
            ForumTopic.title.ilike(search_filter)
        ).order_by(ForumTopic.created.desc()).all()
        
        return jsonify([topic.to_dict() for topic in topics])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/create-skatepark', methods=['POST'])
def create_skatepark():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    
    data = request.json
    required_fields = ['name', 'address', 'description', 'lat', 'lng']
    
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
        
    try:
        # You'll need to create a Skatepark model in models.py
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
    try:
        skateparks = Skatepark.query.order_by(Skatepark.created_at.desc()).all()
        return jsonify([skatepark.to_dict() for skatepark in skateparks])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add this near your other imports and configurations
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')

# Add this new route for Google OAuth
@app.route('/auth/google', methods=['POST'])
def google_auth():
    try:
        data = request.json
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token is required'}), 400
        
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), GOOGLE_CLIENT_ID
        )
        
        # Get user info from Google
        email = idinfo.get('email')
        name = idinfo.get('name')
        google_id = idinfo.get('sub')
        
        if not email:
            return jsonify({'error': 'Email not provided by Google'}), 400
        
        # Check if user exists
        user = User.query.filter_by(email=email).first()
        
        if user:
            # User exists, update Google ID if not set
            if not user.google_id:
                user.google_id = google_id
                db.session.commit()
        else:
            # Create new user with a secure dummy password
            import secrets
            dummy_password = bcrypt.generate_password_hash(secrets.token_urlsafe(32)).decode('utf-8')
            
            user = User(
                email=email,
                username=name or email.split('@')[0],
                google_id=google_id,
                password=dummy_password,  # Add dummy password
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

@app.route('/leaderboards', methods=['GET'])
def get_leaderboards():
    try:
        trick_contributors = []
        topic_contributors = []
        commenters = []
        forum_participants = []
        top_upvoted_tricks = []

        users = User.query.all()

        for user in users:
            # Count tricks
            trick_count = db.session.query(func.count(Trick.id)).filter(Trick.user_id == user.id).scalar() or 0
            if trick_count > 0:
                trick_contributors.append({
                    'user_id': user.id,
                    'username': user.username,
                    'region': getattr(user, 'region', None),
                    'count': trick_count
                })

            # Count forum topics
            topic_count = db.session.query(func.count(ForumTopic.id)).filter(ForumTopic.user_id == user.id).scalar() or 0
            if topic_count > 0:
                topic_contributors.append({
                    'user_id': user.id,
                    'username': user.username,
                    'region': getattr(user, 'region', None),
                    'count': topic_count
                })

            # Count comments
            comment_count = db.session.query(func.count(Comment.id)).filter(Comment.user_id == user.id).scalar() or 0
            if comment_count > 0:
                commenters.append({
                    'user_id': user.id,
                    'username': user.username,
                    'region': getattr(user, 'region', None),
                    'count': comment_count
                })

            # Count forum replies
            reply_count = db.session.query(func.count(ForumReply.id)).filter(ForumReply.user_id == user.id).scalar() or 0
            total_forum_activity = topic_count + reply_count
            if total_forum_activity > 0:
                forum_participants.append({
                    'user_id': user.id,
                    'username': user.username,
                    'region': getattr(user, 'region', None),
                    'count': total_forum_activity
                })

        # Fetch top upvoted tricks
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

        # Sort and limit results
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

# Trick upvote routes
@app.route('/tricks/<int:trick_id>/upvote', methods=['POST'])
@token_required
def upvote_trick(trick_id):
    try:
        token = request.headers.get('Authorization').split()[1]
        user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user_data['user_id']
        
        # Check if trick exists
        trick = Trick.query.get_or_404(trick_id)
        
        # Check if user already upvoted
        existing_upvote = TrickUpvote.query.filter_by(
            user_id=user_id, 
            trick_id=trick_id
        ).first()
        
        if existing_upvote:
            # Remove upvote (toggle)
            db.session.delete(existing_upvote)
            db.session.commit()
            return jsonify({
                'message': 'Upvote removed',
                'upvoted': False,
                'upvote_count': len(trick.upvotes)
            })
        else:
            # Add upvote
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

# Reply upvote routes
@app.route('/replies/<int:reply_id>/upvote', methods=['POST'])
@token_required
def upvote_reply(reply_id):
    try:
        token = request.headers.get('Authorization').split()[1]
        user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = user_data['user_id']
        
        # Check if reply exists
        reply = ForumReply.query.get_or_404(reply_id)
        
        # Check if user already upvoted
        existing_upvote = ReplyUpvote.query.filter_by(
            user_id=user_id, 
            reply_id=reply_id
        ).first()
        
        if existing_upvote:
            # Remove upvote (toggle)
            db.session.delete(existing_upvote)
            db.session.commit()
            return jsonify({
                'message': 'Upvote removed',
                'upvoted': False,
                'upvote_count': len(reply.upvotes)
            })
        else:
            # Add upvote
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

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    if not data or not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400
    
    try:
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            # Don't reveal if email exists for security
            return jsonify({'message': 'If this email exists, you will receive a password reset link'}), 200
        
        # Generate reset token
        reset_token = serializer.dumps(user.email, salt='password-reset')
        
        # Send reset email
        send_password_reset_email(user.email, reset_token)
        
        return jsonify({'message': 'If this email exists, you will receive a password reset link'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    data = request.json
    if not data or not data.get('password'):
        return jsonify({'error': 'Password is required'}), 400
    
    try:
        # Verify token (valid for 1 hour)
        email = serializer.loads(token, salt='password-reset', max_age=3600)
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'error': 'Invalid reset link'}), 404
        
        # Update password
        user.password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        db.session.commit()
        
        return jsonify({'message': 'Password reset successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Invalid or expired reset link'}), 400

def send_password_reset_email(email, token):
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
        print(f"Password reset email sent successfully to {email}")
        return True
    except Exception as e:
        print(f"Failed to send password reset email: {str(e)}")
        return False