<?php

header("Content-Type: application/json;charset:utf-8"); // Set the content type to JSON
//sequence of database operations. 

/******************************************************/
//N0.1 we need to establish a connection to the database using PDO,
/******************************************************/
$con = new pdo("mysql:host=localhost;dbname=logistics","root","");


/******************************************************/
//N02 we need to set the error mode to exception, 
// so that we can handle any errors that may occur during the database operations
/******************************************************/
$con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


/******************************************************/
//N03 we need to prepare a SQL statement using the prepare() method,
/******************************************************/
/* $stmt = $con->prepare("SELECT trans.transactionID, trans.accountNum, trans.amount, trans.transType, fuel.litres, fuel.price, fuel.machineType, fuelvehicle.licenseNo, fuelgen.genUser, trans.balance, trans.staff, trans.date FROM trans 
LEFT JOIN fuel ON trans.transactionID = fuel.transactionID 
LEFT JOIN fund ON trans.transactionID = fund.transactionID 
LEFT JOIN fuelvehicle ON trans.transactionID = fuelvehicle.transactionID
LEFT JOIN fuelgen ON trans.transactionID = fuelgen.transactionID
WHERE trans.accountNum = '1234567890'"); */


$stmt = $con->prepare(
    "SELECT trans.transactionID, trans.accountNum, trans.amount, 
     trans.transType, fuel.litres, fuel.price, fuel.machineType, 
     CASE WHEN fuelvehicle.licenseNo IS NOT NULL THEN fuelvehicle.licenseNo
     ELSE fuelgen.genUser
     END AS utilizer, 
     trans.balance, trans.staff, trans.date 
    FROM trans 
    LEFT JOIN fuel ON trans.transactionID = fuel.transactionID 
    LEFT JOIN fund ON trans.transactionID = fund.transactionID 
    LEFT JOIN fuelvehicle ON trans.transactionID = fuelvehicle.transactionID
    LEFT JOIN fuelgen ON trans.transactionID = fuelgen.transactionID
    WHERE trans.accountNum = '1234567890'");




/*****************************************************/
$stmt->setFetchMode(PDO::FETCH_OBJ); 
/*****************************************************/



/******************************************************/
//N05 we need to execute the prepared statement using the execute() method,
/******************************************************/
$stmt->execute();


$result = $stmt->fetchAll();

//echo $result[0]['username']; // Don't try this 

//echo $result->username[0] //Don't try this also 

//echo $result[2]->username; // Accessing the username property of the first row

/*foreach($result as $row){ //or this also can be used 
    echo "ID: " . $row->id . "<br>";
    echo "Name: " . $row->username . "<br>";
}*/

echo json_encode($result);

//This will close the database connection, which is a good practice to free up resources
//$con->close();

//print_r($result);


?>