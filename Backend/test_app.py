import unittest
import json
from app import app, db
from models import User, Trick

class APITestCase(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def register_user(self, email="test@example.com", username="testuser", password="testpass"):
        return self.client.post('/register', json={
            "email": email,
            "username": username,
            "password": password
        })

    def test_register(self):
        response = self.register_user()
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn("message", data)

    def test_create_trick(self):
        # First, register a user (if trick creation requires auth, add login and token)
        self.register_user()
        trick_data = {
            "name": "Ollie",
            "description": "A basic trick.",
            "videoUrl": "https://www.youtube.com/watch?v=abc123",
            "difficulty": "beginner"
        }
        response = self.client.post('/create-trick', json=trick_data)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn("id", data)

    def test_get_tricks(self):
        # Add a trick
        with self.app.app_context():
            trick = Trick(title="Kickflip", description="A flip trick.", video_url="https://youtu.be/xyz", difficulty="intermediate")
            db.session.add(trick)
            db.session.commit()
        response = self.client.get('/tricks')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)

    def test_health_check(self):
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()