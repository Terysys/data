
/* This JavaScript code is responsible for fetching vehicle fuel transactions 
data from the server, generating HTML content based on that data, 
and inserting it into the webpage. */

// This variable will hold the fetched fuel transaction data as an array of objects
let fuel = [];


/* This function will fetch vehicle fuel transaction data from the 
server and return it as an array of objects */
async function vehicleFuelTransaction() {
    try {
            const response = await fetch('http://localhost/data/get_fuel.php');
            const data = await response.json();

            //convert to string 
            const trans = await JSON.stringify(data);

            //convert back to object
            fuel = await JSON.parse(trans);

            return fuel;

    } catch (error) {
            console.error('Error fetching vehicle fuel transaction data:', error);
    }
};


// Format as Naira (NGN)
const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
});

//nairaFormatter.format(amount)
// Output: "₦50,000.75"

//This variable will hold the generated HTML content for the fuel transactions
//This is also known as the accumulator pattern 
let fuelTable = '';


//Call the function to fetch vehicle fuel transaction data and generate HTML content
const vehicleFuelHtml = vehicleFuelTransaction().then(details => {
    details.forEach(element => {
        
           fuelTable +=
            `<tr>
            <td>${element.transactionID}</td>
            <td><span>🏦${element.accountNum}</span></td>
            <td><span>${element.utilizer? "💧"+element.utilizer: "💰Funding"}</span></td>
            <td><span>${element.litres? "⛽"+element.litres:"-"}</span></td>
            <td>${element.price? nairaFormatter.format(element.price): "-"} </td>
            <td><span>${nairaFormatter.format(element.amount)}  </span></td>
            <td><span>${nairaFormatter.format(element.balance)} </span></td>
            <td><span>📅${element.date.split(' ')[0]}</span></td>
            <td>
                <button class="btn btn-sm btn-info">pdf</button>
            </td>
            </tr>`;
            
        
    });

    return fuelTable;
});


///Once the HTML is generated, we can insert it into the webpage
 vehicleFuelHtml.then(html => {
    document.querySelector('#fuel-record').innerHTML = html;
});  


/* $('#search').on('keyup', function() {
    var value = $(this).val()
    console.log('value:', value);
    var data = searchableTable(value, myArray)
 });
 */

 /* document.getElementById('search').addEventListener('keyup', function() {
    var value = this.value;
    console.log('value:', value);
    var data = searchableTable(value, fuel); */


 /* function searchableTable(value, data){
    let filteredData = []

    for (let i = 0; i < dat.length; i++) {
         value = value.toLowerCase()
         let name = data[1].name.toLowerCase()
         
         if (name.includes(value)) {
             filteredData.push(data[i])
         }
    }
     return filteredData;
 } */

