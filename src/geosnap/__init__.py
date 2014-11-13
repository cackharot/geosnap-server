from flask import Flask, session, render_template, make_response, request, redirect, g
from flask_login import LoginManager, login_user, login_required, logout_user
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

login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def _login(user_id):
    user = get_user(user_id)
    setattr(g, 'user', user)
    return user


class User(object):
    def __init__(self, user_id='', name='', email='', roles=[]):
        if not roles:
            roles = []
        self.user_id = user_id
        self.name = name
        self.email = email
        self.roles = roles

    def is_authenticated(self):
        return self.user_id is not None

    def is_active(self):
        return self.is_authenticated()

    def is_anonymous(self):
        return False

    def get_id(self):
        return self.user_id


@app.before_request
def set_user_on_request_g():
    if 'user_id' not in session:
        setattr(g, 'user', User())
        return
    elif getattr(g,'user', None) is None:
        _login(session['user_id'])


def get_user(_id):
    service = UserService(mongo.db)
    user = service.get_by_id(_id)
    return User(str(user['_id']), user['name'], user['email'], user['roles'])


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


@app.route('/login', methods=["POST"])
def login():
    username = request.json['username']
    password = request.json['password']
    if username and password:
        service = UserService(mongo.db)
        if service.validate_user(username, password):
            user = service.get_by_email(username)
            login_user(
                User(str(user['_id']), user['name'], user['email'], user['roles']))
            return json.dumps({'id': str(user['_id']), 'name': user['name'], 'status': user['status']})
    return "Invalid credentials", 400


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return '', 200


@app.route("/recreatedb")
def recreate_db():
    print('Dropping database(' + app.config['MONGO_DBNAME'] + ')....\n')
    c = Connection()
    c.drop_database(app.config['MONGO_DBNAME'])
    return redirect('/')


from geosnap.resources.user import UserApi, UserListApi
from geosnap.resources.distributor import DistributorListApi, DistributorApi
from geosnap.resources.district import DistrictApi, DistrictListApi
from geosnap.resources.dealer import DealerApi, DealerListApi
from geosnap.resources.site import SiteApi, SiteListApi

api.add_resource(UserApi, '/api/user/<string:_id>')
api.add_resource(UserListApi, '/api/users')

api.add_resource(DistributorApi, '/api/distributor/<string:_id>')
api.add_resource(DistributorListApi, '/api/distributors')

api.add_resource(DistrictApi, '/api/district/<string:_id>')
api.add_resource(DistrictListApi, '/api/districts')

api.add_resource(DealerApi, '/api/dealer/<string:_id>')
api.add_resource(DealerListApi, '/api/dealers')

api.add_resource(SiteApi, '/api/site/<string:_id>')
api.add_resource(SiteListApi, '/api/sites')
