# [WIP] Node-Autoticket

This project is inspired by the excelent
[AutoTicketProject](https://github.com/cmrfrd/AutoTicketProject) by [Alexander
Comerford](https://github.com/cmrfrd) - this is, however, implemented in Javascript (Node 8.x).

I started this project to help with repeated ticket creation in my work, were we use the CA Service
Desk Manager© software.

The goals of this project are:

- Batch creation of Tickets via CSV/XLSX files
- Ticket creation via a CLI interface
- Automatic Ticket creation based on clipboard or file contents using Natural Language Processing

Please take note: the code is in early stages, so do not expect any functionality.

## Install notes - IE Driver

Please refer to [InternetExplorerDriver
page](https://github.com/SeleniumHQ/selenium/wiki/InternetExplorerDriver) in SeleniumHQ
documentation, especially the [Required Configuration
section](https://github.com/SeleniumHQ/selenium/wiki/InternetExplorerDriver#required-configuration)
to properly install and configure the driver.

If you still have issues, try using the 32-bit version of the driver.
