var distributorApp = angular.module('geoSnapAdmin')

distributorApp.controller('distributorListCtrl', function($scope, $http, $routeParams){
	$scope.distributors = []

	$scope.reloadDistributor = function(){
        $http.get('/api/distributors').success(function(d){
            $scope.distributors = d
        }).error(function(e){
            alert(e)
        })
	}

	$scope.reloadDistributor()
    $scope.deleteDistributor = function(id){
		if(id && id != "-1"){
			$http.delete('/api/distributor/'+id).success(function(d){
	            $scope.reloadDistributor()
			}).error(function(e){
				alert(e)
				$scope.reloadDistributor()
			})
		}
		return false
	}
})

distributorApp.controller('distributorDetailCtrl', function($scope, $routeParams, $location, $http, FileUploader){
    var id = $routeParams.id || -1

	$scope.model = {}

    $http.get('/api/distributor/' + id).success(function(d){
        if(!d._id || !d._id.$oid)
            d._id = { "$oid": "-1" }
        $scope.model = d
    }).error(function(e){
        alert('Error while fetching distributor details')
        $location.path('/distributor')
    })

    $scope.save = function(){
        if($scope.frmDistributor.$invalid){
            alert("Form contains invalid data\n\nPlease check the form and submit again")
            return
        }

        var item = angular.copy($scope.model)

        if(item._id.$oid == "-1"){
            item._id = null
            res = $http.post('/api/distributor/'+ '-1', item)
        }else{
            res = $http.put('/api/distributor/'+ item._id.$oid, item)
        }

        res.success(function(data){
               if(data.status == "success"){
                    var distributor_id = data.data._id.$oid.toString() || $scope.model._id.$oid.toString()
                    $location.path('/distributor')
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
