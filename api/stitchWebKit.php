<?php
  global $writeBuffer;

  for($i = 1; $i < 18; $i++)
  {
    $fileStream   = fopen('../dumps/libSceWebKit2_p' . $i . '.bin', 'rb');
    $writeBuffer .= fread($fileStream, filesize('../dumps/libSceWebKit2_p' . $i . '.bin'));

    fclose($fileStream);
  }

  // We now have all the files in $writeBuffer, stitch
  $fp = fopen('../dumps/libSceWebKit2.bin', 'wb');
  fputs($fp, $writeBuffer);
  fclose($fp);

  header("Location: ../dump.html");
?>
