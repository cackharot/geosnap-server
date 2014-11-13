from datetime import datetime
from bson import ObjectId


class SiteService(object):
    def __init__(self, db):
        self.db = db
        self.sites = self.db.site_collection

    def search(self, district_id=None):
        query = {}
        if district_id:
            query["district_id"] = ObjectId(district_id)
        return [x for x in self.sites.find(query)]

    def save(self, store_item):
        if '_id' not in store_item or store_item['_id'] is None or store_item['_id'] == "-1":
            store_item.pop('_id', None)
            store_item['created_at'] = datetime.now()
            store_item['status'] = True
        else:
            store_item['updated_at'] = datetime.now()
        return self.sites.save(store_item)

    def get_by_name(self, name):
        return self.sites.find_one({'name': name})

    def delete(self, _id):
        item = self.sites.find_one({'_id': ObjectId(_id)})
        if item:
            self.sites.remove(item)
            return True
        return False

    def check_duplicate_name(self, name, _id):
        query = {'name': name}
        if _id:
            query['_id'] = {"$ne": ObjectId(_id)}
        return self.sites.find(query).count() > 0

    def get_by_id(self, _id):
        return self.sites.find_one({'_id': ObjectId(_id)})
