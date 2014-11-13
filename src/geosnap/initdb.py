# Set the path
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from pymongo import MongoClient
from geosnap import UserService


def setup():
    client = MongoClient()
    db = client.geosnapDb
    user_service = UserService(db)

    item = user_service.get_by_email("admin@geosnap.in")

    if not item:
        print("Create admin user")
        item = {"name": "admin", "username": 'admin', "email": 'admin@geosnap.in', "registered_ip": "10.0.0.1",
                'roles': ['super_admin', 'admin'], 'password': 'pass@123'}
        user_service.create(item)
    else:
        print(item)

if __name__ == "__main__":
    print("Initializing database...")
    setup()
