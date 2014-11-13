from bson import ObjectId, json_util
from flask import g, request
from flask_login import login_required
from flask_restful import Resource
from geosnap import mongo
from geosnap.service.DealerService import DealerService


class DealerListApi(Resource):
    method_decorators = [login_required]

    def __init__(self):
        self.service = DealerService(mongo.db)

    def get(self):
        district_id = request.args.get('district_id', None)
        lst = self.service.search(district_id=district_id)
        return lst

class DealerApi(Resource):
    method_decorators = [login_required]

    def __init__(self):
        self.service = DealerService(mongo.db)

    def get(self, _id):
        if _id == "-1":
            return {}
        return self.service.get_by_id(_id)

    def put(self, _id):
        item = json_util.loads(request.data.decode('utf-8'))
        if item['district_id']:
            item['district_id'] = ObjectId(item['district_id'])
        try:
            self.service.update(item)
            return {"status": "success", "data": item}
        except Exception as e:
            print(e)
            return dict(status="error",
                        message="Oops! Error while trying to save dealer details! Please try again later")

    def post(self, _id):
        item = json_util.loads(request.data.decode('utf-8'))
        if item['district_id']:
            item['district_id'] = ObjectId(item['district_id'])
        try:
            _id = self.service.create(item)
            return {"status": "success", "location": "/api/dealer/" + str(_id), "data": item}
        except Exception as e:
            print(e)
            return dict(status="error",
                        message="Oops! Error while trying to save dealer details! Please try again later")

    def delete(self, _id):
        item = self.service.get_by_id(_id)
        if item is None:
            return None, 404
        self.service.delete(_id)
        return None, 204
