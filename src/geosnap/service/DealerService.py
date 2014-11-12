from datetime import datetime
from bson import ObjectId


class DealerService(object):
    def __init__(self, db):
        self.db = db
        self.dealers = db.dealer_collection

    def create(self, item):
        item.pop('_id', None)
        item['created_at'] = datetime.now()
        item['status'] = True
        return self.dealers.insert(item)

    def update(self, item):
        if item['_id'] is None:
            return
        item['updated_at'] = datetime.now()
        self.dealers.save(item)

    def get_by_id(self, _id):
        return self.dealers.find_one({'_id': ObjectId(_id)})

    def get_by_name(self, name):
        return [x for x in self.dealers.find({'name': name})]

    def search(self, tenant_id=None,district_id=None):
        query = {}
        if tenant_id:
            query['tenant_id'] = ObjectId(tenant_id)
        if district_id:
            query['district_id'] = ObjectId(district_id)
        return [x for x in self.dealers.find(query)]

    def delete(self, _id):
        self.dealers.remove({'_id': ObjectId(_id)})
