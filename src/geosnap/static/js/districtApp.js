var districtApp = angular.module('geoSnapAdmin')

districtApp.controller('districtListCtrl', function($scope, $http, $routeParams){
	$scope.districts = []
	$scope.distributors = []
	$scope.selected_distributor_id = $routeParams.distributor_id || '';
	$scope.selected_distributor_name = '';

	$scope.reloadDistrict = function(){
        $http.get('/api/districts?distributor_id=' + $scope.selected_distributor_id).success(function(d){
            $scope.districts = d
        }).error(function(e){
            alert(e)
        })
	}

	$http.get('/api/distributors').success(function(d){
        $scope.distributors = d
        if($scope.selected_distributor_id == ''){
            $scope.setDistributor(d[0]._id.$oid)
        }else{
            $scope.setDistributor($scope.selected_distributor_id)
        }
        //$scope.distributors.push({"_id":{"$oid":''}, 'name': 'All'})
    }).error(function(e){
        alert('Error while fetching distributors details')
        $location.path('/district')
    })

    $scope.setDistributor = function(id){
        $scope.selected_distributor_id = id
        $scope.selected_distributor_name = _.find($scope.distributors, {'_id': { '$oid': id }}).name
        $scope.reloadDistrict()
    }

    $scope.deleteDistrict = function(id){
		if(id && id != "-1"){
			$http.delete('/api/district/'+id).success(function(d){
	            $scope.reloadDistrict()
			}).error(function(e){
				alert(e)
				$scope.reloadDistrict()
			})
		}
		return false
	}

	$scope.getDistributorName = function(id){
	    var d =_.find($scope.distributors, {'_id': { '$oid': id }})
	    return d ? d.name : id
	}
})

districtApp.controller('districtDetailCtrl', function($scope, $routeParams, $location, $http, FileUploader){
    var id = $routeParams.id || -1
    $scope.distributor_id = $routeParams.distributor_id || ''
	$scope.model = { 'centers': [], 'distributor_id' : { '$oid': $scope.distributor_id } }
	$scope.current_center = ''

    $http.get('/api/district/' + id).success(function(d){
        if(!d._id || !d._id.$oid) {
            d._id = { "$oid": "-1" }
            d.distributor_id = { '$oid': $scope.distributor_id }
        }
        if(!d.centers) d.centers = []
        $scope.model = d
    }).error(function(e){
        alert('Error while fetching district details')
        $location.path('/district')
    })

    $scope.addCenter = function(){
        var item = $scope.current_center
        if(item && item.trim().length > 0){
            if(_.contains($scope.model.centers, item)) {
                alert('Already exists')
            }else{
                $scope.model.centers.push(item.trim())
            }
        }
    }

    $scope.removeCenter = function(item){
        if(_.contains($scope.model.centers, item)) {
            _.remove($scope.model.centers, function(x){
                return x === item
            })
        }
    }

    $scope.save = function(){
        if($scope.frmDistrict.$invalid){
            alert("Form contains invalid data\n\nPlease check the form and submit again")
            return
        }

        var item = angular.copy($scope.model)
        if(!item.distributor_id)
            item.distributor_id = $scope.distributor_id

        if(item._id.$oid == "-1"){
            item._id = null
            res = $http.post('/api/district/'+ '-1', item)
        }else{
            res = $http.put('/api/district/'+ item._id.$oid, item)
        }

        res.success(function(data){
               if(data.status == "success"){
                    var district_id = data.data._id.$oid.toString() || $scope.model._id.$oid.toString()
                    $location.path('/district')
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
