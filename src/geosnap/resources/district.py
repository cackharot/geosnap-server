from bson import ObjectId, json_util
from flask import g, request
from flask_login import login_required
from flask_restful import Resource
from geosnap import mongo, UserService
from geosnap.service.DistrictService import DistrictService


class DistrictListApi(Resource):
    method_decorators = [login_required]

    def __init__(self):
        self.service = DistrictService(mongo.db)
        self.user_service = UserService(mongo.db)

    def get(self):
        distributor_ids = []
        distributor_id = request.args.get('distributor_id', None)
        if distributor_id:
            distributor_ids.append(distributor_id)

        if not g.user.is_super_admin():
            user = self.user_service.get_by_id(g.user.get_id())
            if 'distributors' in user and not (distributor_id and distributor_id in user['distributors']):
                distributor_ids = user['distributors']

        lst = self.service.search(distributor_ids=distributor_ids)
        return lst

class DistrictApi(Resource):
    method_decorators = [login_required]

    def __init__(self):
        self.service = DistrictService(mongo.db)

    def get(self, _id):
        if _id == "-1":
            return {}
        return self.service.get_by_id(_id)

    def put(self, _id):
        item = json_util.loads(request.data.decode('utf-8'))
        if item['distributor_id']:
            item['distributor_id'] = ObjectId(item['distributor_id'])
        try:
            self.service.update(item)
            return {"status": "success", "data": item}
        except Exception as e:
            print(e)
            return dict(status="error",
                        message="Oops! Error while trying to save district details! Please try again later")

    def post(self, _id):
        item = json_util.loads(request.data.decode('utf-8'))
        if item['distributor_id']:
            item['distributor_id'] = ObjectId(item['distributor_id'])
        try:
            _id = self.service.create(item)
            return {"status": "success", "location": "/api/district/" + str(_id), "data": item}
        except Exception as e:
            print(e)
            return dict(status="error",
                        message="Oops! Error while trying to save district details! Please try again later")

    def delete(self, _id):
        item = self.service.get_by_id(_id)
        if item is None:
            return None, 404
        self.service.delete(_id)
        return None, 204
