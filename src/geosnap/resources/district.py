from bson import ObjectId, json_util
from flask import g, request
from flask_restful import Resource
from geosnap import mongo
from geosnap.service.DistrictService import DistrictService


class DistrictListApi(Resource):
    def __init__(self):
        self.service = DistrictService(mongo.db)

    def get(self):
        lst = self.service.search(tenant_id=g.user.tenant_id)
        return lst

class DistrictApi(Resource):
    def __init__(self):
        self.service = DistrictService(mongo.db)

    def get(self, _id):
        if _id == "-1":
            return {}
        return self.service.get_by_id(_id)

    def put(self, _id):
        item = json_util.loads(request.data.decode('utf-8'))
        tenant_id = g.user.tenant_id
        item['tenant_id'] = ObjectId(tenant_id)
        try:
            self.service.update(item)
            return {"status": "success", "data": item}
        except Exception as e:
            print(e)
            return dict(status="error",
                        message="Oops! Error while trying to save distributor details! Please try again later")

    def post(self, _id):
        item = json_util.loads(request.data.decode('utf-8'))
        tenant_id = g.user.tenant_id
        item['tenant_id'] = ObjectId(tenant_id)
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
