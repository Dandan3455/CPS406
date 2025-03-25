# CPS406

Project Overview:
Cypress is an automated system that display problems on the streets, to simplify the procedure a citizen have to go through in order to report a problem.

This system aims to solve the issue where citizen have to go through complicated process to reach the right department to submit a report, and reported problems aren't accessible to other citizens.

Therefore the system will implement the following functionality:
		- A draggable map that allows zoom in/out to view reported problems (marked by a pin)
		- A form system that allows user to enter details regarding the report, additional to their preferred contact methods (SMS/Email) to receive updates
		- A form system that allows user to report problem as solved
		- A list view of all reports, sorted by distance from user current location
		- Reports need to be stored and sync onto all users with internet connection
		- Needs to issue a notification to user via their preferred way of contact to inform them regarding status of report
		- Categorize reports based on type of issue
		- Needs to filter out repeated submission of the same problem (while keep all of the user who reported the issue an update)
		- Needs to validate if the report is valid
		- Contact related department and notify them of the issue

Group Members:
| Name            | Student Number |
|-----------------|----------------|
| James Fang      | 501240207      |
| Dandan Liu      | 501273861      |
| Shoaib Sheriff  | 501172587      |
| Sara Gomes      | 501184278      |
| Elton Wong      | 501165692      |

Project directory:
CPS406_main
    |-css
      |-style.css
    |-js
      |-fakeCheck.js
      |-formHandler.js
      |-james_duplicate.js
      |-mapHandler.js
    |Data.json
    |README.md
    |server.js
    |package.json 
    |userPage.html
    
    

Project Content:
**css** - a folder of all css files
	style.css - css rules to style/format the webpage

**js** - a folder for all js script that implements functions in our webpage
	fakeCheck.js - a js script containing functions to check if reports are valid
	formHandler.js - a js script containing functions related to the report from (submitting, saving, checking for errors)
	james_duplicate.js - a js script containing functions to detect duplicate reports
	mapHandler.js - a js script containing functions regarding the map (open form on click, passing coordinates, show pins for reported events)
 
Data.json - a json file with all the test data to mimic previous user reports
server.js - a js files containg needed commands to host a local server
package.json - a json file with needed package for server.js to function properly
userPage.html - the main webpage that the user interacts with

Submission Content for Sprint 2:
1. ReadMe
2. Product Backlog
3. Velocity Diagram
4. Test Plan

Language Used:
Javascript, HTML

Setting up:
This is for localy hosting server on your own computer. It is ideal to launch it with node.js, but it is currently possible to directly opening up the html file without losing any functionality (except for saving/syncing data across sessions, which you need the server) as of 25 March 2025.
1. Make sure you have node.js installed, if not, install it on this website https://nodejs.org/en/download.
2. open termianl and navigate to root directory of the projet
3. run "npm install"
4. run "npm start"
5. go to a web browser and type in http://localhost:3000/ and the website should be there
