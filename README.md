# CPS406

Project Overview:
Cypress is an automated system that displays problems on the streets. To simplify the procedure, a citizen have to go through in order to report a problem.

This system aims to solve the issue where citizen have to go through a complicated process to reach the right department to submit a report, and reported problems aren't accessible to other citizens.

Therefore, the system will implement the following functionality:
		- A draggable map that allows zoom in/out to view reported problems (marked by a pin)
		- A form system that allows user to enter details regarding the report, in addition to their preferred contact methods (SMS/Email) to receive updates
		- A form system that allows users to report problems as solved
		- A list view of all reports, sorted by distance from the user's current location
		- Reports need to be stored and synced onto all users with an internet connection
		- Needs to issue a notification to the user via their preferred way of contact to inform them regarding the status of the report
		- Categorize reports based on type of issue
		- Needs to filter out repeated submission of the same problem (while keeping all of the users who reported the issue updated)
		- Needs to validate if the report is valid
		- Contact the related department and notify them of the issue


Group Members:
| Name            | Student Number |
|-----------------|----------------|
| James Fang      | 501240207      |
| Dandan Liu      | 501273861      |
| Shoaib Sheriff  | 501172587      |
| Sara Gomes      | 501184278      |
| Elton Wong      | 501165692      |

```
CPS406_main/
│
├── css/
│   └── style.css              # Styles for the main user interface
│
├── js/
│   ├── fakeCheck.js           # Functions to validate report content
│   ├── formHandler.js         # Handles submission and validation of report forms
│   ├── james_duplicate.js     # Detects and processes duplicate issue reports
│   └── mapHandler.js          # Manages map interactions and displays report pins
│
├── Data.json                  # Test data simulating previous user reports
├── userPage.html              # Main HTML file users interact with
├── server.js                  # Node.js server script for handling data and syncing
├── package.json               # Defines dependencies and scripts for the server
└── README.md                  # Project documentation
```

Language Used:
JavaScript, HTML

Setting up:
This is for a locally hosted server on your own computer. It is ideal to launch it with node.js, but it is currently possible to directly open up the HTML file without losing any functionality (except for saving/syncing data across sessions, which you need the server) as of 25 March 2025.
1. Make sure you have node.js installed; if not, install it on this website https://nodejs.org/en/download.
2. Open a terminal and navigate to the root directory of the project
3. Run "npm install"
4. Run "npm start"
5. Go to a web browser and type in http://localhost:3000/, and the website should be there
