from datetime import datetime
import random
import string
from bson import ObjectId


class DuplicateUserException(Exception):
    def __init__(self, message='User name/email already exits'):
        Exception.__init__(self, message)

    pass


class UserServiceException(Exception):
    def __init__(self, message=None):
        Exception.__init__(self, message)

    @classmethod
    def cannot_delete_super_admin(cls):
        return UserServiceException("Cannot delete super admin user!")


class UserService(object):
    def __init__(self, db):
        self.db = db
        self.users = self.db.user_collection

    def generate_api_key(self):
        s = string.ascii_letters + string.digits
        return ''.join(random.sample(s, 20))

    def create(self, item):
        if self.user_exists(item['email']):
            raise DuplicateUserException()
        item.pop('_id', None)
        item['created_at'] = datetime.now()
        item['status'] = True
        if 'api_key' not in item:
            item['api_key'] = self.generate_api_key()
        if 'roles' not in item or item['roles'] is None or len(item['roles']) == 0:
            item['roles'] = ['member']
        return self.users.insert(item)

    def get_by_email(self, email):
        return self.users.find_one({"email": email})

    def validate_user(self, username, password):
        query = {'email': username, 'password': password}
        return self.users.find(query).count() > 0

    def search(self, email=None):
        query = {}
        if email is not None:
            query['email'] = email
        return [x for x in self.users.find(query)]

    def delete(self, id):
        item = self.get_by_id(id)

        if item and 'roles' in item and item['roles'] is not None and 'super_admin' in item['roles']:
            raise UserServiceException.cannot_delete_super_admin()

        return self.users.remove({"_id": ObjectId(id)})

    def get_by_id(self, id):
        return self.users.find_one({"_id": ObjectId(id)})

    def get_by_api_key(self, api_key):
        return self.users.find_one({"api_key": api_key})

    def update(self, item):
        if item['_id'] is None:
            return item
        if self.user_exists(item['email'], str(item['_id'])):
            raise DuplicateUserException()

        item['updated_at'] = datetime.now()
        self.users.save(item)
        return item

    def user_exists(self, email, id=None):
        query = {}
        if id is not None:
            query = {"_id": {"$ne": ObjectId(id)}}
        query['email'] = email
        return self.users.find(query).count() > 0
