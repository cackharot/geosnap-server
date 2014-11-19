from datetime import datetime
from bson import ObjectId


class DistrictService(object):
    def __init__(self, db):
        self.db = db
        self.districts = db.district_collection

    def create(self, item):
        item.pop('_id', None)
        item['created_at'] = datetime.now()
        item['status'] = True
        return self.districts.insert(item)

    def update(self, item):
        if item['_id'] is None:
            return
        item['updated_at'] = datetime.now()
        self.districts.save(item)

    def get_by_id(self, _id):
        return self.districts.find_one({'_id': ObjectId(_id)})

    def get_by_name(self, name):
        return [x for x in self.districts.find({'name': name})]

    def search(self, distributor_ids=None):
        query = {}
        if distributor_ids:
            query['distributor_id'] = {"$in": [ObjectId(x) for x in distributor_ids]}
        return [x for x in self.districts.find(query)]

    def delete(self, _id):
        self.districts.remove({'_id': ObjectId(_id)})
