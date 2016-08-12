<?php
  $data = file_get_contents('php://input');
  $f = fopen('../dumps/memory.bin', 'wb');
  fwrite($f, $data);
  fclose($f);
?>
