<h1>How to run the application?</h1>
You will be able to see the output in the browser in codesandbox IDE
Click Here to open codesandbox: https://codesandbox.io/s/github/Sathish5234/affirm-solution

# Change the DataSet from small to Large:

1. Open package.json in codesandbox
2. Change the propery from "Small" to "Large"
3. Save and click Refresh on the browser inside codesandbox

# Writeup:

1. How long did you spend working on the problem? What did you find to be the most difficult part?

3 hrs and Reading from the csv files and writing again to csv files.

2. How would you modify your data model or code to account for an eventual introduction of new, as-of-yet unknown types of covenants, beyond just maximum default likelihood and state restrictions?

I would have to change the code to account for the new covenants also change the datamodel by adding more columns to covenants.csv.

3. How would you architect your solution as a production service wherein new facilities can be introduced at arbitrary points in time. Assume these facilities become available by the finance team emailing your team and describing the addition with a new set of CSVs.

I will upload it to Amazon S3 which can be automated as well using AWS Lambda. The UI will be pulling the csv files from Amazon S3 directly.

4. Your solution most likely simulates the streaming process by directly calling a method in your code to process the loans inside of a for loop. What would a REST API look like for this same service? Stakeholders using the API will need, at a minimum, to be able to
   request a loan be assigned to a facility, and read the funding status of a loan, as well as query the capacities remaining in facilities.

It will be a get call with no input parameters and the output will contain array of assignments as well as array of yields. UI can get the data and display it. Also, the Files can be generated in the NodeJS/Java Backend and push the files to Amazon S3.

5. How might you improve your assignment algorithm if you were permitted to assign loans in batch rather than streaming? We are not looking for code here, but pseudo code or description of a revised algorithm appreciated.

I would write an AWS Lambda to call the REST API call every day or every hour depending on how many times you want to call the backend service.

6. Discuss your solution’s runtime complexity.
   O(M\*N) where M is the number of loans and N is the number of facilities.
