var dealerApp = angular.module('geoSnapAdmin')

dealerApp.controller('dealerListCtrl', function($scope, $http, $routeParams){
	$scope.dealers = []
	$scope.districts = []
	$scope.selected_district_id = $routeParams.district_id || '';
	$scope.selected_district_name = '';

	$scope.reloadDealer = function(){
        $http.get('/api/dealers?district_id=' + $scope.selected_district_id).success(function(d){
            $scope.dealers = d
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
        //$scope.districts.push({"_id":{"$oid":''}, 'name': 'All'})
    }).error(function(e){
        alert('Error while fetching districts details')
        $location.path('/dealer')
    })

    $scope.setDistrict = function(id){
        $scope.selected_district_id = id
        $scope.selected_district_name = _.find($scope.districts, {'_id': { '$oid': id }}).name
        $scope.reloadDealer()
    }

    $scope.deleteDealer = function(id){
		if(id && id != "-1"){
			$http.delete('/api/dealer/'+id).success(function(d){
	            $scope.reloadDealer()
			}).error(function(e){
				alert(e)
				$scope.reloadDealer()
			})
		}
		return false
	}

	$scope.getDistrictName = function(id){
	    var d =_.find($scope.districts, {'_id': { '$oid': id }})
	    return d ? d.name : id
	}
})

dealerApp.controller('dealerDetailCtrl', function($scope, $routeParams, $location, $http, FileUploader){
    var id = $routeParams.id || -1
    $scope.district_id = $routeParams.district_id || ''
	$scope.model = { 'district_id': { '$oid': $scope.district_id }}
	$scope.consumption_centers = []

	$http.get('/api/district/' + $scope.district_id).success(function(d){
	    $scope.consumption_centers = d.centers || []
	})

    $http.get('/api/dealer/' + id).success(function(d){
        if(!d._id || !d._id.$oid) {
            d._id = { "$oid": "-1" }
            d.district_id = { '$oid': $scope.district_id }
         }
        $scope.model = d
    }).error(function(e){
        alert('Error while fetching dealer details')
        $location.path('/dealer')
    })

    $scope.save = function(){
        if($scope.frmDealer.$invalid){
            alert("Form contains invalid data\n\nPlease check the form and submit again")
            return
        }

        var item = angular.copy($scope.model)
        if(!item.district_id)
            item.district_id = $scope.district_id

        if(item._id.$oid == "-1"){
            item._id = null
            res = $http.post('/api/dealer/'+ '-1', item)
        }else{
            res = $http.put('/api/dealer/'+ item._id.$oid, item)
        }

        res.success(function(data){
               if(data.status == "success"){
                    var dealer_id = data.data._id.$oid.toString() || $scope.model._id.$oid.toString()
                    $location.path('/dealer')
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
