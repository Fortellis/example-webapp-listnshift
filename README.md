# example-webapp-listnshift
An example of a web application using Fortellis APIs. This uses the OAuth 2.0 implicit flow

## Usage
To use the application you must click the login button first which will prompt you for a Fortellis ID. Once that is entered you can press the Get Quotes button which wil lcall the API. Once run you can then select a row in the list and it will call the merchandisable vehicle API and give you a list of vehicles.

If you'd like to see this running with more real data then click the Demo PLC button to reset the application and then toggle the Test Mode to off. Then re-run the process and you'll see it is running with a different Subscription-Id and will get back different data

## Dev
* npm install -g serve
* serve

## Viewing the data
* http://localhost:5000
