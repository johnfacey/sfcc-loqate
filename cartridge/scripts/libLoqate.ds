/**
* Builds and exposes the front-end javascript files for Loqate
*/
function Loqate() {
    var currentSite : dw.system.Site = dw.system.Site.getCurrent();
	
    this.LOQATE_ACCOUNT_CODE  = currentSite.getCustomPreferenceValue("loqateAccountCode");
    this.LOQATE_CUSTOM_CODE = currentSite.getCustomPreferenceValue("loqateCustomCode");
}

Loqate.prototype.getTag = function() : String {
	var tag : String = '';
	//Only push the tag if the user has filled out an Account Code
		
	if (this.LOQATE_ACCOUNT_CODE == null) {
		return tag;
	}
	
	if (this.LOQATE_ACCOUNT_CODE.length > 0) {
		tag += '<script>(function(n,t,i,r){var u,f;n[i]=n[i]||{},n[i].initial={accountCode:"';
		tag += this.LOQATE_ACCOUNT_CODE + '",host:"';
		tag += this.LOQATE_ACCOUNT_CODE + '.pcapredict.com"},n[i].on=n[i].on||function(){(n[i].onq=n[i].onq||[]).push(arguments)},u=t.createElement("script"),u.async=!0,u.src=r,f=t.getElementsByTagName("script")[0],f.parentNode.insertBefore(u,f)})(window,document,"pca","//';
		tag += this.LOQATE_ACCOUNT_CODE + '.pcapredict.com/js/sensor.js");';
		
		tag += 'pca.on("ready", function () {pca.sourceString = "LoqateDemandwareCartridge";});';
		
		tag += 'document.addEventListener("DOMContentLoaded", function(){var a = document.querySelector(".section-header-note.address-create.button");if (a) {a.addEventListener("click", function() {if(pca) { setTimeout(function(){ pca.load(); }, 500);}});}});</script>';
	}
	return tag;
}

Loqate.prototype.getCustomCode = function() : String {
	var code : String = '';
	
	if (this.LOQATE_CUSTOM_CODE == null) {
		return code; 
	}
	
	if (this.LOQATE_CUSTOM_CODE.length > 0) {
		code += '<script>';
		code += this.LOQATE_CUSTOM_CODE;
		code += '</script>';
	}
	
	return code; 
}

function execute( args : PipelineDictionary ) : Number
{

    // require scripts or system libs here 
    // var logger = require('dw/system/Logger');

    // read pipeline dictionary input parameter
    // ... = args.ExampleIn;

    // insert business logic here

    // write pipeline dictionary output parameter

    // args.ExampleOut = ...

   return PIPELET_NEXT;
}
