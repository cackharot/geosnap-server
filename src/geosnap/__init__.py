from flask import Flask, session, render_template, make_response, request, redirect, g
from flask_pymongo import PyMongo
from flask_restful import Api
from pymongo import Connection
from bson import json_util
import json
from geosnap.service.UserService import UserService

app = Flask(__name__, instance_relative_config=False)
app.config.from_pyfile('geosnap.cfg', silent=False)

mongo = PyMongo(app)

api = Api(app)


def _logout(sender, user=None):
    if request and 'user_id' in session:
        session.pop('user_id')
        session.pop('name')
        session.pop('email')
        session.pop('roles')
    pass


def _login(sender, user=None):
    if request and 'openid' in session:
        user = get_user(session['openid'])
        session['user_id'] = str(user['_id'])
        session['tenant_id'] = str(user['tenant_id'])
        session['name'] = user['name']
        session['email'] = user['email']
        session['roles'] = user.get('roles', ['member'])


class User(object):
    def __init__(self, user_id=None, tenant_id=None, name=None, email=None, roles=None, user_tenant_id=None,
                 identity=None):
        if not roles:
            roles = []
        self.user_id = user_id
        self.tenant_id = tenant_id
        self.name = name
        self.email = email
        self.roles = roles
        self.user_tenant_id = user_tenant_id
        self.identity = identity


@app.before_request
def set_user_on_request_g():
    if 'user_id' not in session:
        return
    setattr(g, 'user',
            User(session['user_id'], session['tenant_id'], session['name'], session['email'], session['roles'],
                 session.get('user_tenant_id', None), session.get('identity', None)))


def get_user(item):
    service = UserService(mongo.db)
    user = service.get_by_email(item['email'])
    return user


@api.representation('application/json')
def mjson(data, code, headers=None):
    d = json.dumps(data, default=json_util.default)
    resp = make_response(d, code)
    resp.headers.extend(headers or {})
    return resp


@app.route("/")
def index():
    name = session.get('name', None)
    return render_template('index.jinja2', name=name)


@app.route("/recreatedb")
def recreate_db():
    print('Dropping database(' + app.config['MONGO_DBNAME'] + ')....\n')
    c = Connection()
    c.drop_database(app.config['MONGO_DBNAME'])
    return redirect('/')


from geosnap.resources.user import UserApi, UserListApi

api.add_resource(UserApi, '/api/user/<string:_id>')
api.add_resource(UserListApi, '/api/users')
