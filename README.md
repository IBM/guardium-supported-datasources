# Guardium Data Sources Maintenance Guide
TODO: Mention the github repo/team permissions needed (write access to repo, push access to gh-pages branch, collaborator or member role)
This guide provides step-by-step instructions for maintaining the compatibility information for Guardium data sources. It is intended for use by Quality Assurance (QA) teams to ensure the accuracy and up-to-date status of the data.

## To make changes to the data sources

- Start a separate branch and make changes in [connections.yaml](/public/data/connections.yaml) file.\
Note: Changes to connections.yaml will automatically be converted to JSON format ([connections.json](/public/data/connections.json)) as part of the `npm start` script

- In the project directory, run `npm install` within a command line.
- Next, run `npm start`.\
This runs the app in the development mode and will automatically open [http://localhost:3000](http://localhost:3000) to view it in your browser.\
Note: The page will reload when you make changes. You may also see any lint errors in the console.

- After changes have been validated, make a pull request to master branch
