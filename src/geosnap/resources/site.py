from bson import ObjectId, json_util
from flask import g, request
from flask_login import login_required
from flask_restful import Resource
from geosnap import mongo
from geosnap.service.SiteService import SiteService


class SiteListApi(Resource):
    method_decorators = [login_required]

    def __init__(self):
        self.service = SiteService(mongo.db)

    def get(self):
        district_id = request.args.get('district_id', None)
        lst = self.service.search(district_id=district_id)
        return lst


class SiteApi(Resource):
    method_decorators = [login_required]

    def __init__(self):
        self.service = SiteService(mongo.db)

    def get(self, _id):
        if _id == "-1":
            return {}
        return self.service.get_by_id(_id)

    def put(self, _id):
        item = json_util.loads(request.data.decode('utf-8'))
        if item['district_id']:
            item['district_id'] = ObjectId(item['district_id'])
        try:
            self.service.save(item)
            return {"status": "success", "data": item}
        except Exception as e:
            print(e)
            return dict(status="error",
                        message="Oops! Error while trying to save site details! Please try again later")

    def post(self, _id):
        item = json_util.loads(request.data.decode('utf-8'))
        if item['district_id']:
            item['district_id'] = ObjectId(item['district_id'])
        try:
            _id = self.service.save(item)
            return {"status": "success", "location": "/api/site/" + str(_id), "data": item}
        except Exception as e:
            print(e)
            return dict(status="error",
                        message="Oops! Error while trying to save site details! Please try again later")

    def delete(self, _id):
        self.service.delete(_id)
        return None, 204
