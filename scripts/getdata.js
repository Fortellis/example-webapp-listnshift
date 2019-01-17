// Simulator customer
var fortellisTestSubscriptionId = 'test';
var fortellisRealQuoteSubscriptionId = '15366e78-75c4-43f6-ab04-c1016e530683';
var fortellisRealMVSSubscriptionId = '15366e78-75c4-43f6-ab04-c1016e530683';
var testMode = true;
var _localmode = false;
var _showalert = false;
var paymentsTable = [];
var quotes = [];
var nextId = 0;
var expanded = [];

var x = window.matchMedia("(min-width: 480px)") 

let token;
// replace this with the client_id of your fortellis app
const client_id = 'SkGHJ8m2aHTrhlcTrlhdYybUcWXZynfm';
// For local test
// Currently Fortellis will not allow multiple redirect URIs so you need to change this in the dev network if you want to test locally
// const redirect_uri = 'http://localhost:5000'
// For actual site
const redirect_uri = 'https://demoapps.fortellis.io/list-n-shift/index.html'

$('#getQuotes').on('click', function(){

    // This extracts the access token from the browser URL 
    token =
    window.location.href.match(/access_token=(.*?)&/) &&
    window.location.href.match(/access_token=(.*?)&/)[1];

    if (!token) {
        // If we don't have a token then show the warning
        var dialog = document.querySelector('dialog');

        dialog.showModal();
        dialog.querySelector('.close').addEventListener('click', function() {
            dialog.close();
        });
        return;
    }
    else {
        var media = window.matchMedia("(min-width: 480px)");
        if (testMode && !media.matches) {
            testMode=false;
        }
        $('#getQuotesContainer').hide();
        $('#quotes').show();
        // Clicked on the Get Quotes so go and load them
        getQuotes();
    }
});
// $(document).ready(function() {
//   getQuotes();
// });

$('#login').on('click', function(){
    window.alert('Login');
});

$('.js-toggle-api-calls').click(function() {
  $('body').toggleClass('split-layout--hide-side');
});

$('.js-toggle-test-mode').click(function() {
    testMode = !testMode;
  });

var tree = $('#tree').tree({
    primaryKey: 'id',
    uiLibrary: 'materialdesign'
});

tree.on('expand', function (e, node, id) {
    expanded[id] = true;
});

tree.on('collapse', function (e, node, id) {
    expanded[id] = false;
});

// Get quotes data
function touchStart() {
    window.alert('Touch start');
}

function login() {
    // Redirect to the identity Fortellis provider and redirect back to this application
    // The redirect URI must be set up in Fortellis with the registered solution details for this application
    // The client_id is the API key shown in the Fortellis registered solution 
    window.location.href = 'https://identity.fortellis.io/oauth2/aus1p1ixy7YL8cMq02p7/v1/authorize?response_type=token&client_id=' + client_id + '&redirect_uri=' + encodeURIComponent(redirect_uri) + '&nonce=nonce&scope=openid&state=state';
}

function getQuotes() {
    
    token =
    window.location.href.match(/access_token=(.*?)&/) &&
    window.location.href.match(/access_token=(.*?)&/)[1];

    if (!token) {
        window.alert('Please select the login button first using Fortellis ID');
        return;
    }

    if (token) {
        var quoteId = '';
        // This is the quote ID for demo purposes.
        // It is expected that these would have been saved against the logged in user for this application
        if (testMode) {
            quoteId = '0ddce0bd-9166-42ac-8ddb-72a069997aaf';
        }
        else {
            quoteId = 'a40a2d2c-4a33-4918-bfd1-2a065826caec';
        }
        // Call the fortellis API to get the results
        fortellisCall('GET', 'sales/deal-creation/v1/quotes/' + quoteId).then((responseData) => {
            getQuotesResponse(responseData);
        });
    }

    return false;

    function getQuotesResponse(response) {
        // Display the quote details from the API call

        if (!response.items) {
            quotes[0] = response;
        }
        else {
            quotes = response.items;
        }

        refreshQuotes();

    }

}

function refreshQuotes() {
    // Build quotes table and results details

    var results = 'You have ' + quotes.length + ' saved quote';

    if (quotes.length !== 1) {
      results += 's';
    }

    document.getElementById("title").innerHTML = 'Your Quotes';
    document.getElementById("quoteresults").innerHTML = results;

    document.getElementById("quotes").innerHTML = '';

    // Set up the default table
    paymentsTable = [];

    for (var i = 0; i < quotes.length; i++) {

        var quote = quotes[i];

        // We have the quote but we need to load the payments for that quote
        fortellisCall('GET', 'sales/deal-creation/v1/quotes/' + quote.quoteId + '/payment-options').then((response) => {

            // Payments loaded so now display them
            var payments = response.items;
            if (payments.items) {
                // Fix to correct for test data
                payments = payments.items;
            }

            for (var iPayment = 0; iPayment < payments.length; iPayment++) {

                if (!payments[iPayment].lender.lender) {
                    // For demo
                    payments[iPayment].lender.lender = 'Demo lender';
                }
                if (!payments[iPayment].paymentTerms) {
                    payments[iPayment].paymentTerms = {};
                }
                if (!payments[iPayment].paymentTerms.monthlyPayment || payments[iPayment].paymentTerms.monthlyPayment === 0) {
                    // For demo
                    payments[iPayment].paymentTerms.monthlyPayment = 500;
                }
                paymentsTable[paymentsTable.length] = payments[iPayment];

            }

            refreshPaymentsTable();

        });

    }

    refreshPaymentsTable();

    return

    function addRow(payment) {

        // Add the HTML for the payment list and display on the page

        var lookup = {};
        var tableRow = '';

        tableRow += '<tr style="cursor: pointer;" onclick="showVehicles(\'' + payment.paymentOptionId + '\')">';
        tableRow +=   '<td class="mdl-data-table__cell--non-numeric">';
        tableRow +=     (payment.lender.lender && payment.lender.lender !== '' ? payment.lender.lender : 'Unknown');
        tableRow +=   '</td>';
        tableRow +=   '<td>';
        tableRow +=     payment.paymentTerms.rate + '%';
        tableRow +=   '</td>';
        tableRow +=   '<td>';
        tableRow +=     payment.paymentTerms.term;
        tableRow +=   '</td>';
        tableRow +=   '<td>';
        tableRow +=     '$' + payment.paymentTerms.monthlyPayment.toFixed(2);
        tableRow +=   '</td>';
        tableRow += '</tr>';

        var table = document.getElementById("quotes").innerHTML;

        return tableRow;

    }

    function refreshPaymentsTable() {

        // Add the HTML for the payments table

        var table = '';
        table += '<div class="mdl-grid">';
        table +=  '<div class="mdl-cell mdl-cell--12-col">';

        table += '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">';
        table +=  '<thead>';
        table +=    '<tr>';
        table +=      '<th class="mdl-data-table__cell--non-numeric">Lender</th>';
        table +=      '<th>Rate</th>';
        table +=      '<th>Term</th>';
        table +=      '<th>Payments</th>';
        table +=    '</tr>';
        table +=  '</thead>';
        table += '<tbody>';


        for (var iPayment = 0; iPayment < paymentsTable.length; iPayment++) {

            var payment = paymentsTable[iPayment];

            table += addRow(payment);
        }

        table +=  '</tbody>';
        table += '</table>';

        table +=  '</div>';
        table += '</div>';
        document.getElementById("quotes").innerHTML = table;

    }

}

function showVehicles(paymentOptionId) {

    // Hide previous page, show page 2
    $('#your-quotes').hide();
    $('#matching-vehicles').show();

    getMerchandisibleVehicleData(paymentOptionId);

    return false;
}

// Get merchandisable vehicle data
function getMerchandisibleVehicleData(paymentOptionId) {

    // Lookup the vehicles that match the monthly payment

    var paymentRange = '';

    for (var iPayment = 0; iPayment < paymentsTable.length; iPayment++) {

        if (paymentsTable[iPayment].paymentOptionId === paymentOptionId && paymentsTable[iPayment].paymentTerms.monthlyPayment > 0) {
            var minPayment = (paymentsTable[iPayment].paymentTerms.monthlyPayment - 50).toFixed(2);
            paymentRange = '?minPayment=' + minPayment + '&' + 'maxPayment=' + paymentsTable[iPayment].paymentTerms.monthlyPayment;
            break;
        }

    }

    // Make the API call to get the matching vehicles
    fortellisCall('GET', 'sales/inventory/v1/merchandisable-vehicles' + paymentRange).then((responseData) => {
        // Data retrieved so display the vehicles
        getMerchandisibleVehicleDataResponse(responseData)
    });

    return;

    function getMerchandisibleVehicleDataResponse(response) {

        vehicles = response.items;

        refreshMerchandisableVehicles();

    }

}

function refreshMerchandisableVehicles() {
    // Build merchandisable vehicles table

    var plural = vehicles.length !== 1 ? 's' : '';
    var results = vehicles.length + ' vehicle' + plural + ' found';

    $('#matching-vehicles-title').html('Available Vehicles');
    $('#carresults').html(results);

    var table = '<div class="mdl-grid">'

    for (var i = 0; i < vehicles.length; i++) {

        var vehicle = vehicles[i];

        table += addRow(vehicle);

    }

    table += '</div>';

    if (testMode) {
        // Add the refresh button
        table += '<button type="button" class="mdl-button refresh">Refresh from events</button>';
    }

    // document.getElementById("cars" + paymentsCalculationId).innerHTML = table;
    $('#cars').html(table);

    if (testMode) {
        // Setup the listener for refresh button
        document.querySelector('.refresh').addEventListener('click', function() {
            // Get the data from the event
            vehicleRefreshFromEvents();
        });
    }

    return

    function addRow(vehicle) {

        // Fill in the HTML required to display the vehicles
        try {
            if (vehicle.summary.type === 'NEW') {
                var type = 'New';
            }
            else {
                var type = 'Used'
            }
        }
        catch (err) {
            var type = 'Used'
        }

        if (!vehicle.description) {
            vehicle.description = {};
            vehicle.description.salesDescription = '';
        }

        if (!vehicle.summary) {
            vehicle.summary = {};
            vehicle.summary.price = {};
            vehicle.summary.price.grossValue = 0;
            vehicle.summary.price.netPrice = 0;
        }

        if (!vehicle.prices) {
            vehicle.prices = [];
        }

        var tableRow = '';
        tableRow += '<div class="mdl-cell">';
        tableRow +=   '<div class="vehicle-card mdl-card mdl-shadow--2dp">';
        tableRow +=     '<div class="mdl-card__media vehicle-card__media" style="background-image: url(' + vehicle.summary.thumbnailImageLink.href + ')"></div>';
        tableRow +=     '<div class="vehicle-card__content">';
        tableRow +=       '<div class="mdl-card__title">';
        tableRow +=         '<h4 class="mdl-card__title-text vehicle-card__title-text">'
        tableRow +=           vehicle.description.salesDescription;
        tableRow +=         '</h4>';
        tableRow +=       '</div>';
        tableRow +=       '<div class="mdl-card__menu">';
        tableRow +=         '<span class="mdl-chip">';
        tableRow +=           '<span class="mdl-chip__text">'+ type +'</span>';
        tableRow +=         '</span>';
        tableRow +=       '</div>';
        tableRow +=       '<div class="mdl-card__supporting-text">';
        if (vehicle.prices.length > 0) {
            tableRow +=         '<span class="vehicle-card__msrp">' + vehicle.prices[0].priceType + ' $' + vehicle.prices[0].netPrice.toFixed(2) +'</span><br />';
        }
        else {
            tableRow +=         '<span class="vehicle-card__msrp">MSRP $unknown' + '</span><br />';
        }
        if (vehicle.prices.length > 1) {
            tableRow +=         '<span class="vehicle-card__msrp">' + vehicle.prices[1].priceType + ' $' + vehicle.prices[1].netPrice.toFixed(2) +'</span><br />';
        }
        else {
            tableRow +=         '<span class="vehicle-card__msrp">SALE $unknown' + '</span><br />';
        }
        tableRow +=       '</div>';
        tableRow +=     '</div>';
        tableRow +=   '</div>';
        tableRow += '</div>';

        return tableRow;

    }

    function vehicleRefreshFromEvents() {

        // Example of possible Fortellis events call
        // This is an endpoint that could be build by the developer and consumed by their application
        // In this case it is a get of the data but it could be a websocket into the events directly

        fortellisCall('GET', 'dev/events/2731fa93-4efa-4735-96a7-a282b8b37ebd?seconds=200', 'event').then((responseData) => {
            // Fill the vehicle list

            for (var iResponseData = 0; iResponseData < responseData.items.length; iResponseData++) {

                // Find the vehicle
                for (var iVehicle = 0; iVehicle < vehicles.length; iVehicle++) {
                    var data = responseData.items[iResponseData].data;
                    if (vehicles[iVehicle].merchandisableVehicleId === data.merchandisableVehicleId) {
                        // Found the vehicle so fill in price
                        var responseDataPrices = data.prices;
                        for (var iResponseDataPrices = 0; iResponseDataPrices < responseDataPrices.length; iResponseDataPrices++) {

                            // Find the price
                            for (var iVehiclePrice = 0; iVehiclePrice < vehicles[iVehicle].prices.length; iVehiclePrice++) {

                                if (vehicles[iVehicle].prices[iVehiclePrice].priceType === responseDataPrices[iResponseDataPrices].priceType) {
                                    
                                    vehicles[iVehicle].prices[iVehiclePrice].netPrice = responseDataPrices[iResponseDataPrices].netPrice;
                                }

                            }
                        }
                    }
                }

            }

            refreshMerchandisableVehicles();

        });
        
    }


}

let fortellisCall = (verb, uri, callType) => {

    // Make an API call to Fortellis
    // This also handles and event refresh call

    var fortellisSubscriptionId = fortellisTestSubscriptionId;

    switch (callType) {
        case 'event':
            // Event API call
            var baseUrl = 'https://ym8skmcctk.execute-api.us-west-2.amazonaws.com/';
            break
        default:
            // Fortellis API call
            var baseUrl = 'https://api.fortellis.io/';
    }
    
    // Get the right subscription ID
    if (uri.includes('quotes') > 0) {
        fortellisSubscriptionId = fortellisRealQuoteSubscriptionId;
    }
    else {
        fortellisSubscriptionId = fortellisRealMVSSubscriptionId;
    }

    // We are in test mode so overwrite the subscription ID with the test one
    if (testMode) {
        fortellisSubscriptionId = fortellisTestSubscriptionId;
    }


    var theUrl = baseUrl + uri;

    // This is a popup with the call information
    if (_showalert) {
        window.alert('Subscription ID: ' + fortellisSubscriptionId + '\n\n' +
        'Request: ' + verb.toUpperCase() + ' ' + uri + '\n\n' +
        'Authorization: ' + `Bearer ${token}` + '\n\n' +
        'Code: \n' +
        'var request = {\n' +
            '    method: verb.toUpperCase(),\n' +
            '    headers: new Headers({\n' +
                '        \'Subscription-Id\': fortellisSubscriptionId\n' +
                '        \'Authorization\': fortellisSubscriptionId\n' +
              '    })\n' +
        '}\n' +
        '\n' +
        'return fetch(theUrl, request).then(response => response.json()));');
    }


    // Fill the API calls pane with what the call was and the result
    var newNode = {};
    var id = ++nextId;
    var child = 0;

    newNode.id = id;
    newNode.text = '<b>Request</b>: ' + verb.toUpperCase() + ' ' + uri;
    newNode.children = [];
    newNode.children[child] = {};
    newNode.children[child].id = id + '-' + child;
    newNode.children[child].text = '<b>Server</b>: ' + baseUrl;
    newNode.children[++child] = {};
    newNode.children[child].id = id + '-' + child;
    newNode.children[child].text = '<b>Subscription ID</b>: ' + fortellisSubscriptionId;
    newNode.children[++child] = {};
    newNode.children[child].id = id + '-' + child;
    newNode.children[child].text = '<b>Code</b>: ' + 'return fetch(theUrl, request).then(response => response.json()));';

    var saveNode = newNode;

    tree.addNode(newNode);

    switch (callType) {
        case 'event':
            // Event request
            var request = {
                method: verb.toUpperCase(),
                headers: new Headers({
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                })
            }
            break;
        
        default:
            // Fortellis API call. Fill in the Subscription-Id and Authorization in the header
            var request = {
                method: verb.toUpperCase(),
                headers: new Headers({
                        'Content-Type': 'application/json',
                        'Subscription-Id': fortellisSubscriptionId,
                        'Authorization': `Bearer ${token}`
                })
            }
    
    }
    
    // Log out our request
    console.log(JSON.stringify(request));

    // Call the API and return in a promise
    return fetch(theUrl, request)
        .then(response => {
            // Check for errors
            if (!response.ok) {
                throw new Error(response.status);
            }
            return response;
        })
        .then(response => response.json())
        .then(data => {

            // Fill in the results into the tree
            var selections = tree.getSelections();
            var removeNode = tree.getNodeById(id);

            tree.removeNode(removeNode);

            var newNode = {};
            var newId = ++nextId;
            var child = 0;

            newNode.id = newId;
            newNode.text = '<b>Request</b>: ' + verb.toUpperCase() + ' ' + uri;
            newNode.children = [];
            newNode.children[child] = {};
            newNode.children[child].id = id + '-' + child;
            newNode.children[child].text = '<b>Server</b>: ' + baseUrl;
            newNode.children[++child] = {};
            newNode.children[child].id = newId + '-' + child;
            newNode.children[child].text = '<b>Subscription ID</b>: ' + fortellisSubscriptionId;
            newNode.children[++child] = {};
            newNode.children[child].id = newId + '-' + child;
            newNode.children[child].text = '<b>Code</b>: ' + 'return fetch(theUrl, request).then(response => response.json()));';

            newNode.children[++child] = {};
            newNode.children[child].id = newId + '-' + child;
            newNode.children[child].text = '<b>Result</b>: ' + JSON.stringify(data, null, 2);

            tree.addNode(newNode);

            try {
                if (expanded[id]) {
                    var node = tree.getNodeById(newId);
                    tree.expand(node);
                }
            }
            catch (err) {
                // Do nothing
            }

            // If we are using popups then show the returned data
            if (_showalert) {
                window.alert('Result: ' + JSON.stringify(data, null, 2));
            };
            // Return the promise with the API data
            return Promise.resolve(data)
    });

};
