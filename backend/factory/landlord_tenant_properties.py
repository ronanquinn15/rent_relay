from pymongo import MongoClient
import bcrypt, random
from faker import Faker

client = MongoClient('mongodb://localhost:27017/')
db = client.rentRelayDB
landlords_collection = db.landlords
tenants_collection = db.tenants
properties_collection = db.properties

fake = Faker()


def generate_landlord_data():
    existing_landlord = landlords_collection.find_one({'username': 'landlord'})
    if existing_landlord:
        return [existing_landlord]

    landlord_data = {
        'name': 'John Doe',
        'username': 'landlord',
        'email': 'landlord@example.com',
        'role': 'landlord',
        'password': bcrypt.hashpw(b"password", bcrypt.gensalt()),
    }
    landlords_collection.insert_one(landlord_data)
    return [landlord_data]


def generate_tenant_data(properties):
    tenant_array = []

    for property in properties:
        for _ in range(property['number_of_tenants']):
            property_id = property['_id']
            first_name = fake.first_name()
            last_name = fake.last_name()
            full_name =  f"{first_name} {last_name}"
            username = f"{first_name[0].lower()}{last_name.lower()}"
            email = f"{first_name.lower()}.{last_name.lower()}@example.com"

            tenant = {
                'name': full_name,
                'username': username,
                'email': email,
                'role': 'tenant',
                'password': bcrypt.hashpw(b"password", bcrypt.gensalt()),
                'property_id': property_id
            }
            tenants_collection.insert_one(tenant)
            tenant_array.append(tenant)
    return list(tenants_collection.find())


def generate_property_data(landlord):
    street_name = ['Ave', 'St', 'Rd', 'Dr']
    street_num = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth']
    towns = ['Belfast', 'Derry', 'Newry', 'Lisburn', 'Armagh', 'Enniskillen', 'Coleraine', 'Omagh', 'Dungannon',
             'Cookstown']
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    property_array = []

    for index in range(5):
        house_number = random.randint(1, 100)
        address = f"{house_number} {random.choice(street_num)} {random.choice(street_name)}"
        postcode = f"BT{random.randint(1, 90)} {random.randint(1, 9)}{random.choice(alphabet)}{random.choice(alphabet)}"
        city = random.choice(towns)
        number_of_bedrooms = random.randint(1, 5)
        number_of_bathrooms = random.randint(1, 2)
        rent = random.randint(500, 3000)
        purchase_date = random.randint(1990, 2021)
        landlord_id = landlord[0]['_id']
        number_tenants = 1
        prop = {
            'address': address,
            'postcode': postcode,
            'city': city,
            'number_of_bedrooms': number_of_bedrooms,
            'number_of_bathrooms': number_of_bathrooms,
            'rent': rent,
            'purchase_date': purchase_date,
            'number_of_tenants': number_tenants,
            'landlord_id': landlord_id,
        }
        properties_collection.insert_one(prop)
        property_array.append(prop)
    return list(properties_collection.find())


def generate_tenant_in_property_data(properties, tenants):
    for i in range(min(len(properties), len(tenants))):
        tenant = tenants[i]
        property = properties[i]
        properties_collection.update_one({'_id': property['_id']}, {'$set': {'tenant_id': tenant['_id']}})


# Generating Landlord Data
landlord = generate_landlord_data()

# Generating Property Data
properties = generate_property_data(landlord)

# Generating Tenant Data
tenants = generate_tenant_data(properties)

# Populating properties with tenant_ids
generate_tenant_in_property_data(properties, tenants)
