var geoSnapAdmin = angular.module('geoSnapAdmin',['ngRoute', 'ngSanitize', 'ngCookies', 'checklist-model', 'fbFilters', 'angularFileUpload'])

var menuItems = []
menuItems.push({"title": "Main", "heading": true })
menuItems.push({"title": "User", "heading": false, "url": "/user", "icon": "fa fa-user", "templateUrl": '/static/templates/user/list.html'})
menuItems.push({"title": "Distributors", "heading": false, "url": "/distributor", "icon": "fa fa-users", "templateUrl": '/static/templates/distributor/list.html'})
menuItems.push({"title": "Districts", "heading": false, "url": "/district", "icon": "fa fa-building", "templateUrl": '/static/templates/district/list.html'})
menuItems.push({"title": "Dealers", "heading": false, "url": "/dealer", "icon": "fa fa-apple", "templateUrl": '/static/templates/dealer/list.html'})
menuItems.push({"title": "Sites", "heading": false, "url": "/site", "icon": "fa fa-apple", "templateUrl": '/static/templates/site/list.html'})

var custom_routes = []
custom_routes.push({"title": "Manage User", "heading": false, "url": "/user/:id", "templateUrl": '/static/templates/user/manage.html'})
custom_routes.push({"title": "Manage Distributor", "heading": false, "url": "/distributor/:id", "templateUrl": '/static/templates/distributor/manage.html'})
custom_routes.push({"title": "Manage District", "heading": false, "url": "/district/:id", "templateUrl": '/static/templates/district/manage.html'})
custom_routes.push({"title": "Manage Dealer", "heading": false, "url": "/dealer/:id", "templateUrl": '/static/templates/dealer/manage.html'})
custom_routes.push({"title": "Manage Site", "heading": false, "url": "/site/:id", "templateUrl": '/static/templates/site/manage.html'})

geoSnapAdmin.config(['$routeProvider', function($routeProvider){
    var items = menuItems.concat(custom_routes)

	for(var i=0; i < items.length; ++i){
        var item = items[i]
        if(item.heading) continue
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
	$scope.app.viewAnimation = true
	$scope.app.page = {}
	$scope.app.layout = {}
	$scope.app.user = window.app_user
	$scope.app.layout.isFixed = true
	$scope.app.layout.isCollapsed = false
	$scope.app.layout.top_nav_url = "static/templates/top-navbar.html"
	$scope.app.layout.aside_nav_url = "static/templates/aside-navbar.html"
	$scope.app.layout.content_url = ""
    $scope.menuItems = menuItems

	render = function($currentRoute){
	    var content_url = $route.current.action
	    $scope.app.layout.content_url = content_url
	}

	$scope.$on("$routeChangeSuccess", function( $currentRoute, $previousRoute ){
	    render($currentRoute)
    })
})
