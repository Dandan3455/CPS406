# CPS406

Project Overview:
Cypress is an automated system that display problems on the streets, to simplify the procedure a citizen have to go through in order to report a problem.

This system aims to solve the issue where citizen have to go through complicated process to reach the right department to submit a report, and reported problems aren't accessible to other citizens.

Therefore the system will implement the following functionality:
	Frontend:
		- A draggable map that allows zoom in/out to view reported problems (marked by a pin)
		- A form system that allows user to enter details regarding the report, additional to their preferred contact methods (SMS/Email) to receive updates
		- A form system that allows user to report problem as solved
		- A list view of all reports, sorted by distance from user current location
	Backend:
		- Reports need to be stored and sync onto all users with internet connection
		- Needs to issue a notification to user via their preferred way of contact to inform them regarding status of report
		- Categorize reports based on type of issue
		- Needs to filter out repeated submission of the same problem (while keep all of the user who reported the issue an update)
		- Needs to validate if the report is valid
		- Contact related department and notify them of the issue

Group Members:
James Fang
Dandan Liu
Shoaib Sheriff
Sara Gomes
Elton Wong

Package Content :
1. ReadMe
2. Product Backlog
3. Velocity Diagram
4. Test Plan

Language Used:
Frontend: JavaScript
Backend: PHP

Setting up:
This is for localy hosting server on your own computer. The local hosting part only serve the purpose of syncing and storing data across sessions, can be safely ignored and just launch the .html code if that is not needed.
1. Make sure you have node.js installed, if not, install it on this website https://nodejs.org/en/download.
2. open termianl and navigate to root directory of the projet
3. run "npm install"
4. run "npm start"
5. go to a web browser and type in http://localhost:3000/ and the website should be there
