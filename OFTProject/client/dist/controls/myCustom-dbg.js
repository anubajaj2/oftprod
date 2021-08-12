sap.ui.define([], function(){
	
	sap.ui.core.Control.extend("oft.fiori.controls.myCustom",{
		metadata: {
			properties: {
				"ninja": "",    //
				"turtle": "",  //color
				"stark": ""    //border
			},
			events: {},
			aggregation: {
				//"content": {}
			}
		},
		init: function(){},
		renderer: function(oRm, oControl){
			//oRm.write("<h1 style='color:" + oControl.getTurtle() + "'>" + oControl.getNinja() + "</h1>");
			oRm.write("<h1");
			oRm.addStyle("color", oControl.getTurtle());
			oRm.addStyle("border", oControl.getStark());
			oRm.writeStyles();
			oRm.write(">" + oControl.getNinja() + "</h1>");
			
		}
	});
	
});