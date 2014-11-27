from bson import json_util, ObjectId
from flask import request, session, g
from flask_login import login_required
from flask_restful import Resource
from geosnap import mongo, UserService
from geosnap.service.UserService import UserServiceException, DuplicateUserException


class UserListApi(Resource):
    method_decorators = [login_required]

    def __init__(self):
        self.service = UserService(mongo.db)

    def get(self):
        email = request.args.get('email', None)
        lst = self.service.search(email=email)
        return lst


class UserApi(Resource):
    method_decorators = [login_required]

    def __init__(self):
        self.service = UserService(mongo.db)

    def get(self, _id):
        if _id == "-1" or _id is None:
            return {}
        user = self.service.get_by_id(_id)

        if not 'distributors' in user:
            user['distributors'] = []

        return user

    def put(self, _id):
        item = json_util.loads(request.data.decode('utf-8'))
        item['username'] = item['email']
        try:
            self.service.update(item)
            return {"status": "success", "data": item}
        except DuplicateUserException as e:
            print(e)
            return {"status": "error", "message": "User email already exists."}
        except Exception as e:
            print(e)
            return dict(status="error",
                        message="Oops! Error while trying to save user details! Please try again later")

    def post(self, _id):
        item = json_util.loads(request.data.decode('utf-8'))
        item['username'] = item['email']
        item['registered_ip'] = request.remote_addr
        try:
            print(item)
            _id = self.service.create(item)
            return {"status": "success", "location": "/api/user/" + str(_id)}
        except DuplicateUserException as e:
            print(e)
            return {"status": "error", "message": "User email already exists."}
        except Exception as e:
            print(e)
            return dict(status="error",
                        message="Oops! Error while trying to save user details! Please try again later")

    def delete(self, _id):
        try:
            self.service.delete(_id)
        except UserServiceException as e:
            print(e)
            return dict(status="error", message=str(e)), 400
        return None, 204
