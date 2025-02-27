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

- **NPM**: Version 8.19.2
- **Node**: Version 16.18.1
- **Python**: Version 3.11.4
- **Repository Access**: Ensure that you have **write access** to the repository. If you do not have the necessary permissions, please contact Devan to request access.

## Cloning the Repository

Before making any updates or changes, ensure that you have the most current version of the repository on your local machine.

1. **Open your terminal**.
2. **Navigate to the directory** where you want to clone the repository.
3. **Clone the repository** using the following git command:
   ```bash
   git clone git@github.com:IBM/guardium-supported-datasources.git
   ```
4. **Create a new branch from the main branch**:
   ```bash
   git checkout -b your-branch-name
   ```

## Starting the Application Locally

Start the application locally to verify that all functionalities are working correctly before making any data changes.

1. **Install all dependencies**:
   ```bash
   npm install
   ```
2. **Start the project locally**:
   ```bash
   npm run start
   ```

## Replacing CSV Files

To update the compatibility data, the old CSV files need to be replaced with the new ones. Follow these steps:

1. **Locate the old CSV file** in the directory `/consolidation-script2/data/input`.
2. **Replace the old CSV** with the new one ensuring that the file names remain consistent to avoid script errors.

## Running Consolidation Scripts

After replacing the CSV files, a consolidation script must be run to consolidate and integrate the changes.

1. Run the consolidation script using Python3:
   ```bash
   python3 consolidation-script2/runner.py ./consolidation-script2/config
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

After updating the CSV files, running the consolidation script, and verifying your changes, you need to push your changes to a new branch and create a Pull Request (PR) to merge them into main. Once the PR is merged, you can update your local main branch and deploy the changes to GitHub Pages.

### Steps:

1. **Commit your changes and push them to the new branch**:

   ```bash
   git add .
   git commit -m "describe your changes here"
   git push origin your-branch name
   ```

2. **Create a Pull Request**:

   - Go to your repository on GitHub.
   - Navigate to the "Pull Requests" tab and click "New Pull Request."
   - Select your branch and compare it with main.
   - Submit the PR for review.

3. **Merge the PR**:

   - Once the PR is approved, merge into main

4. **Update your local main branch**:

   ```bash
   git checkout main
   git pull origin main
   ```

5. **Run the consolidation script using Python3**:
   ```bash
   python3 consolidation-script2/runner.py ./consolidation-script2/config
   ```

6. **Build the app** by running the following command in your terminal:

   ```bash
   npm run build
   ```

7. **Deploy the updates** by running the following command in your terminal:

   ```bash
   npm run deploy
   ```

   This command will push the changes to the `gh-pages` branch of your GitHub repository, updating the live site.

8. **Verify the deployment**:
   - Check your GitHub repository to confirm that the `gh-pages` branch has received the updates.
   - Visit your GitHub Pages URL to see the changes in action (This can take upto 30 mins to come into effect).
