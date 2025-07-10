from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Trick(db.Model):
    """Represents a skateboarding trick posted by a user."""
    __tablename__ = 'tricks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    video_url = db.Column(db.String(255), nullable=False)
    difficulty = db.Column(db.String(50), nullable=False, default='beginner')
    created = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    user = db.relationship('User', backref='tricks')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'video_url': self.video_url,
            'difficulty': self.difficulty,
            'created': self.created.isoformat(),
            'upvote_count': len(self.upvotes),
            'user_id': self.user_id
        }

class User(db.Model):
    """Represents a registered user."""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    region = db.Column(db.String(100))
    password = db.Column(db.String(255), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    google_id = db.Column(db.String(100), unique=True, nullable=True)
    is_admin = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'region': self.region,
            'is_verified': self.is_verified,
            'google_id': self.google_id is not None,
            'is_admin': self.is_admin
        }

class Comment(db.Model):
    """Represents a comment on a trick."""
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created = db.Column(db.DateTime, default=datetime.utcnow)
    trick_id = db.Column(db.Integer, db.ForeignKey('tricks.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    user = db.relationship('User', backref='comments')
    trick = db.relationship('Trick', backref='comments')

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'created': self.created.isoformat(),
            'created_at': self.created.isoformat(),
            'trick_id': self.trick_id,
            'user_email': self.user.email,
            'username': self.user.username,
            'region': self.user.region
        }

class ForumTopic(db.Model):
    """Represents a discussion topic in the forum."""
    __tablename__ = 'forum_topics'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    created = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_pinned = db.Column(db.Boolean, default=False)
    
    user = db.relationship('User', backref='forum_topics')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'created': self.created.isoformat(),
            'user_id': self.user_id,
            'username': self.user.username,
            'user_region': self.user.region,
            'is_pinned': self.is_pinned,
            'reply_count': len(self.replies)
        }

class ForumReply(db.Model):
    """Represents a reply to a forum topic."""
    __tablename__ = 'forum_replies'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created = db.Column(db.DateTime, default=datetime.utcnow)
    topic_id = db.Column(db.Integer, db.ForeignKey('forum_topics.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    user = db.relationship('User', backref='forum_replies')
    topic = db.relationship('ForumTopic', backref='replies')

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'created': self.created.isoformat(),
            'topic_id': self.topic_id,
            'user_id': self.user_id,
            'username': self.user.username,
            'user_region': self.user.region,
            'upvote_count': len(self.upvotes)
        }

class Skatepark(db.Model):
    """Represents a skatepark location."""
    __tablename__ = 'skateparks'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    creator = db.relationship('User', backref='created_skateparks')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'description': self.description,
            'lat': self.lat,
            'lng': self.lng,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'created_by': self.created_by
        }

class TrickUpvote(db.Model):
    """Tracks upvotes for tricks, ensuring one upvote per user per trick."""
    __tablename__ = 'trick_upvotes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    trick_id = db.Column(db.Integer, db.ForeignKey('tricks.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'trick_id', name='unique_trick_upvote'),)
    
    user = db.relationship('User', backref='trick_upvotes')
    trick = db.relationship('Trick', backref='upvotes')

class ReplyUpvote(db.Model):
    """Tracks upvotes for forum replies, ensuring one upvote per user per reply."""
    __tablename__ = 'reply_upvotes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reply_id = db.Column(db.Integer, db.ForeignKey('forum_replies.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'reply_id', name='unique_reply_upvote'),)
    
    user = db.relationship('User', backref='reply_upvotes')
    reply = db.relationship('ForumReply', backref='upvotes')