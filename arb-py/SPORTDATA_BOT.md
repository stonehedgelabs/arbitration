# SportsData.io Account and API Key Setup Workflow

This document outlines the three-step process for generating a DuckDuckGo email alias, creating a SportsData.io account, and obtaining the free API trial key.

---

## Step 1: Generating DuckDuckGo Email Alias

1.  **Navigate** to the DuckDuckGo Autofill settings page:
    -   **URL**: `https://duckduckgo.com/email/settings/autofill`
2.  **Click** the button to generate a new alias:
    -   **Type**: `submit-button`
    -   **Element**:
        ```html
        <button class="NewButton AutofillSettingsPanel__GeneratorButton">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">...</svg>
            Generate Private Duck Address
        </button>
        ```
3.  The new email alias should be **copied to the clipboard** automatically.
4.  **Record** the new alias in the `"accounts.tsv"` file:
    -   **Email**: The alias copied from the clipboard.
    -   **EmailCreatedAt**: The current UTC timestamp.

---

## Step 2: Creating SportsData.io Account

**Start URL**: `https://sportsdata.io/user/register`

Fill out the following fields on the registration form:

| Field | Type | Value | Element |
| :--- | :--- | :--- | :--- |
| **First Name** | `text-input` | `{RANDOM_FIRST_NAME}` | `<input name="FirstName" autocomplete="off" autofocus="autofocus" class="form-control" data-val="true" data-val-required="The First Name field is required." id="Registration_FirstName" requried="required" type="text" value="">` |
| **Last Name** | `text-input` | `{RANDOM_LAST_NAME}` | `<input name="LastName" autocomplete="off" autofocus="autofocus" class="form-control" data-val="true" data-val-required="The Last Name field is required." id="Registration_LastName" requried="required" type="text" value="">` |
| **Email** | `text-email` | `{DUCK EMAIL ALIAS}` | `<input name="Email" autocomplete="off" class="form-control" data-val="true" data-val-required="The Email field is required." id="Registration_Email" requried="required" type="email" value="">` |
| **Password** | `text-password` | `Password12345*` | `<input name="Password" autocomplete="off" class="form-control" data-val="true" data-val-length="Your password must be between 6 and 20 characters." data-val-length-max="20" data-val-length-min="6" data-val-required="The Password field is required." id="Registration_Password" requried="required" type="password" value="">` |
| **Confirm Password** | `text-password` | `Password12345*` | `<input name="ConfirmPassword" autocomplete="off" class="form-control" data-val="true" data-val-required="The Confirm Password field is required." id="Registration_ConfirmPassword" requried="required" type="password" value="">` |
| **Agree to Terms (Checkbox)** | `radio-button` | `Yes/True` | `<input id="AgreedToTerms" name="AgreedToTerms" type="checkbox" value="true">` |
| **Hidden Field** | `radio-button` | `Not sure (it's hidden)` | `<input name="AgreedToTerms" type="hidden" value="false" autocomplete="off">` |

**Submit** the registration form:

-   **Type**: `submit-button`
-   **Element**: `<button id="submitButton" type="submit" class="btn fd-btn fd-btn-blue">Create Account</button>`

---

## Step 3: Setting Up SportsData.io API Free Trial

**Start URL**: `https://sportsdata.io/free-trial`

### 3.1. Select Sports

1.  **Click** on the images for all desired sports. The element details are for the surrounding `div`.

| Sport | Type | Element (Partial) | Selector |
| :--- | :--- | :--- | :--- |
| **NFL** | `click` | `<div ng-repeat="league in vm.ViewModel.Leagues" class="league-wrap ng-scope selected" ...><div class="league-name ng-binding">NFL</div></div>` | `body > div.fd-body > div > div.fd-content > main > div > div > div > div > div:nth-child(2) > div.league-selection-wrap > div.league-selection > div:nth-child(1)` |
| **MLB** | `click` | `<div ng-repeat="league in vm.ViewModel.Leagues" class="league-wrap ng-scope selected" ...><div class="league-name ng-binding">MLB</div></div>` | `body > div.fd-body > div > div.fd-content > main > div > div > div > div > div:nth-child(2) > div.league-selection-wrap > div.league-selection > div:nth-child(2)` |
| **NBA** | `click` | `<div ng-repeat="league in vm.ViewModel.Leagues" class="league-wrap ng-scope selected" ...><div class="league-name ng-binding">NBA</div></div>` | `body > div.fd-body > div > div.fd-content > main > div > div > div > div > div:nth-child(2) > div.league-selection-wrap > div.league-selection > div:nth-child(3)` |
| **NHL** | `click` | `<div ng-repeat="league in vm.ViewModel.Leagues" class="league-wrap ng-scope selected" ...><div class="league-name ng-binding">NHL</div></div>` | `body > div.fd-body > div > div.fd-content > main > div > div > div > div > div:nth-child(2) > div.league-selection-wrap > div.league-selection > div:nth-child(4)` |
| **GOLF** | `click` | `<div ng-repeat="league in vm.ViewModel.Leagues" class="league-wrap ng-scope selected" ...><div class="league-name ng-binding">Golf</div></div>` | `body > div.fd-body > div > div.fd-content > main > div > div > div > div > div:nth-child(2) > div.league-selection-wrap > div.league-selection > div:nth-child(7)` |
| **SOCCER** | `click` | `<div ng-repeat="league in vm.ViewModel.Leagues" class="league-wrap ng-scope selected" ...><div class="league-name ng-binding">Soccer</div></div>` | `body > div.fd-body > div > div.fd-content > main > div > div > div > div > div:nth-child(2) > div.league-selection-wrap > div.league-selection > div:nth-child(9)` |

2.  **Click** to continue:
    -   **Type**: `click`
    -   **Element**: `<button class="btn step-nav-btn continue" ng-click="vm.ViewModel.Form.Step = 2" ng-disabled="vm.ViewModel.Form.Leagues.length == 0">Continue</button>`
    -   **Selector**: `body > div.fd-body > div > div.fd-content > main > div > div > div > div > div:nth-child(2) > div.league-selection-wrap > div.step-nav > div:nth-child(3) > button`

### 3.2. Select Feeds

3.  On the next page, **click** the label for each of the following feed types. Clicking the label should enable the toggle input.

| Feed Type | Type | Element (Partial) | Selector |
| :--- | :--- | :--- | :--- |
| **Competition Feeds** | `click` | `<label ng-click="vm.ToggleFeedType(feed_type.CoverageTierID)"><input type="checkbox" ng-checked="feed_type_checked" checked="checked"><span class="ng-binding">Competition Feeds</span></label>` | `body > div.fd-body > div > div.fd-content > main > div > div > div > div > div.step.ng-binding > ul > li:nth-child(1) > div > div > label` |
| **Event Feeds** | `click` | `<label ng-click="vm.ToggleFeedType(feed_type.CoverageTierID)"><input type="checkbox" ng-checked="feed_type_checked"><span class="ng-binding">Event Feeds</span></label>` | `body > div.fd-body > div > div.fd-content > main > div > div > div > div > div.step.ng-binding > ul > li:nth-child(2) > div > div > label` |
| **Player Feeds** | `click` | `<label ng-click="vm.ToggleFeedType(feed_type.CoverageTierID)"><input type="checkbox" ng-checked="feed_type_checked"><span class="ng-binding">Player Feeds</span></label>` | `body > div.fd-body > div > div.fd-content > main > div > div > div > div > div.step.ng-binding > ul > li:nth-child(3) > div > div > label` |
| **Betting Feeds** | `click` | `<label ng-click="vm.ToggleFeedType(feed_type.CoverageTierID)"><input type="checkbox" ng-checked="feed_type_checked"><span class="ng-binding">Betting Feeds</span></label>` | `body > div.fd-body > div > div.fd-content > main > div > div > div > div > div.step.ng-binding > ul > li:nth-child(4) > div > div > label` |
| **News & Images** | `click` | `<label ng-click="vm.ToggleFeedType(feed_type.CoverageTierID)"><input type="checkbox" ng-checked="feed_type_checked"><span class="ng-binding">News &amp; Images</span></label>` | `body > div.fd-body > div > div.fd-content > main > div > div > div > div > div.step.ng-binding > ul > li:nth-child(6) > div > div > label` |

4.  **Click** to continue:
    -   **Type**: `click`
    -   **Element**: `<button class="btn step-nav-btn continue" ng-click="vm.ViewModel.Form.Step = 3">Continue</button>`
    -   **Selector**: `body > div.fd-body > div > div.fd-content > main > div > div > div > div > div.step.ng-binding > div.step-nav > div:nth-child(3) > button`

### 3.3. Finalize Signup

5.  Finalize signup on the next page:
    1.  **Decline** sales assistance:
        -   **Type**: `click`
        -   **Element**: `<input name="SalesAssistanceRequested" id="Form_SalesAssistanceRequested" type="radio" value="False">`
        -   **Selector**: `#Form_SalesAssistanceRequested`
    2.  **Accept** the terms of usage:
        -   **Type**: `click`
        -   **Element**: `<input id="AgreedToTerms" name="AgreedToTerms" type="checkbox" value="true">`
        -   **Selector**: `#AgreedToTerms`
    3.  **Click** "Finish":
        -   **Type**: `click`
        -   **Element**: `<button class="btn step-nav-btn continue" type="submit">Finish</button>`
        -   **Selector**: `#fd-form > div.step-nav > div:nth-child(3) > button`

### 3.4. Retrieve and Record API Key

6.  Once API access is created, you'll be taken back to the URL `https://sportsdata.io/free-trial`.
7.  **Navigate** to the subscriptions page:
    -   **URL**: `https://sportsdata.io/members/subscriptions`
8.  **Copy** the API key from this page:
    -   **Type**: `click`
    -   **Element**:
        ```html
        <a ng-click="vm.copy_api_key('d4cc912806fc4f838b4842969fc7ed0e')" style="cursor: pointer;">
            <i class="fa-sharp fa-regular fa-copy" aria-hidden="true"></i>
            Copy Key
        </a>
        ```
    -   **Selector**: `body > div.fd-body > div > div.fd-content > main > div > div > div.members-content.has-page-nav > div > div.subscriptions > div > div.subscription-body > div > div > table:nth-child(1) > tbody > tr > td:nth-child(2) > div > a`
9.  The API key should now be **copied to the clipboard**.
10. **Open** the `"accounts.tsv"` file and find the line with the matching email from Step 2.
11. **Update** this line with the following new data:
    -   **SDAccountCreatedAt**: Current UTC timestamp.
    -   **SDApiKey**: The API key copied to the clipboard.