
'use strict';

var loqateAddressMatch = "";
var loqateSelector = "";
var AVCScore = 0;
var AVCCode = "";
var AVCCountry = "";
var realAddress = "";


function loqateResult(type) {

	//var addressDialog = document.getElementById('addressDialog');
	if (AVCCode.startsWith("V3") ||
		AVCCode.startsWith("V4") ||
		AVCCode.startsWith("V5") ||
		AVCCode.startsWith("P2") ||
		AVCCode.startsWith("P3") ||
		AVCCode.startsWith("P4") ||
		AVCCode.startsWith("P5"))	{
		if (AVCScore >= 95 ) { 
			if(type == 'shipping') {
				triggerShippingFormSubmit();
				$('#shipping-submit-suggested').trigger('click');
			} else if(type == 'profile') {
				triggerAccountFormSubmit();
				$('#account-submit-suggested').trigger('click');
			}
		}

		if (AVCScore > 60 && AVCScore < 95) {
			jQuery("#rbOrigAddress").prop('disabled',false);
			$('#confirmAddress').attr('data-formtype',type); 
			$("#addressDialog").dialog('open');
			return false;
		}

		if (AVCScore < 60) {  
			var addressDialogInvalid = document.getElementById('addressDialogInvalid');
			$("#addressDialogInvalid").dialog('open');
			return false;
		}
		
	} else {
		var addressDialogInvalid = document.getElementById('addressDialogInvalid');
		$("#addressDialogInvalid").dialog('open');
		return false;
	}

	if (AVCScore < 60 ) {
		var addressDialogInvalid = document.getElementById('addressDialogInvalid');
		$("#addressDialogInvalid").dialog('open');
		return false;
	}

	/*
	if (AVCScore >= 95) {
		return true;
	}
	if (AVCScore > 79 && AVCScore < 95) {
		jQuery("#rbOrigAddress").prop('disabled',false);
		addressDialog.showModal();
		return false;
	}
	if (AVCScore < 80) {
		var addressDialogInvalid = document.getElementById('addressDialogInvalid');
		addressDialogInvalid.showModal();
		return false;
	}
	*/
}

function loqate(type) {

	var selector = "";
	
	if (type == "shipping"){
        selector = "singleshipping_shippingAddress_addressFields";
	} else if (type == "profile"){
        selector = "profile_address";
	}

    loqateSelector = selector;

	var country = $("#dwfrm_"+selector+"_country").val();
	var address1 = $("#dwfrm_"+selector+"_address1").val()
	var address2 = $("#dwfrm_"+selector+"_address2").val()
	var city = $("#dwfrm_"+selector+"_city").val();
	if(country == 'US') {
		var state = $("#dwfrm_"+selector+"_states_state").val();
	} else if(country == 'CA') {
		var state = $("#dwfrm_"+selector+"_statesCA_stateCA").val();
	} else {
		var state = $("#dwfrm_"+selector+"_statesOther_stateOther").val();
	}
	var postal = $("#dwfrm_"+selector+"_postal").val();
	AVCCountry = country;

	var isLatin = true;
	var rforeign = /[^\u0000-\u007f]/;

	if (rforeign.test(address1)) { isLatin = false; }

	if (rforeign.test(address2)) { isLatin = false; }

	if (rforeign.test(city)) { isLatin = false; }

	var loqateAddress = {
		"country": country ? country : "",
		"address1" : address1 ? address1 : "",
		"address2" : address2 ? address2 : "",
		"city" : city ? city : "",
		"state"  : state ? state : "",
		"postal": postal ? postal : ""
	};
	realAddress = loqateAddress;
	loqateAddress = JSON.stringify(loqateAddress);

	jQuery.ajax({
			url : Urls.loqateVerify,
			async: false,
			type: "POST",
			dataType: "json",
			data: {
				"loqateAddress":loqateAddress,
				"isLatin": isLatin
			},
			success: function( data ){  

				//var addressDialog = document.getElementById('addressDialog');
				var originalAddress = data[0].Input;
				var correctedAddress = data[0].Matches[0];

				loqateAddressMatch = data[0].Matches[0];

				document.querySelector("#originalAddress").innerHTML = originalAddress.Address1+"<br />"
				+ originalAddress.Address2+"<br />"
				+ originalAddress.Locality+" " + originalAddress.AdministrativeArea+" " + originalAddress.PostalCode+"<br />"
				+ originalAddress.Country+"<br />";
				var ResidentialDelivery = correctedAddress.ResidentialDelivery;
				jQuery("#dwfrm_singleshipping_shippingAddress_addressFields_ResidentialDelivery").val(ResidentialDelivery);
				var address2 = correctedAddress.SubBuilding ? correctedAddress.SubBuilding : "";
				var address1 = "";
				console.log(address2)
				if (address2 == "") {
					address1 = correctedAddress.Address1;
				} else {
					if (AVCCountry == "CA") {
						address1 = correctedAddress.Address1
					} else {
						address1 = correctedAddress.Address1.split(address2)[0].trim();
					}
				}
				
				document.querySelector("#correctedAddress").innerHTML = address1+"<br />"
				+ address2+"<br />" 
				+ correctedAddress.Locality+" "	+ correctedAddress.AdministrativeArea+" "+ correctedAddress.PostalCode+"<br />"
				+ correctedAddress.Country+"<br />";
				
				AVCScore = parseInt(data[0].Matches[0].AVC.toString().split("-")[3]);
				AVCCode = data[0].Matches[0].AVC.toString().split("-")[0];
				console.log("Loqate AVCCode: " + AVCCode);
				console.log("Loqate AVCScore: " + AVCScore);
			} 
		});
}
var loqateLoaded = false;

var initEvents = function () {
	loqateLoaded = true;
	$("#closeLoqate").click(function (e) {
		$("#addressDialogInvalid").dialog('close');
		return false;
	});

	$("#addressDialog").dialog({
		autoOpen: false,
		modal: true,
		responsive: true,
		width: "65%",
	});

	$("#addressDialogInvalid").dialog({
		autoOpen: false,
		modal: true,
		responsive: true,
		width: "65%",
	});

	
	$("#dwfrm_singleshipping_shippingAddress_addressFields_ResidentialDelivery").hide();

	if ($('#dwfrm_singleshipping_shippingAddress').length == 1) {
		$('.address').on('change',
	            'input[name$="_addressFields_address1"], input[name$="_addressFields_address2"], select[name$="_addressFields_states_state"], input[name$="_addressFields_city"], input[name$="_addressFields_postal"]',
	            resetAVSValidation
	    );
		$('#dwfrm_singleshipping_shippingAddress_addressFields_loqateAVSValidated').parent().parent().parent().hide();
		$('#shipping-submit-main').on('click', function (e) {
	        var validated = $('#dwfrm_singleshipping_shippingAddress_addressFields_loqateAVSValidated').val();
	        var countryCode = $('#dwfrm_singleshipping_shippingAddress_addressFields_country').val();
	        e.preventDefault();
	        if (validated == 'true' || countryCode =='CN') {
	            $('#shipping-submit-suggested').trigger('click');
	        } else {
	        	loqate("shipping");
				return loqateResult("shipping");
	        }
	    });
	}
	
	if ($('#edit-address-form').length == 1 || $('#RegistrationAddressForm').length == 1 || $('#RegistrationForm').length == 1) {
	    $('#edit-address-form,#RegistrationAddressForm,#RegistrationForm').on('change',
	            'input[name$="_address_address1"], input[name$="_address_address2"], select[name$="_address_states_state"], input[name$="_address_city"], input[name$="_address_postal"]',
	            updateAccountAddrressAVSFields
	    );
	    $('input[name$="_loqateAVSValidated"]').parent().parent().parent().hide();
	    
		$('#account-submit-main').on('click', function (e) {
	        var validated = $('input[name$="_loqateAVSValidated"]').val();
	        var countryCode = $('#dwfrm_profile_address_country').val();
	        e.preventDefault();
	        if (validated == 'true' || countryCode =='CN') {
	            $('#account-submit-suggested').trigger('click');
	        } else {
	        	loqate("profile");
				return loqateResult("profile");
	        }
	    });
	}

    $("#confirmAddress").click(function (evt) {
    	var finalAddressSelected;
    	if ($('#rbNewAddress').is(':checked')) {
    		finalAddressSelected = loqateAddressMatch;
    		var address2 = finalAddressSelected.SubBuilding ? finalAddressSelected.SubBuilding : "";
    		var address1 = "";
    		if (address2 == "") {
    			address1 = finalAddressSelected.Address1;
    		} else {
    			if (AVCCountry == "CA") {
    				address1 = finalAddressSelected.Address1;
    			} else {
    				address1 = finalAddressSelected.Address1.split(address2)[0].trim();
    			}
    		}

            $("#dwfrm_"+loqateSelector+"_country").val(finalAddressSelected.Country);
            $("#dwfrm_"+loqateSelector+"_address1").val(address1);
            $("#dwfrm_"+loqateSelector+"_address2").val(address2);
            $("#dwfrm_"+loqateSelector+"_city").val(finalAddressSelected.Locality);
            if(finalAddressSelected.Country == 'US') {
        		$("#dwfrm_"+loqateSelector+"_states_state").val(finalAddressSelected.AdministrativeArea);
        	} else if(finalAddressSelected.Country == 'CA') {
        		$("#dwfrm_"+loqateSelector+"_statesCA_stateCA").val(finalAddressSelected.AdministrativeArea);
        	} else {
        		$("#dwfrm_"+loqateSelector+"_statesOther_stateOther").val(finalAddressSelected.AdministrativeArea);
        	}
    		$("#dwfrm_"+loqateSelector+"_postal").val(finalAddressSelected.PostalCode.replace(/\s+/g, ''));
    	} else if ($('#rbOrigAddress').is(':checked')) {
    		finalAddressSelected = realAddress;
    		$("#dwfrm_"+loqateSelector+"_country").val(finalAddressSelected.country);
            $("#dwfrm_"+loqateSelector+"_address1").val(finalAddressSelected.address1);
            $("#dwfrm_"+loqateSelector+"_address2").val(finalAddressSelected.address2);
            $("#dwfrm_"+loqateSelector+"_city").val(finalAddressSelected.city);
            if(finalAddressSelected.country == 'US') {
        		$("#dwfrm_"+loqateSelector+"_states_state").val(finalAddressSelected.state);
        	} else if(finalAddressSelected.country == 'CA') {
        		$("#dwfrm_"+loqateSelector+"_statesCA_stateCA").val(finalAddressSelected.state);
        	} else {
        		$("#dwfrm_"+loqateSelector+"_statesOther_stateOther").val(finalAddressSelected.state);
        	}
    		$("#dwfrm_"+loqateSelector+"_postal").val(finalAddressSelected.postal.replace(/\s+/g, ''));
    	}
		
		$("#addressDialog").dialog('close'); 
		var formtype = $(this).data('formtype');
		if(formtype == "shipping") {
			evt.preventDefault();
			triggerShippingFormSubmit();
			$('#shipping-submit-suggested').trigger('click');
		} else if(formtype == "profile"){
			evt.preventDefault();
			triggerAccountFormSubmit();
			$('#account-submit-suggested').trigger('click');
		}
    });
}

function triggerShippingFormSubmit() {
    $('#dwfrm_singleshipping_shippingAddress_addressFields_loqateAVSValidated').attr('checked', true);
    $('#dwfrm_singleshipping_shippingAddress_addressFields_loqateAVSValidated').prop('checked', true);
    $('#dwfrm_singleshipping_shippingAddress_addressFields_loqateAVSValidated').val(true);
    $('#shipping-submit-suggested').trigger('click');
}

function resetAVSValidation() {
    $('#dwfrm_singleshipping_shippingAddress_addressFields_loqateAVSValidated').attr('checked', false);
    $('#dwfrm_singleshipping_shippingAddress_addressFields_loqateAVSValidated').prop('checked', false);
    $('#dwfrm_singleshipping_shippingAddress_addressFields_loqateAVSValidated').val(false);
}


function updateAccountAddrressAVSFields() {
    $('input[name$="_loqateAVSValidated"]').attr('checked', false);
    $('input[name$="_loqateAVSValidated"]').prop('checked', false);
    $('input[name$="_loqateAVSValidated"]').val(false);
}

function triggerAccountFormSubmit() {
    $('input[name$="_loqateAVSValidated"]').attr('checked', true);
    $('input[name$="_loqateAVSValidated"]').prop('checked', true);
    $('input[name$="_loqateAVSValidated"]').val(true);
}


exports.loqateResult = loqateResult;
exports.loqate = loqate;
exports.initEvents = initEvents;

