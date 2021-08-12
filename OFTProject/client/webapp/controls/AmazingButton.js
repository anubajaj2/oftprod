sap.ui.define([], function(){
	
	sap.m.Button.extend("oft.fiori.controls.AmazingButton",{
		metadata: {
			properties: {
			},
			events: {
				"anubhav": {}
			}
		},
		init: function(){},
		renderer: {},
		onmouseover: function(){
			this.fireAnubhav();
		}
	});
	
});