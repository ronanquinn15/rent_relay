from pymongo import MongoClient
import bcrypt

client = MongoClient('mongodb://localhost:27017/')
db = client.rentRelayDB
admin = db.admin

admin.insert_one(
    {
        "role": "admin",
        "username": "admin",
        "password": bcrypt.hashpw(b"password", bcrypt.gensalt()),
        "email": "Quinn-R56@ulster.ac.uk",
    }
)