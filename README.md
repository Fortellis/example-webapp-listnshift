# example-webapp-listnshift
An example of a web application using Fortellis APIs. This uses the OAuth 2.0 implicit flow

## Usage
Before executing the application you will need to register a solution in the [Fortellis developer network](https://developer.fortellis.io)  and set the Callback URL (optional) field when registering your application to http://localhost:5000. 

After getting the software you will need to set the redirect_uri variable in getdata.js to http://localhost:5000 and the client_id variable to the API Key of your registered application.

To use the application you must click the login button first which will prompt you for a Fortellis ID. Once that is entered you can press the Get Quotes button which will call the API. Once run, you can then select a row in the list and it will call the Fortellis [Merchandisable Vehicle API](https://docs.fortellis.io/docs/quickstart/guides/merchandisable-vehicle-quickstart/) and give you a list of vehicles. 

If you'd like to see this running with more real data then click the Demo PLC button to reset the application and then toggle the Test Mode to off. Then re-run the process and you'll see it is running with a different Subscription-Id and will get back different data

According to the serve npm package [readme](https://www.npmjs.com/package/serve) you'll need at least [Node.js LTS](https://nodejs.org/en/) although we have tried it with version 9 and it worked.

## Dev
* npm install -g serve
* serve

## Viewing the data
* http://localhost:5000
