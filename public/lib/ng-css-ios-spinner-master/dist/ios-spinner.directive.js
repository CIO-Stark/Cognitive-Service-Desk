(function() {
    'use strict';
	
	var app = angular.module('iosSpinner', []);

	app.directive('iosSpinner', iosSpinner);
    
    iosSpinner.$inject = [];
    
    function iosSpinner () {

		function link(scope, element, attrs) {
			
			attrs.width = attrs.width ? attrs.width.replace(/\D+/g, "") : '20';
			attrs.height = attrs.height ? attrs.height.replace(/\D+/g, "") : '20';

			element.css({
				width: attrs.width+'px',
				height: attrs.height+'px',
				position: 'relative',
				padding: '10px',
				display: 'inline-block'
			})
			
			attrs.color = attrs.color || '#FFF'

			for (var i = 1 ; i <= 12 ; i ++) {
				element.append('<div class="bar'+i+'" style="background-color:'+attrs.color+'"></div>')	
			}
			
		};	

		return {
			restrict: 'E',
			scope: false,
			link: link
		};

    };
	
})();