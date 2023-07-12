/*jshint esversion: 6 */

// Based on code from jefgen/github-jira-linkifier-webextension

(function () {
  "use strict";

  // Set to true to enable logging output for debugging.
  const debugOutput = false;

  function logger(param) {
    if (debugOutput) { console.log(param); }
  }

  const jiraIssueRegex = "[A-Z]{2,}\-[0-9]+";
  const jiraUrl = "https://sailpoint.atlassian.net";

  const jiraRegexGlobal = new RegExp("(" + jiraIssueRegex + ")", "g");
  const jiraRegexSingle = new RegExp(jiraIssueRegex, "");

  // watch for partial page reloads
  const observer = new MutationObserver(function(mutations, observer) {
    logger("Observer fired, relinking...");
    observer.takeRecords();
    observer.disconnect();
    linkAll();
  });

  function unlinked(element, urlToLookFor) {
    return element && element.innerHTML.indexOf(urlToLookFor) == -1;
  }

  function init() {
    logger("LiraLinker™ loaded!");

    try {
      linkAll();
    } catch (err) {
      logger(err);
    }
  }

  function linkAll() {

    let path = document.location.pathname;

    // list of all PRs
    if (path.endsWith("/pulls")) {
      linkPRListPage();
    }

    // single PR
    if(path.match(/\/pull\/[0-9]+/)) {
      linkPRPage();
    }

    // viewing a list of commits
    if(path.match(/\/commits/)) {
      linkCommitList();
    }

    // viewing a commit
    if(path.match(/\/commit?\/[a-f0-9]{40}/)) {
      // viewing a single commit, maybe in a PR
      linkPRPage();
      linkCommits();
    }

    startObserver();
  }

  function startObserver() {
    let content = document.querySelector("body");
    observer.observe(content, {childList: true, subtree: true});
  }

  // Link titles on the PR list page
  function linkPRListPage() {
    logger("Linking PR list page...");

    let prLinks = document.querySelectorAll("a[data-hovercard-type='pull_request']");

    prLinks.forEach(link => linkifyAnchor(link));
  }

   // Link items on a specific PR's page
   function linkPRPage() {
    logger("Linking PR page...");

    // PR title
    const detailsPageTitle = document.querySelectorAll('.gh-header-title .js-issue-title');
    detailsPageTitle.forEach(title => linkifyElementChildren(title));

    // PR title when you've scrolled down the page a bit
    const detailsPageScrollTitle = document.querySelectorAll('.sticky-content .js-issue-title');
    detailsPageScrollTitle.forEach(title => linkifyAnchor(title));
  }

  function linkCommitList() {
    logger("Linking commit list...");
    const commitListItems = document.querySelectorAll('.js-commits-list-item');
    
    commitListItems.forEach(commitListItem => {
      const titleLink = commitListItem.querySelector('.markdown-title');
      linkifyAnchor(titleLink);
    });
  }

  // Links commit rows, on whatever page may have them
  function linkCommits() {
    logger("Linking commits on page...");
    
    const commitTitles = document.querySelectorAll('.commit-title');
    if (!commitTitles) {
      logger("No commits found on page");
      return;
    }

    commitTitles.forEach(commitTitle => linkifyElementChildren(commitTitle));
  }

  // Linkifies text in an anchor, preserving the original link for text that isn't a Jira issue name
  function linkifyAnchor(anchor) {
    let anchorClass = anchor.getAttribute('class');
    if (anchorClass && anchorClass.includes('lira-link')) {
      logger('Already linked with LIRA.');
      return;
    }

    if (anchor.childNodes.length != 1 && anchor.childNodes.item(0).nodeType != Node.TEXT_NODE) {
      logger("Attempted to linkify anchor whith more than one child node, or a child that is not a text node");
      return;
    }

    let childStrings = anchor.childNodes.item(0).textContent.split(jiraRegexGlobal);

    let newChildren = childStrings.filter(str => str != '').map(function(str) {
      if (str.match(jiraRegexSingle)) {
        return buildJiraAnchor(str);
      }

      let newAnchor = anchor.cloneNode();
      newAnchor.removeAttribute('id');
      newAnchor.appendChild(document.createTextNode(str));
      return newAnchor;
    });

    anchor.replaceWith(...newChildren);
  }

  // Linkifies text node children of an element
  function linkifyElementChildren(element) {
    let newNodes = Array.from(element.childNodes).flatMap(function(childNode) {
      if (childNode.nodeType != Node.TEXT_NODE) {
        return childNode;
      }

      let strings = childNode.textContent.split(jiraRegexGlobal);

      return strings.filter(str => str != '').map(function(str) {
        if (str.match(jiraRegexSingle)) {
          return buildJiraAnchor(str);
        }
        return document.createTextNode(str);
      });
    });

    Array.from(element.childNodes).forEach(function(child) { child.remove() });

    newNodes.forEach(function(newNode) {
      element.appendChild(newNode);
    });
  }

  // builds an anchor tag to a Jira issue
  function buildJiraAnchor(jiraIssue) {
    const anchor = document.createElement('a');
    anchor.innerText = jiraIssue;
    anchor.setAttribute('href', jiraUrl + "/browse/" + jiraIssue);
    anchor.setAttribute('title', jiraIssue);
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('class', 'lira-link');
    logger("Link has been built");
    return anchor;
  }

  init();
})();
