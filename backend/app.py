from flask import Flask, render_template, jsonify, make_response
from flask_cors import CORS
import bson
from flask_socketio import SocketIO, emit
from pymongo import MongoClient
from datetime import datetime
from blueprints.auth.auth import auth_bp
from blueprints.landlord.landlord import landlord_bp
from blueprints.properties.properties import properties_bp
from blueprints.tenants.tenants import tenants_bp
from blueprints.maintenance.maintenance import maintenance_bp
from bson.objectid import ObjectId

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app, origins=["http://localhost:4200"])

app.register_blueprint(auth_bp)
app.register_blueprint(landlord_bp)
app.register_blueprint(properties_bp)
app.register_blueprint(tenants_bp)
app.register_blueprint(maintenance_bp)

# MongoDB setup
client = MongoClient('mongodb://localhost:27017/')
db = client['rentRelayDB']
messages_collection = db['messages']

@app.route('/messages/<property_id>', methods=['GET'])
def get_messages(property_id):
    try:
        property_obj_id = ObjectId(property_id)
    except bson.errors.InvalidId:
        return jsonify({'error': 'Invalid property_id'}), 400

    messages = messages_collection.find({'property_id': property_obj_id})
    messages_list = []
    for message in messages:
        message['_id'] = str(message['_id'])
        message['property_id'] = str(message['property_id'])
        messages_list.append(message)

    return make_response(jsonify(messages_list)), 200

@socketio.on('message')
def handle_message(data):
    property_id = data['property_id']
    sender = data['sender']
    receiver = data['receiver']
    msg = data['msg']

    try:
        property_obj_id = ObjectId(property_id)
    except bson.errors.InvalidId:
        emit('error', {'error': 'Invalid property_id'})
        return

    # Save the message to the database
    message = {
        'property_id': property_obj_id,
        'sender': sender,
        'receiver': receiver,
        'msg': msg,
        'timestamp': datetime.utcnow(),
        'read_receipt': False  # Add the read_receipt field
    }
    db.messages.insert_one(message)

    # Emit the message to the receiver
    emit('message', message, room=receiver)

@socketio.on('update_read_receipt')
def update_read_receipt(data):
    message_id = data['message_id']
    messages_collection.update_one({'_id': ObjectId(message_id)}, {'$set': {'read_receipt': True}})
    socketio.emit('read_receipt_updated', {'message_id': message_id})

if __name__ == '__main__':
    socketio.run(app, debug=True)