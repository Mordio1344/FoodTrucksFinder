var request = require('request');
var sprintf = require('sprintf-js').sprintf;
var { DateTime } = require('luxon');
const readline = require('readline');

// Gets the user's input and allows program to wait for input to resolve.
const getInput = async function(output)
{
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	
	return new Promise(resolve => rl.question(output, input => {
		rl.close();
		resolve(input);
	}));
}

// Prints a given page of size n in the list.
function printPage(page, list, n)
{
	console.log(" " + sprintf("%-80s", "Name") + sprintf("%5s", "Address"));
	var firstIndex = (page - 1) * n;
	var lastIndex = Math.min(firstIndex + n, list.length);
	for(var i = firstIndex; i < lastIndex; i++)
	{
		console.log(" " + sprintf("%-80s", list[i]["applicant"]) + list[i]["location"]);
	}
	console.log(" Trucks " + (firstIndex + 1) + " through " + lastIndex + ".");
}

// Prints the list, paging in increments of n.
const printPagedList = async function(list, n)
{
	var page = 1;
	var next = "";

	while(next != "Q" && next != "q" && ((page - 1) * n) < list.length)
	{
		printPage(page, list, n);
		
		// If there is another page, ask the user if they would like to display the next page.
		if((page * n) < list.length)
		{
			next = await getInput(" Press Q to quit or press any other button to print the next page:");
			console.log("");
		}
		page++;
	}
	
	if(next != "Q" && next != "q") { console.log(" All food trucks have been printed."); }
}

// The food trucks are in California, so use California time to check if they are open.
var calDate = DateTime.local().setZone('America/Los_Angeles');
var calTime = calDate.toFormat('HH:mm');
var calDay = calDate.weekdayLong;

// Get the names and addresses of all food trucks that are currently open and order them by their name.
var query = 'http://data.sfgov.org/resource/bbb8-hzi6.json?$query=';
query = query + 'SELECT%20DISTINCT%20applicant,%20location%20';
query = query + "WHERE%20start24%20<=%20'" + calTime + "'%20AND%20end24%20>=%20'" + calTime + "'%20AND%20dayofweekstr%20=%20'" + calDay + "'%20";
query = query + 'ORDER%20BY%20applicant';

request(query, function (error, response, body) {
	if(error != null)
	{
		console.log(error);
		return;
	}
	
	// Parse the response.
	var foodTrucks = JSON.parse(body);
	printPagedList(foodTrucks, 10);
});