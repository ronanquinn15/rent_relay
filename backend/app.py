from flask import Flask, render_template, jsonify, make_response
from flask_cors import CORS
import bson
from flask_socketio import SocketIO, Namespace, emit, join_room, leave_room
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

class ChatNamespace(Namespace):
    def on_join(self, data):
        room = data['property_id']
        join_room(room)
        emit('status', {'msg': f'{data["user"]} has entered the room.'}, room=room)

    def on_leave(self, data):
        room = data['property_id']
        leave_room(room)
        emit('status', {'msg': f'{data["user"]} has left the room.'}, room=room)

    def on_message(self, data):
        room = data['property_id']
        message = {
            'room': room,
            'sender': data['sender'],
            'receiver': data['receiver'],
            'msg': data['msg'],
            'timestamp': datetime.utcnow(),
            'read_receipt': False
        }
        messages_collection.insert_one(message)
        emit('message', message, room=room)

socketio.on_namespace(ChatNamespace('/chat'))

@app.route('/')
def index():
    return render_template('index.html')

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

@app.route('/messages/read/<message_id>', methods=['POST'])
def mark_message_as_read(message_id):
    messages_collection.update_one({'_id': ObjectId(message_id)}, {'$set': {'read_receipt': True}})
    return jsonify({'status': 'success'})


@socketio.on('message')
def handle_message(data):
    property_id = data['property_id']
    sender = data['sender']
    receiver = data['receiver']
    msg = data['msg']

    # Save the message to the database
    message = {
        'property_id': property_id,
        'sender': sender,
        'receiver': receiver,
        'msg': msg,
        'timestamp': datetime.utcnow()
    }
    db.messages.insert_one(message)

    # Emit the message to the receiver
    emit('message', message, room=receiver)

if __name__ == '__main__':
    socketio.run(app, debug=True)