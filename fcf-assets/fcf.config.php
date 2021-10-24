<?php
// ***********************************************************
// This file is part of a package from:
// www.freecontactform.com

// Free Version
// March 2021

// You are free to use for your own use. 
// You cannot resell, share or repackage in any way.

// Important legal notice:
// You must retain the attribution to www.freecontactform.com 
// If must be visible on the same page as the form.
// Or switch to the Pro version without attribution/credit.
// ***********************************************************


// *********************
// FORM FIELD VALIDATION
// *********************
$rules = array(
  "Name" => array(
    "required" => true,
    "label" => "Ваше имя"
  ),
  "Email" => array(
    "required" => true,
    "label" => "Ваш email",
    "email" => true
  ),
  "Message" => array(
    "required" => true,
    "label" => "Номер вашего телефона",
  )
);


// ******************
// THANK YOU PAGE
// ******************
define('THANK_YOU_PAGE','');


// **************************
// EMAIL TEMPLATES - INCOMING
// **************************
define('EMAIL_TEMPLATE_IN_HTML', 'fcf.email-in.htm');
define('EMAIL_TEMPLATE_IN_TEXT', 'fcf.email-in.txt');


// *******************************
// EMAIL TEMPLATES - AUTO-RESPONSE
// *******************************
define('EMAIL_TEMPLATE_OUT_HTML', 'fcf.email-out.htm');
define('EMAIL_TEMPLATE_OUT_TEXT', 'fcf.email-out.txt');

define('SEND_AUTO_RESPONSE', 'NO'); // YES OR NO
define('EMAIL_OUT_SUBJECT', '');
define('EMAIL_OUT_TO', 'FIELD:Email');
define('EMAIL_OUT_TO_NAME', 'FIELD:Name');
define('EMAIL_OUT_FROM', '');
define('EMAIL_OUT_FROM_NAME', '');


// *************
// EMAIL MESSAGE
// *************
define('EMAIL_TO', 'greeco77@gmail.com');
define('EMAIL_TO_NAME', 'greeco77@gmail.com');

define('EMAIL_TO_CC', '');
define('EMAIL_TO_CC_NAME', '');

define('EMAIL_TO_BCC', '');
define('EMAIL_TO_BCC_NAME', '');

define('EMAIL_FROM', 'mp@joyberry.ru');
define('EMAIL_FROM_NAME', '');

define('EMAIL_REPLY_TO', 'FIELD:Email');
define('EMAIL_REPLY_TO_NAME', 'FIELD:Email');

define('EMAIL_SUBJECT_BEFORE', '');
define('EMAIL_SUBJECT', "Новая заявка");
define('EMAIL_SUBJECT_AFTER', '');



// ***************
// EMAIL TRANSPORT
// ***************
define('USE_SMTP', 'NO'); // YES or NO
define('SMTP_HOST', '');
define('SMTP_USER', '');
define('SMTP_PASS', '');
define('SMTP_AUTH', '');
define('SMTP_SECURE', ''); // STARTTLS, SMTPS (port 465) or empty
define('SMTP_PORT', '');
define('SMTP_DEBUG', 'NO'); // YES or NO






// *******************************
//  DON'T CHANGE ANYTHING BELOW
// *******************************

// ***********
// LICENSE KEY
// ***********
define('KEY', 'FREE');

// ***********
// LANGUAGE
// ***********
define('LANG','en');

// **************************
// VALIDATION CHECKS
// **************************
define('A', '');
define('B', '');
define('C', '');
define('D', '');
define('E', '');
define('F', '');