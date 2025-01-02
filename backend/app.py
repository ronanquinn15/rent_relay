from flask import Flask
from flask_cors import CORS
from blueprints.auth.auth import auth_bp
from blueprints.landlord.landlord import landlord_bp
from blueprints.properties.properties import properties_bp
from blueprints.tenants.tenants import tenants_bp

app = Flask(__name__)
#CORS(app)
app.register_blueprint(auth_bp)
app.register_blueprint(landlord_bp)
app.register_blueprint(properties_bp)
app.register_blueprint(tenants_bp)

if __name__ == '__main__':
    app.run(debug=True)