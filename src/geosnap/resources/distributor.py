from bson import ObjectId, json_util
from flask import g, request
from flask_login import login_required
from flask_restful import Resource
from geosnap import mongo, UserService
from geosnap.service.DistributorService import DistributorService


class DistributorListApi(Resource):
    method_decorators = [login_required]

    def __init__(self):
        self.service = DistributorService(mongo.db)
        self.user_service = UserService(mongo.db)

    def get(self):
        distributor_ids = []
        if not g.user.is_super_admin():
            user = self.user_service.get_by_id(g.user.get_id())
            distributor_ids = user['distributors']

        lst = self.service.search(ids=distributor_ids)
        return lst

class DistributorApi(Resource):
    method_decorators = [login_required]

    def __init__(self):
        self.service = DistributorService(mongo.db)

    def get(self, _id):
        if _id == "-1":
            return {}
        return self.service.get_by_id(_id)

    def put(self, _id):
        item = json_util.loads(request.data.decode('utf-8'))
        try:
            self.service.update(item)
            return {"status": "success", "data": item}
        except Exception as e:
            print(e)
            return dict(status="error",
                        message="Oops! Error while trying to save distributor details! Please try again later")

    def post(self, _id):
        item = json_util.loads(request.data.decode('utf-8'))
        try:
            _id = self.service.create(item)
            return {"status": "success", "location": "/api/distributor/" + str(_id), "data": item}
        except Exception as e:
            print(e)
            return dict(status="error",
                        message="Oops! Error while trying to save distributor details! Please try again later")

    def delete(self, _id):
        item = self.service.get_by_id(_id)
        if item is None:
            return None, 404
        self.service.delete(_id)
        return None, 204
