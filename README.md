# Guardium Data Sources Maintenance Guide

This guide provides step-by-step instructions for maintaining the compatibility information for Guardium data sources. It is intended for use by Quality Assurance (QA) teams to ensure the accuracy and up-to-date status of the data.

## Table of Contents
 
  1. [Project Requirements](#project-requirements)
  2. [Cloning the Repository](#cloning-the-repository)
  3. [Starting the Application Locally](#starting-the-application-locally)
  4. [Replacing CSV Files](#replacing-csv-files)
  5. [Running Consolidation Scripts](#running-consolidation-scripts)
  6. [Restarting the Application Locally](#restarting-the-application-locally)
  7. [Deploying the Application to GitHub Pages](#deploying-the-application-to-github-pages)
  8. [Pushing Changes back to Main Branch](#pushing-changes-back-to-main-branch)


## Project Requirements
Before beginning the maintenance process, ensure that your system meets the following requirements:
- **npm**: Version 10.24.1
- **Python**: Version 3.11.4


## Cloning the Repository
Before making any updates or changes, ensure that you have the most current version of the repository on your local machine.

1. **Open your terminal**.
2. **Navigate to the directory** where you want to clone the repository.
3. **Clone the repository** using the following git command:
   ```bash
   git clone https://github.com/AhmedMujtabaIBM/guardium-supported-datasources-v2.git
   ```

## Starting the Application Locally
Start the application locally to verify that all functionalities are working correctly before making any data changes.

1. **Install all dependencies**:
   ```bash
   npm install
2. **Start the project locally**:
   ```bash
   npm start
   ```

## Replacing CSV Files
To update the compatibility data, the old CSV files need to be replaced with the new ones. Follow these steps:

1. **Locate the old CSV file** in the directory `/consolidation-script2/data/input`.
2. **Replace the old CSV** with the new one ensuring that the file names remain consistent to avoid script errors.

## Running Consolidation Scripts
After replacing the CSV files, a consolidation script must be run to consolidate and integrate the changes.

1. In a different terminal, navigate to the directory where the script is located: `./consolidation-script2`.
   ```bash
   cd consolidation-script2
   ```
2. Run the consolidation script using Python3:
   ```bash
   python3 run_all.py ./config
   ```
## Restarting the Application Locally
After running the consolidation script, it's necessary to stop and restart the application to ensure that all updates are properly applied and functioning.

### Steps:
1. **Stop the running application**:
   - In the first terminal, press `Ctrl+C` (on Mac) to stop the npm process.
   
2. **Restart the application**:
   ```bash
   npm start
   ```


## Deploying the Application to GitHub Pages
After updating the CSV files, running the consolidation script and checking your changes, the next step is to deploy the updated content to GitHub Pages. This step ensures that all changes are reflected on your live website.

### Steps:
1. **Navigate to the root directory** of your GitHub project where your GitHub Pages content is managed.
2. **Deploy the updates** by running the following command in your terminal:
   ```bash
   npm run deploy
   ```
   This command will push the changes to the `gh-pages` branch of your GitHub repository, updating the live site.

3. **Verify the deployment**:
   - Check your GitHub repository to confirm that the `gh-pages` branch has received the updates.
   - Visit your GitHub Pages URL to see the changes in action.

Following these steps will make your updates live

## Pushing Changes back to Main Branch

After deploying your updates to GitHub Pages, it's important to ensure that all changes are also committed and pushed to the main branch of your GitHub repository. This keeps your repository's main branch up-to-date with the latest changes.

### Steps:
1. **Navigate to your project's root directory** in your terminal.
2. **Add all changed files to the staging area**:
   ```bash
   git add .
   ```
3. **Commit the changes**:
   ```bash
   git commit -m "Updated data and deployed changes"
   ```
   Replace `"Updated data and deployed changes"` with a more descriptive message if necessary.
4. **Push the changes** to the main branch:
   ```bash
   git push origin main
   ```
   Ensure you are pushing to the correct branch that your team uses for ongoing development (often called `main` or `master`).

By following these steps, you ensure that all changes are safely stored in your repository and accessible to other team members or for future reference.
