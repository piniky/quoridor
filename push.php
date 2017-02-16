<?php
  
  require('Pusher.php');

  $options = array(
    'cluster' => 'ap1',
    'encrypted' => true
  );
  $pusher = new Pusher(
    'KEY',
    'SECRET',
    'APP_ID',
    $options
  );
  $json_string = file_get_contents('php://input');
  $json_string = stripslashes($json_string);
  $obj = json_decode($json_string, true);
  

  $pusher->trigger('quo'.$obj["room"], $obj["action"], $json_string);
?>