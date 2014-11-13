var siteApp = angular.module('geoSnapAdmin')

siteApp.controller('siteListCtrl', function($scope, $http, $routeParams){
	$scope.sites = []
	$scope.districts = []
	$scope.selected_district_id = $routeParams.district_id || '';
	$scope.selected_district_name = '';

	$scope.reloadSite = function(){
        $http.get('/api/sites?district_id=' + $scope.selected_district_id).success(function(d){
            $scope.sites = d
        }).error(function(e){
            alert(e)
        })
	}

	$http.get('/api/districts').success(function(d){
        $scope.districts = d
        if($scope.selected_district_id == ''){
            $scope.setDistrict(d[0]._id.$oid)
        }else{
            $scope.setDistrict($scope.selected_district_id)
        }
        $scope.districts.push({"_id":{"$oid":''}, 'name': 'All'})
    }).error(function(e){
        alert('Error while fetching districts details')
        $location.path('/site')
    })

    $scope.setDistrict = function(id){
        $scope.selected_district_id = id
        $scope.selected_district_name = _.find($scope.districts, {'_id': { '$oid': id }}).name
        $scope.reloadSite()
    }

    $scope.deleteSite = function(id){
		if(id && id != "-1"){
			$http.delete('/api/site/'+id).success(function(d){
	            $scope.reloadSite()
			}).error(function(e){
				alert(e)
				$scope.reloadSite()
			})
		}
		return false
	}

	$scope.getDistrictName = function(id){
	    var d =_.find($scope.districts, {'_id': { '$oid': id }})
	    return d ? d.name : id
	}
})

siteApp.controller('siteDetailCtrl', function($scope, $routeParams, $location, $http, FileUploader){
    var id = $routeParams.id || -1
    $scope.district_id = $routeParams.district_id || ''
	$scope.model = {}

    $http.get('/api/site/' + id).success(function(d){
        if(!d._id || !d._id.$oid)
            d._id = { "$oid": "-1" }
        $scope.model = d
    }).error(function(e){
        alert('Error while fetching site details')
        $location.path('/site')
    })

    $scope.save = function(){
        if($scope.frmSite.$invalid){
            alert("Form contains invalid data\n\nPlease check the form and submit again")
            return
        }

        var item = angular.copy($scope.model)
        if(!item.district_id)
            item.district_id = $scope.district_id

        if(item._id.$oid == "-1"){
            item._id = null
            res = $http.post('/api/site/'+ '-1', item)
        }else{
            res = $http.put('/api/site/'+ item._id.$oid, item)
        }

        res.success(function(data){
               if(data.status == "success"){
                    var site_id = data.data._id.$oid.toString() || $scope.model._id.$oid.toString()
                    $location.path('/site')
               }else{
                   alert(data.message)
               }
           })
           .error(function(e){
               alert(e)
               console.log(e)
           })
    }
})