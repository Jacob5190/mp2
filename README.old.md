# MP 2: New Clear REACTive App
### Due: October 7th, 2025, 11:59PM CDT

## Table of Contents
1. [Assignment](#assignment)
2. [Grading Breakdown](#grading-breakdown)
3. [Tips](#tips)
4. [Rules](#rules)
5. [Getting Started](#getting-started)
6. [Submission Details](#submission-details)

## Assignment

#### Task
In this programming assignment, you will implement a front-end interface using React that consumes an API. Please read through the entire MP before you start.

#### Requirements
Create a single-page React app that lets users interact with the data from one of the following APIs.
  - [TMDB](https://www.themoviedb.org/documentation/api)
  - [Pokemon](https://pokeapi.co/)
  - [NASA](https://api.nasa.gov/index.html)
  - [Marvel](https://developer.marvel.com/)
  - [Jelly Belly Wiki](https://jelly-belly-wiki.netlify.app/)
  - [The Meal DB](https://www.themealdb.com/api.php)
  - [Art Institute of Chicago](https://api.artic.edu/docs/) 
  - More APIs if you want to explore [here](https://publicapis.dev) (please keep it class appropriate) 🫵🤨📸.

**Note that you may need to create an account and/or acquire an API key for some of the APIs. GitHub won’t restrict you from pushing API keys, but may send an email to say some keys are exposed. Because of this, please don't use any paid APIs.**

**The API you are working with may become temporarily unavailable. If/when this happens, it doesn't mean you are blocked from working on the MP. You can mock the data, i.e. create a local hard coded response and use that instead of making the request.**

**You may need to deal with APIs having rate-limiting policies. You can find ways to get around them like caching the results of large and common API calls**

**These are also good opportunities to think about how your app should handle errors.**

Your app should have the following features:
  - **A list view**:  where users can input a query into a search bar and the app returns a list of results that match the query (i.e. searching movies or pokemon). There should also be a way to sort the search results based on different properties of the results (such as the name or rank) and of specifying an ordering (ascending and descending). Also, the search bar should filter as you type. You can sort and filter in the client side.
  - **A gallery view**: that displays some kind of image media from the chosen API (gallery of movie posters). The gallery view should also have some kind filtering attribute where users can select one or many attributes and filter the gallery by them (i.e. genres of films or music).
  -  **A detail view**: When an item in the search view or the gallery view is clicked, the app should display the different attributes of the selected item. Also, this view should have previous and next buttons (can be implemented with arrows) that lets the user cycle through the list of objects. A detail view should have a specific route when navigated to. Basically, a user should be able to access the detail route through a specific url.

Here's an old example that fulfills these requirements: https://www.youtube.com/watch?v=DmDZuAr7QJE

You will also be required to use following tools:
  - Use [React Router](https://reactrouter.com/web/guides/quick-start) for routing.
  - Use [Axios](https://www.npmjs.com/package/axios) for API calls.
  - Use [TypeScript](https://www.typescriptlang.org/docs/handbook/react.html).

## Grading Breakdown
Total Points : 100

List View:
  - Does the list view display relevant items from the chosen API ? (4 points)
  - Does the search bar filter down items based on the search? (8 points)
  - Can you sort by at least 2 properties?  (8 points)
  - Can the properties be sorted in Ascending and Descending order?  (8 points)

Gallery View:
  - Is the gallery composed of item media?  (4 points)
  - Does clicking on a filter change results accordingly?  (8 points)

Details View:
  - Does clicking on an item in List View take you to the Details View?  (10 points)
  - Does clicking on an item in Gallery View take you to the Details View?  (10 points)
  - Does the Details View contain item details?  (8 points)
  - Do the PREVIOUS and NEXT buttons work correctly?  (10 points)

Other:
  - Does the implementation use React Router and TypeScript?  (12 points)
  - Design (10 points)

## Tips
  - Start early! This is first MP that uses React so start ahead.
  - Visit https://reactjs.org/docs/faq-structure.html for examples on how to structure your React files.
  - You may use a React component library for this MP.
  - We recommend using [Normalize.css](https://necolas.github.io/normalize.css/).
  - We recommend using [CSS Modules](https://blog.bitsrc.io/how-to-use-sass-and-css-modules-with-create-react-app-83fa8b805e5e).

## Rules
1. This is an individual assignment. No collaboration is permitted.
2. It is not permitted to copy/paste code that is not your own. You are, however, free to look at different code sources for inspiration and clarity. All sources (code as well as reading material) that you reference to complete this assignment must be declared in the submission.
3. There should be no use of inline styling.
4. No inline script tags should be used.
5. HTML tables cannot be used for layout.
6. If you think something you’re doing might not be acceptable, please ask on Piazza.
7. We *strongly* recommend using `Create React App` to get your MP started. If you ignore this, we will not help with any environment issues.

## Getting Started
1. Use `Create React App` (CRA) (see below) to generate your MP starter code in a directory of your choice.
2. After running `npm start` open a browser and go to `http://localhost:3000/` to view your page.
3. Open up `src/app.js` to start building your first component. Visit https://reactjs.org/docs/getting-started.html for many official, high quality resources to help get you started.

### Create React App
`create-react-app` is a tool that allows you to generate a react starter project that requires no immediate configuration. Visit the [getting started guide](https://facebook.github.io/create-react-app/docs/getting-started) to read more. You should use `create-react-app` with the [Typescript template](https://create-react-app.dev/docs/getting-started/#creating-a-typescript-app).

You may be wondering how the command `npx create-react-app my-app --template typescript` works and why there is no installation step. Click [here](https://www.bram.us/2017/07/15/introducing-npx-an-npm-package-runner/) for an explanation of `npx`.


## Submission Details

Here's what you will need to submit:
1. Clone the repository `git clone git@github.com:cs409-fa25/mp2.git`
2. On local machine, run `npx create-react-app mp2 --template typescript` to create starter code and `cd mp2` to enter into React app directory. The `create-react-app` will set up the git environment for you.
  - If it doesn't work becausee the folder exists, instead, make the react app in a different directory and copy it over into this repo OR copy the `.github` folder and all files within to your created React project.
4. Add `"homepage": "https://<your-github-username>.github.io/<your-github-repo-name>"` to your `package.json`
```
{
  "name": "your-app-name",
  "version": "0.1.0",
  "private": true,
  "homepage": "https://<your-github-username>.github.io/<your-github-repo-name>",
  //...
}
```
4. In your `BrowserRouter` or `Router` component, set `basename="/<your-github-repo-name>"`
```
<BrowserRouter basename="/<your-github-repo-name>">
  ...
</BrowserRouter>
```
  - Note: Should use `<Link/>` component instead of `<a>` to have the same basename.
3. [Create a public repository on GitHub.](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository) Make sure "Initialize this repository with a README" is **not** checked.
4. Set GitHub Pages Deployment Source to Github Actions
   - In your Github repo, go to Settings > Pages > Build and Deployment > Source > Select "GitHub Actions"
5. Change the remote url for your local mp2 directory to the url of the new public repository you created.
```
git remote rename origin old-origin
git remote add origin git@github.com:<your-github-username>/mp2.git
# run `git remote -v` to check your origin 
```
6. Commit and push your local changes to this new repository.
```
git add . # "." adds all changed files, can also add specific files too
git commit -m "[my-commit-message]" # message should be clear and meaningful
git branch -M main
git push origin main
```
7. `.github/workflows/deploy.yml` file automatically makes a GitHub CI pipeline run to deploy your code. After the pipeline finishes, your site should be live at `https://<your-github-username>.github.com/mp2`. **It should take around 1 minute.**
8. Make a video (3 minutes max) demo-ing your deployed website and upload it to Google Drive. Share it with `uiuc.web.programming@gmail.com` and put the share link in the Google form.
- Show the url to prove you are on your deployed website. Then show all the requirement features you fulfilled in your mp.
- If you were unable to deploy your website, you can demo your mp locally for some point deduction (hard capped at 80%)
  - Just make sure you do `git status` and `git log` first so we can see your last edits.
9. Fill out and submit the form [here](https://forms.gle/E7qr5MbSnxFCLpaV7).


