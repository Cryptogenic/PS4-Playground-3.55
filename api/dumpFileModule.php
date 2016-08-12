<?php
  $data = file_get_contents('php://input');
  $f = fopen('../dumps/' . $_GET['var'], 'wb');
  fwrite($f, $data);
  fclose($f);
?>
