module.exports = function(app){

	app.controller('FreeIndexController', function($route,$scope, $data, $location, $history, batch, $rootScope){
		$scope.searchBox = false;
		$scope.box = true;
		$scope.content = false;
			
		if(!batch){
			$location.path("/error");
			return;
		}
			
		// import data
		$scope.batch = batch;
		
		if(batch.length == 0){
			$scope.searchBox = true;
			$scope.content = true;
		}
		
		$scope.jump = function(stateId){
			$rootScope.id = stateId;
			$location.path("/index") ;
		}
		
		$scope.onfocusFn = function(){
			$scope.searchBox = true;
			$scope.box = false;
		}
		
		$scope.onkeydown = function(e){
			var keycode = window.event?e.keyCode:e.which;
			if(keycode == 13){
				$rootScope.search = 'search=' + $('#cicle')[0].value;
				$location.path('/freeIndex');
				$route.reload();
			}
		}

		$scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
          //下面是在ng-repeat render完成后执行的js
          $('.Carousel').unslider({
				autoplay: true,
				dots: false,
				arrows: false,
			});
		});
		
	});
	
	app.directive('onFinishRenderFilters', function ($timeout) {
		return {
			restrict: 'A',
			link: function(scope, element, attr) {
				if (scope.$last === true) {
					$timeout(function() {
						scope.$emit('ngRepeatFinished');
					});
				}
			}
		};
	});



}