var geoSnapAdmin = angular.module('geoSnapAdmin',['ngRoute', 'ngSanitize', 'ngCookies', 'checklist-model', 'fbFilters', 'angularFileUpload'])

var menuItems = []
menuItems.push({"title": "Main", "heading": true })
menuItems.push({"title": "User", "heading": false, "url": "/user", "icon": "fa fa-user", "templateUrl": '/static/templates/user/list.html', roles: ['super_admin']})
menuItems.push({"title": "Distributors", "heading": false, "url": "/distributor", "icon": "fa fa-users", "templateUrl": '/static/templates/distributor/list.html', roles: ['super_admin']})
menuItems.push({"title": "Districts", "heading": false, "url": "/district", "icon": "fa fa-building", "templateUrl": '/static/templates/district/list.html', roles: ['super_admin']})
menuItems.push({"title": "Dealers", "heading": false, "url": "/dealer", "icon": "fa fa-apple", "templateUrl": '/static/templates/dealer/list.html'})
menuItems.push({"title": "Sites", "heading": false, "url": "/site", "icon": "fa fa-apple", "templateUrl": '/static/templates/site/list.html'})

var custom_routes = []
custom_routes.push({"title": "Manage User", "heading": false, "url": "/user/:id", "templateUrl": '/static/templates/user/manage.html'})
custom_routes.push({"title": "Manage Distributor", "heading": false, "url": "/distributor/:id", "templateUrl": '/static/templates/distributor/manage.html'})
custom_routes.push({"title": "Manage District", "heading": false, "url": "/district/:id", "templateUrl": '/static/templates/district/manage.html'})
custom_routes.push({"title": "Manage Dealer", "heading": false, "url": "/dealer/:id", "templateUrl": '/static/templates/dealer/manage.html'})
custom_routes.push({"title": "Manage Site", "heading": false, "url": "/site/:id", "templateUrl": '/static/templates/site/manage.html'})

var isAccessible = function(roles){
    if(roles && roles.length > 0){
        var user_roles = window.app_user.roles || []
        var valid = true
        _.forEach(roles, function(x){
            valid = valid && _.contains(user_roles, x)
        })
        return valid
    }
    return true
}

geoSnapAdmin.config(['$routeProvider', function($routeProvider){
    var items = menuItems.concat(custom_routes)

	for(var i=0; i < items.length; ++i){
        var item = items[i]
        if(item.heading) continue
        if(!isAccessible(item.roles)) {
            continue
        }

        $routeProvider.when(item.url,{
        		action: item.templateUrl,
        		title : item.title
        	})
    }

	$routeProvider.otherwise({
		redirectTo: '/'
	})
}]).run(function($location, $rootScope, $route){
	$rootScope.pageTitle = function() {
	    var title = $route.current ? $route.current.title : null
	    return title || "GeoSnap :: Admin :: Home"
	}
    $rootScope.location = $location
	$rootScope.$on('$routeChangeSuccess', function( event, current, previous ){

    })
})


geoSnapAdmin.controller('mainCtrl', function($route, $scope, $http, $routeParams){
	$scope.app = {}
	$scope.app.login = { 'username': '', 'password': ''}
	$scope.app.show_login = false
	$scope.app.viewAnimation = true
	$scope.app.page = {}
	$scope.app.layout = {}
	$scope.app.user = window.app_user
	$scope.app.layout.isFixed = true
	$scope.app.layout.isCollapsed = false
	$scope.app.layout.top_nav_url = "static/templates/top-navbar.html"
	$scope.app.layout.aside_nav_url = "static/templates/aside-navbar.html"
	$scope.app.layout.content_url = ""
    $scope.menuItems = []

    $scope.updateMenus = function(){
        $scope.menuItems = _.filter(menuItems,function(item){ return isAccessible(item.roles); })
    }

    $scope.updateMenus()

	render = function($currentRoute){
	    var content_url = $route.current.action
	    $scope.app.layout.content_url = content_url
	}

	if(!$scope.app.user.name)
    {
        $scope.app.show_login = true
    }

	$scope.$on("$routeChangeSuccess", function( $currentRoute, $previousRoute ){
	    render($currentRoute)
    })

    $scope.doLogin = function() {
        if($scope.app.login.username && $scope.app.login.password){
            $http.post('/login', {'username': $scope.app.login.username, 'password': $scope.app.login.password})
            .success(function(data){
                $scope.app.user = data
                window.app_user = data
                $scope.updateMenus()
                $scope.app.show_login = false
                $location.path('/')
                //window.location.reload()
            })
            .error(function(e){
                alert(e)
            })
        }else{
            alert('Username and password are required!')
        }
    }

    $scope.doLogout = function(){
        $http.get('/logout')
        .success(function(data){
            $scope.app.user = {}
            $scope.app.login = { 'username': '', 'password': ''}
            $scope.app.show_login = true
        })
        .error(function(e){
            alert(e)
        })
    }
})
