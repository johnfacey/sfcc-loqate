
/**
* Returns an JSON object containing the Loqate Service Response. 
*
* @return      JSON Object
* @see         Object
*/

function Verify() {

    var LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");
    var Logger = require("dw/system/Logger");
    var Encoding = require("dw/crypto/Encoding");
    var StringUtils = require("dw/util/StringUtils");

    var loqateSetup = (dw.system.Site.getCurrent().getCustomPreferenceValue('loqateSetup') ? dw.system.Site.getCurrent().getCustomPreferenceValue('loqateSetup') : "");
    if (loqateSetup == "") {
        return;
    } else {
        loqateSetup = JSON.parse(loqateSetup);
    }
    var key = loqateSetup.key;
    var server = loqateSetup.server;
    var loqateAddress = JSON.parse(request.httpParameters.loqateAddress[0]);

    var isLatin = request.httpParameters.isLatin;

    var loqateRequest = {
        "Key": key,
        "Geocode": true,
        "Options": {
            "Certify": !empty(loqateAddress.country) && loqateAddress.country == 'US' ? true : false,
            "Process": "Verify",
            "ServerOptions": {
                "OutputAddressFormat": true,
                "OutputScript": "Latn"
            }
        },
        "Addresses": [{
            "Organization": "",
            "Address": "",
            "Address1": loqateAddress.address1,
            "Address2": loqateAddress.address2,
            "Country": loqateAddress.country,
            "Locality": loqateAddress.city,
            "AdministrativeArea": loqateAddress.state,
            "PostalCode": loqateAddress.postal
        }]
    }

    var jsonParam = "";

    try {

        var httpclient = new dw.net.HTTPClient();
        var requestBody = JSON.stringify(loqateRequest);

        var requestParamsAuth = {
            'requestMethod': 'POST',
            'requestBody': requestBody,
            'requestType': 'application/json',
            'callUrl': server
        };

        var loqateService = LocalServiceRegistry.createService("Loqate.Api", {
            createRequest: function (svc, params) {
                svc.setRequestMethod('POST');
                svc.setURL(params.callUrl);
                svc.addHeader('Content-type', params.requestType);
                return params.requestBody;
            },
            parseResponse: function (svce, response) {
                return response;
            },
            mockExec: function (svc, params) {
                return {
                    statusCode: 201,
                    statusMessage: "mockExec"
                };
            }
        });
        var loqateResponse = loqateService.call(requestParamsAuth);
        var loqateData = "";

        if (loqateService.ok == false) {
            return JSON.parse(loqateResponse).error;
        } else {
            loqateData = JSON.parse(loqateResponse.object.text)[0];

            var input = loqateData.Input;      //.Address . Country
            var match = loqateData.Matches[0]; //.Address . Country
        }

        if (!loqateResponse) {
            var error = " - ";
            Logger.error(error.toString());
            return;
        }

        if (loqateResponse.ok == false) {
            return JSON.parse(loqateResponse).error;
        } 

        var jsonResult = JSON.parse(loqateResponse.object.text);
        if (jsonResult == null) {
            Logger.error(error);
            return;
        } else {
            response.getWriter().println(loqateResponse.object.text);
        }
    } catch (err) {
        var error = err.toString();
        Logger.error(error);
        return;
    }
}

exports.Verify = Verify;
exports.Verify.public = true;