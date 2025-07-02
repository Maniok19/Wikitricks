from app import app, db
from models import Trick

def populate_tricks():
    """Populate the database with sample skateboarding tricks"""
    
    sample_tricks = [
        {
            'title': 'Ollie',
            'description': 'The foundation of all skateboarding tricks. Learn to pop the board and jump with it. Master this first before moving to other tricks.',
            'video_url': 'https://www.youtube.com/watch?v=vlUzHIVdYEQ&pp=ygUMb2xsaWUgc2xvd21v',
            'difficulty': 'beginner'
        },
        {
            'title': 'Kickflip',
            'description': 'A classic trick where the board rotates 360 degrees along its length axis. Flick your front foot off the nose to make the board flip.',
            'video_url': 'https://www.youtube.com/watch?v=cC7VEqn-mUM&pp=ygUPa2lja2ZsaXAgc2xvd21v',
            'difficulty': 'intermediate'
        },
        {
            'title': 'Heelflip',
            'description': 'Similar to kickflip but the board rotates in the opposite direction. Use your heel to flick the board instead of your toe.',
            'video_url': 'https://www.youtube.com/watch?v=ggvnTbBPh-E&pp=ygUPSGVlbGZsaXAgc2xvd21v',
            'difficulty': 'intermediate'
        },
        {
            'title': 'Pop Shuvit',
            'description': 'The board rotates 180 degrees horizontally while you jump. A great trick to learn board control and timing.',
            'video_url': 'https://www.youtube.com/watch?v=HBDCAhZnS4I&pp=ygURUG9wIFNodXZpdCBzbG93bW8%3D',
            'difficulty': 'beginner'
        },
        {
            'title': 'Tre Flip (360 Flip)',
            'description': 'Combination of kickflip and 360 shuvit. One of the most technical street tricks requiring perfect timing and foot placement.',
            'video_url': 'https://www.youtube.com/watch?v=QuOcEBS8Qfk&pp=ygUPVHJlIEZsaXAgc2xvd21v',
            'difficulty': 'expert'
        },
        {
            'title': 'Frontside 180',
            'description': 'Turn your body and board 180 degrees frontside. Great for learning board and body rotation coordination.',
            'video_url': 'https://www.youtube.com/watch?v=__u6Kdqa0WA&pp=ygUURnJvbnRzaWRlIDE4MCBzbG93bW8%3D',
            'difficulty': 'beginner'
        },
        {
            'title': 'Backside 180',
            'description': 'Turn your body and board 180 degrees backside. Slightly more challenging than frontside due to blind landing.',
            'video_url': 'https://www.youtube.com/watch?v=gceNTiGevs8&pp=ygUTQmFja3NpZGUgMTgwIHNsb3dtbw%3D%3D',
            'difficulty': 'beginner'
        },
        {
            'title': 'Hardflip',
            'description': 'A frontside shuvit combined with a kickflip. The board flips vertically while rotating horizontally.',
            'video_url': 'https://www.youtube.com/watch?v=7MNEwLijsAE&pp=ygUPSGFyZGZsaXAgc2xvd21v0gcJCb4JAYcqIYzv',
            'difficulty': 'advanced'
        },
        {
            'title': 'Varial Kickflip',
            'description': 'A kickflip combined with a backside shuvit. Perfect trick to learn flip/shuvit combinations.',
            'video_url': 'https://www.youtube.com/watch?v=oZGG5TdAO7E&pp=ygUWVmFyaWFsIEtpY2tmbGlwIHNsb3dtbw%3D%3D',
            'difficulty': 'intermediate'
        },
        {
            'title': 'Boardslide',
            'description': 'Slide along a rail or ledge with the middle of your board. Essential rail trick for street skating.',
            'video_url': 'https://www.youtube.com/watch?v=J31RKm5jk8Q&pp=ygURQm9hcmRzbGlkZSBzbG93bW8%3D',
            'difficulty': 'intermediate'
        },
        {
            'title': '50-50 Grind',
            'description': 'Grind on a rail or ledge with both trucks. The most basic grind trick every skater should learn.',
            'video_url': 'https://www.youtube.com/watch?v=QAUR_zpSlzI&pp=ygUSNTAtNTAgR3JpbmQgc2xvd21v',
            'difficulty': 'intermediate'
        },
        {
            'title': 'Kickflip Underflip',
            'description': 'An extremely technical trick where you catch the board mid-flip and flip it again. Only for expert skaters.',
            'video_url': 'https://www.youtube.com/watch?v=C1e5ZH-Mesg&pp=ygUZS2lja2ZsaXAgVW5kZXJmbGlwIHNsb3dtbw%3D%3D',
            'difficulty': 'expert'
        },
        {
            'title': 'Manual',
            'description': 'Balance on your back wheels while rolling. Great for learning balance and control, connects tricks together.',
            'video_url': 'https://www.youtube.com/watch?v=pbBeoCf62-4&pp=ygUTTWFudWFsIHNrYXRlIHNsb3dtbw%3D%3D',
            'difficulty': 'beginner'
        },
        {
            'title': 'Casper Slide',
            'description': 'An old-school trick where you balance on the edge of the board. Rarely seen in modern skating but looks amazing.',
            'video_url': 'https://www.youtube.com/watch?v=cV8Dl3l5zsQ&pp=ygUTQ2FzcGVyIFNsaWRlIHNsb3dtbw%3D%3D',
            'difficulty': 'advanced'
        },
        {
            'title': 'Laser Flip',
            'description': 'A heelflip combined with a frontside 360 shuvit. One of the most technical flip tricks in skateboarding.',
            'video_url': 'https://www.youtube.com/watch?v=1epuQUED8qs&pp=ygURTGFzZXIgRmxpcCBzbG93bW8%3D',
            'difficulty': 'expert'
        }
    ]
    
    with app.app_context():
        # Clear existing tricks (optional - remove this if you want to keep existing tricks)
        print("Clearing existing tricks...")
        Trick.query.delete()
        
        # Add new tricks
        print("Adding sample tricks...")
        for trick_data in sample_tricks:
            trick = Trick(
                title=trick_data['title'],
                description=trick_data['description'],
                video_url=trick_data['video_url'],
                difficulty=trick_data['difficulty']
            )
            db.session.add(trick)
        
        try:
            db.session.commit()
            print(f"Successfully added {len(sample_tricks)} tricks to the database!")
        except Exception as e:
            db.session.rollback()
            print(f"Error adding tricks: {e}")

if __name__ == '__main__':
    populate_tricks()