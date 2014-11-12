from datetime import datetime
from bson import ObjectId


class DistributorService(object):
    def __init__(self, db):
        self.db = db
        self.distributors = db.distributor_collection

    def create(self, item):
        item.pop('_id', None)
        item['created_at'] = datetime.now()
        item['status'] = True
        return self.distributors.insert(item)

    def update(self, item):
        if item['_id'] is None:
            return
        item['updated_at'] = datetime.now()
        self.distributors.save(item)

    def get_by_id(self, _id):
        return self.distributors.find_one({'_id': ObjectId(_id)})

    def get_by_name(self, name):
        return [x for x in self.distributors.find({'name': name})]

    def search(self, tenant_id):
        query = {}
        if tenant_id:
            query['tenant_id'] = ObjectId(tenant_id)
        return [x for x in self.distributors.find(query)]

    def delete(self, _id):
        self.distributors.remove({'_id': ObjectId(_id)})
