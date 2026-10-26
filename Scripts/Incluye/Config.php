<?php
$version = getenv('APP_ENV');

if ($version === 'local') {
  $version = time(); // timestamp dinámico
} else {
  $version = '1.0.6';
}

define('CACHE_TIME', 2400); // Cache de 40 minutos
define('APP_VERSION', $version); // Versión de la aplicación
