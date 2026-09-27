# Contributing to RankPilot

Thank you for considering contributing to RankPilot.

## Where do I go from here?

If you find a bug or have a feature request, check the repository's Issues page before opening a new ticket.

## Fork & create a branch

Fork RankPilot and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```bash
git checkout -b 325-add-keyword-density-check
```

## Get the test suite running

Make sure you have Node.js installed. We recommend the latest LTS version.

```bash
npm install
npm run dev
```

## Make your changes

Make your changes in your branch, ensuring you follow our coding style guidelines. We use ESLint to maintain code quality. You can check your code by running:

```bash
npm run lint
```

## Commit your changes

Make sure your commit messages are descriptive.

```bash
git commit -m "feat: add keyword density checker component (#325)"
```

## Push to your fork

```bash
git push origin 325-add-keyword-density-check
```

## Create a Pull Request

At this point, you should go back to your fork on GitHub and create a pull request. Please ensure that your pull request description clearly describes the problem and solution. Include the relevant issue number if applicable.

## Review Process

Once your pull request is submitted, maintainers will review your code. We may suggest some changes or improvements or alternative ways to fix the problem.

Thank you for contributing!
