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
        //$scope.districts.push({"_id":{"$oid":''}, 'name': 'All'})
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
	$scope.model = { 'district_id': { '$oid': $scope.district_id }, 'photos': []}
    $scope.consumption_centers = []

    var uploader = $scope.uploader = new FileUploader()
    uploader.url = '/upload_site_images'

    uploader.filters.push({
        name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    uploader.onSuccessItem  = function(item, response, status, headers) {
        $scope.model.photos.push(response.filename)
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers)
    };

    uploader.onCompleteAll = function(){
        $scope.saveInternal()
    }

    if($scope.district_id){
        $http.get('/api/district/' + $scope.district_id).success(function(d){
            $scope.consumption_centers = d.centers || []
        })
    }else{
        $scope.consumption_centers = []
    }

    $http.get('/api/site/' + id).success(function(d){
        if(!d._id || !d._id.$oid) {
            d._id = { "$oid": "-1" }
            d.district_id = { '$oid': $scope.district_id }
        }
        if(!d.photos) d.photos = []
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

        if(uploader.queue.length > 0){
            uploader.uploadAll()
        }else{
            $scope.saveInternal()
        }
    }

    $scope.saveInternal = function() {
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

    $scope.locateFromMap = function(){
        mapWindow = mapWindow || window.open('/static/templates/site/gmap.html');
        mapWindow.onload = function() {
            mapWindow.onunload  = function(e){
                mapWindow = null
            }
        }
    }
})

var mapWindow = null;

function initialize() {
  var mapOptions = {
    zoom: 4,
    center: new google.maps.LatLng(-25.363882, 131.044922)
  };

  mapWindow = mapWindow || window.open('');

  var canvas = mapWindow.document.getElementById('map-canvas');

  if(!canvas){
    mapWindow.document.write('');
    canvas = mapWindow.document.getElementById('map-canvas');
  }

  var map = new google.maps.Map(canvas,mapOptions);

  var marker = new google.maps.Marker({
    position: map.getCenter(),
    map: map,
    title: 'Click to zoom'
  });

  google.maps.event.addListener(map, 'center_changed', function() {
    // 3 seconds after the center of the map has changed, pan back to the
    // marker.
    window.setTimeout(function() {
      map.panTo(marker.getPosition());
    }, 3000);
  });

  google.maps.event.addListener(marker, 'click', function(e) {
    map.setZoom(8);
    map.setCenter(marker.getPosition());
    console.log(e);
  });
}
// google.maps.event.addDomListener(window, 'load', initialize);

