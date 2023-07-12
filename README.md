# LIRA - Links to Jira from Github

This is a developer created Chrome Extension that looks for Jira ticket numbers in Github and turns them into links that go to the Jira ticket. It’s really useful since we have to jump between Github and Jira quite often, but we don’t require that developers give links to Jira tickets on their PRs.

### Current Linking Capabilities:

* Pull Request List
* Pull Request Title
* Commits List
* Individual Commits

#### Installing Lira on Chrome

This is a Chrome Extension, but it is not hosted on the Chrome store, so to install there are some manual steps.

1. Download the `lira-1.0.zip`. Open the zip and save the folder somewhere.
2. In Chrome, go to chrome://extensions/
3. In the top right, click "Developer Mode"
4. Click "Load Unpacked" in the top left
5. Find the Lira folder and select it
6. You should see the extension load and working on Sailpoint Github repos

#### Lira Ownership

Lira was originally created by Mitch Birti who is no longer at SailPoint. Since his departure, the extension has not been maintained or owned by any one team.

#### Contributing to Lira

1. Clone this repository
2. Create your branch and make the changes
3. `npm install`
4. The main code is in `github.js` file. Make the edits you want to in this file.
5. Go to chrome://extensions/
6. Click "Load Unpacked" in the top left and select this `lira` folder with your changes
7. Test out your changes. If you need to make further changes, repeat steps 4 to 6.
8. Once you are confident in your changes, run `npm run pack`. This will package the extension as a zip file into `web-ext-artifacts/lira-1.0.zip`
9. Push up your changes to the repo via a PR

