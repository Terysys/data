<?php


//load classes 
include_once dirname(__DIR__) . '../core/init.php';

//include the login classes namespace
use support\classes\account\pager;

$page = new pager();

?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <!-- Bootstrap 5 CSS -->

    <link href="css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="pagination.css">

</head>
<body>
    <div class="table-container">

        <div class="row mb-3">
            <div class="col-md-4">
                <label class="form-label">Rows per page:</label>
                <select id="rows-select" class="form-select">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
            </div>
            <div class="col-md-5">
                <label class="form-label">Search:</label>
                <input type="text" id="search" class="form-control" placeholder="Search by ID, plate, amount, date..." value="search...">
            </div>

            <div class="col-md-6">
                <div class="btn-group" role="group">
                    <button class="btn btn-primary btn-sm">📊 Export to CSV</button>
                    <button class="btn btn-success btn-sm">🔄 Refresh</button>
                </div>
            </div>
            
            
        </div>
        
        
        <table id="myTable" class="table table-hover fuel-table">
            <thead>
                <tr>
                    <th scope="col">Trx ID</th>
                    <th scope="col">Acc Number</th>
                    <th scope="col">Entry Type</th>
                    <th scope="col">Litres</th>
                    <th scope="col">Pump price</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Balance</th>
                    <th scope="col">Date</th>
                    <th scope="col">Action</th>
                </tr>
            </thead>
            <tbody id="fuel-record">
            </tbody>
        </table>
        
        <?php

          $page->display();
          ?>

          <div class="table-footer">
            <span>Total Records: 1000</span>
            <span>Last Updated: 2026-05-28, 15:08:06</span>
          </div>
          
    </div>
        <script src="js/b
          ootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
        <script src="fuel-transaction.js"></script>

        <script>
            $(document).ready(function() {
                $('#myTable').DataTable();
            });  
        </script>
</body>
</html>