from bson import ObjectId, json_util
from flask import g, request
from flask_login import login_required
from flask_restful import Resource
from geosnap import mongo, UserService
from geosnap.service.DistributorService import DistributorService
from geosnap.service.DistrictService import DistrictService
from geosnap.service.DealerService import DealerService


class DistributorListApi(Resource):
    method_decorators = [login_required]

    def __init__(self):
        self.service = DistributorService(mongo.db)
        self.user_service = UserService(mongo.db)
        self.district_service = DistrictService(mongo.db)
        self.dealer_service = DealerService(mongo.db)

    def get(self):
        distributor_ids = []
        if g.user and not g.user.is_super_admin():
            user_id = g.user.get_id()
            user = self.user_service.get_by_id(user_id)
            distributor_ids = user['distributors']

        lst = self.service.search(ids=distributor_ids)
        load_all = bool(request.args.get('load_all', False))

        if load_all and lst is not None and len(lst) > 0:
            for item in lst:
                districts = item['districts'] = self.district_service.search(distributor_ids=[str(item['_id'])])
                if districts and len(districts):
                    for d in districts:
                        d['dealers'] = self.dealer_service.search(district_id=str(d['_id']))
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
