var districtApp = angular.module('geoSnapAdmin')

districtApp.controller('districtListCtrl', function($scope, $http, $routeParams){
	$scope.districts = []

	$scope.reloadDistrict = function(){
        $http.get('/api/districts').success(function(d){
            $scope.districts = d
        }).error(function(e){
            alert(e)
        })
	}

	$scope.reloadDistrict()
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
})

districtApp.controller('districtDetailCtrl', function($scope, $routeParams, $location, $http, FileUploader){
    var id = $routeParams.id || -1

	$scope.model = {}

    $http.get('/api/district/' + id).success(function(d){
        if(!d._id || !d._id.$oid)
            d._id = { "$oid": "-1" }
        $scope.model = d
    }).error(function(e){
        alert('Error while fetching district details')
        $location.path('/district')
    })

    $scope.save = function(){
        if($scope.frmDistrict.$invalid){
            alert("Form contains invalid data\n\nPlease check the form and submit again")
            return
        }

        var item = angular.copy($scope.model)

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
